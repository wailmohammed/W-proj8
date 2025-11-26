import os
import jwt
import hashlib
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends
from functools import wraps

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

# Mock user database (in production, use a real DB)
USERS_DB = {
    "demo@example.com": {
        "id": "user_1",
        "email": "demo@example.com",
        "password_hash": hashlib.sha256("password123".encode()).hexdigest(),
        "subscription": "premium",
        "created_at": "2025-11-01",
        "crypto_wallet": None
    }
}

SUBSCRIPTION_TIERS = {
    "free": {
        "price": 0,
        "features": ["basic_price", "basic_dividends", "limited_history"],
        "limits": {"api_calls_per_day": 100, "tickers": 5}
    },
    "premium": {
        "price": 9.99,
        "features": ["dividend_safety", "analytics", "capture_strategy", "tax_calculator"],
        "limits": {"api_calls_per_day": 1000, "tickers": 50}
    },
    "elite": {
        "price": 29.99,
        "features": ["dividend_safety", "analytics", "capture_strategy", "tax_calculator", "portfolio_tracking", "alerts"],
        "limits": {"api_calls_per_day": 10000, "tickers": 500}
    }
}

def create_access_token(user_id: str, email: str):
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS),
        "iat": datetime.utcnow()
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
