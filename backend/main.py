from fastapi import FastAPI, Query, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from data_provider import DataProvider, CURRENT_PROVIDER
from cache import CACHING_ENABLED
from auth import create_access_token, verify_token, USERS_DB, SUBSCRIPTION_TIERS
from analytics import calculate_dividend_safety_score, calculate_dividend_capture_strategy, calculate_portfolio_analytics
import uvicorn
from dotenv import load_dotenv
import os
import logging
import pathlib
import hashlib

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="W-proj8 API", version="2.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str

class DividendSafetyRequest(BaseModel):
    ticker: str
    payout_ratio: float
    earnings_growth: float = 5.0
    debt_to_equity: float = 0.5

class CaptureStrategyRequest(BaseModel):
    ticker: str
    ex_dividend_date: str
    dividend_amount: float
    current_price: float
    holding_period_days: int = 60

# Define API routes FIRST before mounting static files



@app.post("/api/auth/register")
async def register(request: LoginRequest):
    """Register a new user"""
    logger.info(f"POST /api/auth/register - {request.email}")
    if request.email in USERS_DB:
        raise HTTPException(status_code=400, detail="User already exists")
    
    password_hash = hashlib.sha256(request.password.encode()).hexdigest()
    user_id = f"user_{len(USERS_DB) + 1}"
    
    USERS_DB[request.email] = {
        "id": user_id,
        "email": request.email,
        "password_hash": password_hash,
        "subscription": "free",
        "created_at": "2025-11-26",
        "crypto_wallet": None
    }
    
    token = create_access_token(user_id, request.email)
    return {"access_token": token, "token_type": "bearer", "subscription": "free"}

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    """Login user"""
    logger.info(f"POST /api/auth/login - {request.email}")
    if request.email not in USERS_DB:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = USERS_DB[request.email]
    password_hash = hashlib.sha256(request.password.encode()).hexdigest()
    
    if user["password_hash"] != password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(user["id"], request.email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "subscription": user["subscription"],
        "user_id": user["id"]
    }

@app.get("/api/auth/me")
async def get_user(token: str = Query(None)):
    """Get current user info"""
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    
    payload = verify_token(token)
    email = payload.get("email")
    user = USERS_DB.get(email)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "user_id": user["id"],
        "email": user["email"],
        "subscription": user["subscription"],
        "created_at": user["created_at"]
    }

@app.get("/api/subscription/plans")
async def get_subscription_plans():
    """Get all available subscription plans"""
    logger.info("GET /api/subscription/plans")
    return {"plans": SUBSCRIPTION_TIERS}

@app.post("/api/subscription/upgrade")
async def upgrade_subscription(tier: str, token: str = Query(None)):
    """Upgrade user subscription"""
    logger.info(f"POST /api/subscription/upgrade - {tier}")
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    
    if tier not in SUBSCRIPTION_TIERS:
        raise HTTPException(status_code=400, detail="Invalid subscription tier")
    
    payload = verify_token(token)
    email = payload.get("email")
    user = USERS_DB.get(email)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user["subscription"] = tier
    return {"message": f"Upgraded to {tier}", "subscription": tier}

@app.post("/api/dividend/safety-score")
async def dividend_safety(request: DividendSafetyRequest, token: str = Query(None)):
    """Calculate dividend safety score for a ticker"""
    logger.info(f"POST /api/dividend/safety-score - {request.ticker}")
    if token:
        payload = verify_token(token)
        user = USERS_DB.get(payload.get("email"))
        if user and user["subscription"] == "free":
            raise HTTPException(status_code=403, detail="Premium feature required")
    
    safety = calculate_dividend_safety_score(
        payout_ratio=request.payout_ratio,
        earnings_growth=request.earnings_growth,
        debt_to_equity=request.debt_to_equity
    )
    return safety

@app.post("/api/dividend/capture-strategy")
async def capture_strategy(request: CaptureStrategyRequest, token: str = Query(None)):
    """Analyze dividend capture strategy"""
    logger.info(f"POST /api/dividend/capture-strategy - {request.ticker}")
    if token:
        payload = verify_token(token)
        user = USERS_DB.get(payload.get("email"))
        if user and user["subscription"] == "free":
            raise HTTPException(status_code=403, detail="Premium feature required")
    
    strategy = calculate_dividend_capture_strategy(
        ticker=request.ticker,
        ex_dividend_date=request.ex_dividend_date,
        dividend_amount=request.dividend_amount,
        current_price=request.current_price,
        holding_period_days=request.holding_period_days
    )
    return strategy

@app.post("/api/payment/crypto")
async def process_crypto_payment(crypto_type: str, amount: float, token: str = Query(None)):
    """Process cryptocurrency payment"""
    logger.info(f"POST /api/payment/crypto - {crypto_type} {amount}")
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    
    payload = verify_token(token)
    email = payload.get("email")
    user = USERS_DB.get(email)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Mock payment processing
    if crypto_type not in ["bitcoin", "ethereum"]:
        raise HTTPException(status_code=400, detail="Unsupported crypto type")
    
    return {
        "status": "pending",
        "transaction_id": f"tx_{user['id']}_{int(__import__('time').time())}",
        "crypto_type": crypto_type,
        "amount": amount,
        "wallet_address": "1A1z7agoat3ws..."  # Mock address
    }

@app.get("/api/portfolio/analytics")
async def portfolio_analytics(token: str = Query(None)):
    """Get advanced portfolio analytics"""
    logger.info("GET /api/portfolio/analytics")
    if token:
        payload = verify_token(token)
        user = USERS_DB.get(payload.get("email"))
        if user and user["subscription"] == "free":
            raise HTTPException(status_code=403, detail="Premium feature required")
    
    # Mock portfolio data
    mock_holdings = [
        {"symbol": "AAPL", "shares": 10, "currentPrice": 276.97, "dividendYield": 0.5, "payoutRatio": 23, "earningsGrowth": 8},
        {"symbol": "JNJ", "shares": 5, "currentPrice": 150.0, "dividendYield": 3.0, "payoutRatio": 45, "earningsGrowth": 6}
    ]
    
    analytics = calculate_portfolio_analytics(mock_holdings)
    return analytics


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
