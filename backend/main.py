import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import logging configuration
from src.utils.logging_config import setup_logging
from src.routes.scrape_routes import router as scrape_router
from src.routes.system_routes import router as system_router
from src.middleware.logging_middleware import LoggingMiddleware

# Initialize logging
setup_logging()
logger = logging.getLogger("fastapi")


app = FastAPI(
    title="Scraping Agent API",
    description="Production-level API for structured data extraction from websites and PDFs.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom logging middleware
app.add_middleware(LoggingMiddleware)

# Include Routers
app.include_router(system_router)
app.include_router(scrape_router)

if __name__ == "__main__":
    import uvicorn
    # Use reload for development
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
