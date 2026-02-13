import time
from fastapi import APIRouter
from src.services.scraper import crawl_site
from src.services.extractor import extract_fields_llm


router = APIRouter(tags=["System"])

@router.get("/health")
def health_check():
    """Service health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "modules_loaded": all([crawl_site, extract_fields_llm])
    }

@router.get("/")
def root():
    return {"message": "Scraping Agent API is online", "docs": "/docs"}
