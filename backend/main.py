import os
import sys
import logging
import time
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Import logging configuration
from logging_config import setup_logging

# Initialize logging
setup_logging()
logger = logging.getLogger("fastapi")

# Load environment variables
load_dotenv()
# Also look in the sibling directory where the original agent lives
agent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ScarppingAgent'))
agent_env = os.path.join(agent_dir, '.env')
if os.path.exists(agent_env):
    load_dotenv(agent_env)
    logger.info(f"Loaded environment variables from {agent_env}")

# Add ScarppingAgent directory to sys.path
if agent_dir not in sys.path:
    sys.path.append(agent_dir)
    logger.info(f"Added {agent_dir} to sys.path")

try:
    from scraper import crawl_site
    from extractor import extract_fields_llm
    from pdf_extractor import extract_pdf_text
    logger.info("Successfully imported agent modules: scraper, extractor, pdf_extractor")
except Exception as e:
    with open("init_error.log", "w") as f:
        f.write(f"Error: {str(e)}\n")
        import traceback
        f.write(traceback.format_exc())
    logger.critical(f"Failed to import agent modules. This is likely due to missing dependencies or environment variables (like OPENAI_API_KEY): {e}")
    crawl_site = None
    extract_fields_llm = None
    extract_pdf_text = None

app = FastAPI(
    title="Scraping Agent API",
    description="Production-level API for structured data extraction from websites and PDFs.",
    version="1.0.0"
)

# Configure CORS for production
# In a real production environment, you should restrict origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---

class ScrapeRequest(BaseModel):
    url: Optional[str] = Field(None, example="https://example.com")
    pdf_path: Optional[str] = Field(None, example="C:/data/document.pdf")
    source_type: str = Field("Web", example="Web") # "Web" or "PDF"
    fields: List[str] = Field(..., default_factory=list, example=["title", "price"])
    max_pages: Optional[int] = Field(5, ge=1, le=100)
    presets: List[str] = Field(default_factory=list) # ["phone", "email", "address", "socials"]

class MetaData(BaseModel):
    usage: Optional[Dict[str, Any]] = None
    model: str
    duration: float
    timestamp: float

class ScrapeResponse(BaseModel):
    data: List[Dict[str, Any]]
    meta: MetaData

# --- Endpoints ---

@app.get("/health")
def health_check():
    """Service health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "modules_loaded": all([crawl_site, extract_fields_llm, extract_pdf_text])
    }

@app.get("/")
def root():
    return {"message": "Scraping Agent API is online", "docs": "/docs"}

@app.post("/api/scrape", response_model=ScrapeResponse)
async def scrape_endpoint(request: ScrapeRequest):
    """
    Main endpoint to scrape a website or PDF and extract structured data using LLM.
    """
    if not crawl_site or not extract_fields_llm or not extract_pdf_text:
        logger.error("Agent modules not loaded. Cannot process request.")
        raise HTTPException(status_code=500, detail="Backend configuration error: Agent modules missing.")

    start_time = time.time()
    
    # Merge presets with custom fields
    final_fields = list(request.fields)
    preset_map = {
        "phone": "phone_numbers",
        "email": "emails",
        "address": "physical_address",
        "socials": "social_media_links"
    }
    for p in request.presets:
        if p in preset_map:
            final_fields.append(preset_map[p])

    if not final_fields:
        raise HTTPException(status_code=400, detail="No extraction fields provided.")

    try:
        def log_step(msg):
            logger.info(f"[Agent] {msg}")

        # 1. Get Text based on source type
        if request.source_type == "PDF":
            if not request.pdf_path:
                raise HTTPException(status_code=400, detail="pdf_path is required for PDF source.")
            logger.info(f"Extracting PDF: {request.pdf_path}")
            scraped_text = extract_pdf_text(request.pdf_path)
        else: # Web
            if not request.url:
                raise HTTPException(status_code=400, detail="url is required for Web source.")
            logger.info(f"Crawling Web: {request.url} (max pages: {request.max_pages})")
            scraped_text = crawl_site(request.url, request.max_pages, log_callback=log_step)
        
        if not scraped_text:
            logger.warning(f"No content found for {request.source_type}")
            raise HTTPException(status_code=404, detail="No content could be extracted.")

        # 2. Extract fields using LLM
        logger.info(f"Starting LLM extraction for fields: {final_fields}")
        result = extract_fields_llm(scraped_text, final_fields)
        
        extracted_data = result.get("extracted_data", {})
        
        # Ensure data is a list
        if isinstance(extracted_data, dict):
            data_list = [extracted_data]
        elif isinstance(extracted_data, list):
            data_list = extracted_data
        else:
            data_list = [{"raw_result": str(extracted_data)}]

        duration = time.time() - start_time
        return ScrapeResponse(
            data=data_list,
            meta=MetaData(
                usage=result.get("usage"),
                model=result.get("model", "unknown"),
                duration=duration,
                timestamp=time.time()
            )
        )

    except Exception as e:
        logger.exception(f"Exception during processing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(f"Method: {request.method} Path: {request.url.path} Status: {response.status_code} Duration: {duration:.2f}s")
    return response

if __name__ == "__main__":
    import uvicorn
    # Use reload for development, but in production we'd use gunicorn with uvicorn workers
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
