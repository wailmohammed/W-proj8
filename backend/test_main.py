import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestHealthEndpoint:
    def test_health_returns_200(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
        assert "provider" in data
        assert "caching" in data


class TestPriceEndpoint:
    def test_price_aapl_returns_200(self):
        response = client.get("/api/price/AAPL")
        assert response.status_code == 200
        data = response.json()
        # either has price or error
        if "ticker" in data:
            assert data["ticker"] == "AAPL"
            assert "price" in data
            assert isinstance(data["price"], (int, float))
            assert data["price"] > 0
            assert "timestamp" in data
            assert "source" in data
        else:
            assert "error" in data

    def test_price_invalid_ticker_returns_error(self):
        response = client.get("/api/price/INVALID_TICK_XYZ")
        assert response.status_code == 200
        data = response.json()
        # yfinance will fail gracefully and return error in JSON
        assert "error" in data or "ticker" in data

    def test_price_empty_ticker(self):
        response = client.get("/api/price/")
        # FastAPI will 404 since {ticker} is required
        assert response.status_code == 404


class TestHistoricalEndpoint:
    def test_historical_default_days_returns_200(self):
        response = client.get("/api/historical/AAPL")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert isinstance(data["data"], list)

    def test_historical_custom_days(self):
        response = client.get("/api/historical/AAPL?days=60")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data

    def test_historical_days_validation_min(self):
        response = client.get("/api/historical/AAPL?days=0")
        # FastAPI Query validation should reject ge=1
        assert response.status_code == 422

    def test_historical_days_validation_max(self):
        response = client.get("/api/historical/AAPL?days=9999")
        # FastAPI Query validation should reject le=3650
        assert response.status_code == 422


class TestDividendsEndpoint:
    def test_dividends_default_limit(self):
        response = client.get("/api/dividends/AAPL")
        assert response.status_code == 200
        data = response.json()
        assert "dividends" in data
        assert isinstance(data["dividends"], list)

    def test_dividends_custom_limit(self):
        response = client.get("/api/dividends/AAPL?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data["dividends"]) <= 5

    def test_dividends_limit_validation_min(self):
        response = client.get("/api/dividends/AAPL?limit=0")
        assert response.status_code == 422

    def test_dividends_limit_validation_max(self):
        response = client.get("/api/dividends/AAPL?limit=100")
        assert response.status_code == 422


class TestRootEndpoint:
    def test_root_returns_200(self):
        response = client.get("/")
        assert response.status_code == 200
        # Root can return either HTML (if frontend is built) or JSON (if not)
        content = response.text
        assert "<!doctype" in content.lower() or "message" in content


class TestDocsEndpoint:
    def test_docs_returns_200(self):
        response = client.get("/docs")
        assert response.status_code == 200
