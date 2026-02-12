# FastAPI Backend for Scraping Agent

This is the backend service for the Scraping Agent, built with FastAPI. It integrates with the existing `ScarppingAgent` logic to provide a REST API for the `ScrappingWebsite` frontend.

## Project Structure

- `main.py`: The FastAPI application entry point.
- `requirements.txt`: Python dependencies.
- `Dockerfile`: Configuration for containerizing the application.

## Prerequisites

- Python 3.9+
- Google Chrome (for Selenium scraping)
- An OpenAI API Key (for extraction logic)

## Setup

1.  **Environment Variables**:
    Ensure you have a `.env` file in the `ScarppingAgent` directory or in this directory with your `OPENAI_API_KEY`.
    
    ```env
    OPENAI_API_KEY=sk-your-api-key
    ```

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
    
    *Note: This also installs `selenium`, `beautifulsoup4`, `langchain`, etc.*

3.  **Run Locally**:
    ```bash
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```

    The API will be available at `http://localhost:8000`.
    
    - Swagger UI: `http://localhost:8000/docs`
    - ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### `POST /api/scrape`

Scrapes a website and extracts structured data.

**Request Body:**

```json
{
  "url": "https://example.com",
  "fields": ["title", "description", "price"],
  "max_pages": 5
}
```

**Response:**

```json
{
  "data": [
    {
      "title": "Example Domain",
      "description": "This domain is for use in illustrative examples...",
      "price": null
    }
  ],
  "meta": {
    "usage": { ... },
    "model": "gpt-4o-mini"
  }
}
```

## Docker

To build and run with Docker:

1.  **Build**:
    ```bash
    docker build -t scraping-backend .
    ```

2.  **Run**:
    You need to mount the `ScarppingAgent` directory so the backend can access the logic, since it resides outside the `FastAPIBackend` folder.
    
    ```bash
    docker run -p 8000:8000 -v /path/to/ScarppingAgent:/app/ScarppingAgent -v /path/to/FastAPIBackend:/app scraping-backend
    ```
