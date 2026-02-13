import time
import logging
from typing import List, Dict, Any
from fastapi import HTTPException
from src.models.scrape import ScrapeRequest, ScrapeResponse, MetaData
from src.services.scraper import crawl_site
from src.services.extractor import extract_fields_llm
from src.services.pdf_extractor import extract_pdf_text

logger = logging.getLogger("fastapi")

async def process_scrape_request(request: ScrapeRequest) -> ScrapeResponse:
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
