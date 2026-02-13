from fastapi import APIRouter
from src.models.scrape import ScrapeRequest, ScrapeResponse
from src.controllers.scrape_controller import process_scrape_request

router = APIRouter(prefix="/api", tags=["Scraping"])

@router.post("/scrape", response_model=ScrapeResponse)
async def scrape_endpoint(request: ScrapeRequest):
    """
    Main endpoint to scrape a website or PDF and extract structured data using LLM.
    """
    return await process_scrape_request(request)
