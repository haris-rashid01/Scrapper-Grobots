from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ScrapeRequest(BaseModel):
    url: str = Field(..., example="https://example.com")
    source_type: str = Field("Web", example="Web")
    fields: List[str] = Field(default_factory=list, example=["title", "price"])
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
