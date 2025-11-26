from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from data_provider import DataProvider, CURRENT_PROVIDER
from cache import CACHING_ENABLED
import uvicorn
from dotenv import load_dotenv
import os
import logging
import pathlib

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="W-proj8 API", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Define API routes FIRST before mounting static files



@app.get("/api/price/{ticker}")
async def api_price(ticker: str):
    logger.info(f"GET /api/price/{ticker}")
    result = DataProvider.get_price(ticker)
    if "error" in result:
        logger.warning(f"Price fetch failed for {ticker}: {result['error']}")
    return result


@app.get("/api/historical/{ticker}")
async def api_historical(ticker: str, days: int = Query(30, ge=1, le=3650)):
    logger.info(f"GET /api/historical/{ticker}?days={days}")
    result = DataProvider.get_historical(ticker, days)
    if "error" in result:
        logger.warning(f"Historical fetch failed for {ticker}: {result['error']}")
    return result


@app.get("/api/dividends/{ticker}")
async def api_dividends(ticker: str, limit: int = Query(10, ge=1, le=50)):
    logger.info(f"GET /api/dividends/{ticker}?limit={limit}")
    result = DataProvider.get_dividends(ticker, limit)
    if "error" in result:
        logger.warning(f"Dividends fetch failed for {ticker}: {result['error']}")
    return result


@app.get("/health")
async def health():
    logger.info("Health check")
    return {"status": "healthy", "provider": CURRENT_PROVIDER, "caching": CACHING_ENABLED}


@app.get("/docs")
async def docs():
    return {"api_docs": "Use Swagger at /docs (FastAPI auto)", "dashboard": "/"}


# Serve built frontend AFTER all API routes are defined
frontend_dist = pathlib.Path(__file__).resolve().parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
    logger.info(f"Serving frontend from {frontend_dist}")
else:
    @app.get("/")
    async def root():
        return {"message": "Frontend not built. Run `npm --prefix frontend run build` to create `frontend/dist`."}
    logger.warning(f"Frontend not found at {frontend_dist}. Run 'npm --prefix frontend run build' to enable frontend serving.")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
