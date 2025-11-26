import os
import datetime
import traceback
import pandas as pd

CURRENT_PROVIDER = os.getenv("CURRENT_PROVIDER", "yfinance")


class DataProvider:
    """Simple provider using yfinance when available. Returns consistent JSON shapes.
    If yfinance is not installed or fails, returns error messages in the payload.
    """

    @staticmethod
    def _safe_ticker(ticker):
        try:
            import yfinance as yf
            return yf.Ticker(ticker)
        except Exception:
            return None

    @staticmethod
    def get_price(ticker: str):
        try:
            t = DataProvider._safe_ticker(ticker)
            if t is None:
                return {"error": "yfinance not available or failed"}

            hist = t.history(period="2d")
            if hist.empty:
                return {"error": "No price data"}
            # take last close
            last = hist['Close'].iloc[-1]
            timestamp = hist.index[-1].to_pydatetime().isoformat()
            return {"ticker": ticker.upper(), "price": float(last), "timestamp": timestamp, "source": "yfinance"}
        except Exception:
            return {"error": "Failed to fetch price", "detail": traceback.format_exc()}

    @staticmethod
    def get_historical(ticker: str, days: int = 30):
        try:
            t = DataProvider._safe_ticker(ticker)
            if t is None:
                return {"error": "yfinance not available or failed", "data": []}
            hist = t.history(period=f"{days}d")
            if hist.empty:
                return {"data": []}
            # convert to list of rows
            rows = []
            for idx, row in hist.iterrows():
                rows.append({
                    "date": pd.Timestamp(idx).to_pydatetime().isoformat(),
                    "Open": float(row.get('Open', None)) if not pd.isna(row.get('Open', None)) else None,
                    "High": float(row.get('High', None)) if not pd.isna(row.get('High', None)) else None,
                    "Low": float(row.get('Low', None)) if not pd.isna(row.get('Low', None)) else None,
                    "Close": float(row.get('Close', None)) if not pd.isna(row.get('Close', None)) else None,
                    "Volume": int(row.get('Volume', 0)) if not pd.isna(row.get('Volume', 0)) else 0,
                })
            return {"data": rows}
        except Exception:
            return {"error": "Failed to fetch historical", "detail": traceback.format_exc(), "data": []}

    @staticmethod
    def get_dividends(ticker: str, limit: int = 10):
        try:
            t = DataProvider._safe_ticker(ticker)
            if t is None:
                return {"error": "yfinance not available or failed", "dividends": []}
            divs = t.dividends
            if divs is None or len(divs) == 0:
                return {"dividends": []}
            items = []
            # series indexed by date, take most recent first
            for d, amt in reversed(list(divs.items())):
                items.append({"date": pd.Timestamp(d).to_pydatetime().isoformat(), "amount": float(amt)})
                if len(items) >= limit:
                    break
            return {"dividends": items}
        except Exception:
            return {"error": "Failed to fetch dividends", "detail": traceback.format_exc(), "dividends": []}
