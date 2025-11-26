# W-proj8: Stock & Dividend Tracker

A full-stack web app that displays real-time stock prices, historical price data, and dividend information using **FastAPI** (backend), **React + Vite** (frontend), and **yfinance** (data provider).

## Features

- ✅ Real-time stock price lookup (via yfinance)
- ✅ 30-day historical price chart (Chart.js)
- ✅ Dividend history with yield estimation
- ✅ Smart caching (Redis with memory fallback)
- ✅ Responsive UI with Tailwind CSS
- ✅ API-first design with comprehensive tests (14 passing tests)
- ✅ Docker & docker-compose ready
- ✅ GitHub Actions CI for automated testing
- ✅ Auto-deploy to Railway

## Quick Start

### Prerequisites
- **Node.js** 16+ (frontend)
- **Python** 3.11+ (backend)
- **Redis** (optional; memory cache fallback included)
- **Docker** (optional; for containerized setup)

### Local Development

**1. Install backend dependencies and start the API:**
```bash
cd backend
pip install -r requirements.txt
python -m pytest test_main.py -v  # Run tests (14 tests pass)
python main.py                     # Start server (http://127.0.0.1:8000)
```

**2. In another terminal, build and run frontend:**
```bash
cd frontend
npm install
npm run build              # Build production bundle
npm run dev               # Or: start dev server with hot reload (http://localhost:5173)
```

**3. Access the app:**
- **Backend API:** http://localhost:8000
- **Backend Swagger Docs:** http://localhost:8000/docs
- **Frontend (built):** http://localhost:8000 (if backend serving)
- **Frontend (dev):** http://localhost:5173 (dev server proxies /api to :8000)

### With Docker Compose

```bash
docker-compose up --build
```

This starts:
- **App** at http://localhost:8000 (FastAPI server)
- **Redis** at http://localhost:6379 (cache backend)

## API Endpoints

### GET /health
Health check. Returns provider and cache status.
```bash
curl http://localhost:8000/health
```
Response:
```json
{
  "status": "healthy",
  "provider": "yfinance",
  "caching": true
}
```

### GET /api/price/{ticker}
Fetch current price for a stock ticker.
```bash
curl http://localhost:8000/api/price/AAPL
```
Response:
```json
{
  "ticker": "AAPL",
  "price": 276.97,
  "timestamp": "2025-11-25T00:00:00-05:00",
  "source": "yfinance"
}
```

### GET /api/historical/{ticker}?days=30
Fetch historical price data (default 30 days, max 3650).
```bash
curl "http://localhost:8000/api/historical/AAPL?days=60"
```
Response:
```json
{
  "data": [
    {
      "date": "2025-09-27T00:00:00-04:00",
      "Open": 225.5,
      "High": 226.0,
      "Low": 225.0,
      "Close": 225.8,
      "Volume": 1000000
    }
  ]
}
```

### GET /api/dividends/{ticker}?limit=10
Fetch recent dividends (default limit 10, max 50).
```bash
curl "http://localhost:8000/api/dividends/AAPL?limit=5"
```
Response:
```json
{
  "dividends": [
    {
      "date": "2025-11-14T00:00:00",
      "amount": 0.25
    }
  ]
}
```

## Environment Variables

Create `backend/.env` (copy from `backend/.env.example`):
```
CURRENT_PROVIDER=yfinance
REDIS_URL=redis://localhost:6379/0
FMP_KEY=  # Only needed if switching to FMP provider
```

## Testing

### Backend Tests
```bash
cd backend
python -m pytest test_main.py -v
```

Tests cover:
- Health endpoint
- Price endpoint (valid/invalid tickers, validation)
- Historical endpoint (days validation)
- Dividends endpoint (limit validation)
- Root & docs endpoints

**All 14 tests pass.** CI via GitHub Actions runs tests on push/PR (see `.github/workflows/test.yml`).

## Project Structure

```
W-proj8/
├── backend/                    # FastAPI API
│   ├── main.py                # Routes & app init
│   ├── data_provider.py       # yfinance data source
│   ├── cache.py               # Redis/memory cache
│   ├── test_main.py           # pytest tests (14 passing)
│   ├── requirements.txt        # Python dependencies
│   └── .env.example            # Environment template
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── App.jsx            # Main dashboard component
│   │   ├── components/        # PriceCard.jsx, DividendTable.jsx
│   │   └── index.css          # Styles
│   ├── public/index.html      # HTML entry
│   ├── package.json           # npm dependencies
│   ├── vite.config.js         # Vite config with /api proxy
│   └── tailwind.config.js     # Tailwind CSS config
├── .github/workflows/
│   └── test.yml               # GitHub Actions CI
├── docker-compose.yml          # Docker compose config
├── railway.toml                # Railway deployment config
└── README.md                   # This file
```

## Deployment

### Railway
Push to `main` branch and Railway auto-deploys:
1. Builds frontend: `npm --prefix frontend run build`
2. Installs backend: `pip install -r backend/requirements.txt`
3. Runs backend: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`

### Docker
```bash
docker-compose up -d   # Run app + Redis
docker-compose down    # Stop
```

## Development Tips

### Adding a New Endpoint
1. Add handler to `backend/main.py`
2. Add test to `backend/test_main.py`
3. Run `pytest test_main.py -v`
4. Push to GitHub (CI runs tests automatically)

### Frontend Updates
```bash
cd frontend
npm run dev        # Hot reload dev mode
npm run build      # Production build
```

## Troubleshooting

### Backend fails to start: "Directory 'frontend/dist' does not exist"
This is OK—build the frontend when needed:
```bash
npm --prefix frontend run build
```

### "Connection refused" on localhost:8000
Make sure the backend is running:
```bash
cd backend && python main.py
```

### Tests failing
Reinstall and run:
```bash
cd backend
pip install -r requirements.txt --upgrade
python -m pytest test_main.py -v
```

## License

MIT