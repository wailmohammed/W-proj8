import pandas as pd
from typing import List, Dict

def calculate_dividend_safety_score(
    payout_ratio: float,
    earnings_growth: float = 5.0,
    debt_to_equity: float = 0.5,
    free_cash_flow_trend: float = 1.0
) -> Dict:
    """
    Calculate dividend safety score (0-100) with A-F grades.
    Based on payout ratio, earnings growth, debt levels, and cash flow.
    """
    score = 100
    
    # Payout ratio impact (0-40 points)
    if payout_ratio <= 30:
        score -= 0  # Safe
    elif payout_ratio <= 50:
        score -= 10
    elif payout_ratio <= 70:
        score -= 20
    elif payout_ratio <= 90:
        score -= 30
    else:
        score -= 40  # Unsustainable
    
    # Earnings growth impact (0-30 points)
    if earnings_growth >= 10:
        score -= 0  # Strong growth
    elif earnings_growth >= 5:
        score -= 10
    elif earnings_growth >= 0:
        score -= 20
    else:
        score -= 30  # Negative growth
    
    # Debt to equity impact (0-20 points)
    if debt_to_equity <= 0.5:
        score -= 0  # Low debt
    elif debt_to_equity <= 1.0:
        score -= 10
    else:
        score -= 20  # High leverage
    
    # FCF trend impact (0-10 points)
    if free_cash_flow_trend >= 1.0:
        score -= 0  # Improving
    elif free_cash_flow_trend >= 0.8:
        score -= 5
    else:
        score -= 10  # Deteriorating
    
    score = max(0, min(100, score))
    
    def get_grade(s):
        if s >= 90: return 'A'
        elif s >= 80: return 'B'
        elif s >= 70: return 'C'
        elif s >= 60: return 'D'
        else: return 'F'
    
    return {
        "score": score,
        "grade": get_grade(score),
        "safe": score >= 70,
        "label": "Very Safe" if score >= 90 else "Safe" if score >= 80 else "Borderline" if score >= 60 else "Unsafe"
    }

def calculate_dividend_capture_strategy(
    ticker: str,
    ex_dividend_date: str,
    dividend_amount: float,
    current_price: float,
    holding_period_days: int = 60
) -> Dict:
    """
    Analyze dividend capture strategy feasibility.
    Calculate holding period returns, tax implications, and breakeven points.
    """
    dividend_yield = (dividend_amount / current_price) * 100
    
    # Tax assumptions (US context; customize as needed)
    short_term_tax_rate = 0.37  # Ordinary income
    long_term_tax_rate = 0.20   # Capital gains (qualified dividends)
    holding_period_min_days = 60
    is_qualified = holding_period_days >= holding_period_min_days
    
    # After-tax dividend income
    tax_rate = long_term_tax_rate if is_qualified else short_term_tax_rate
    after_tax_dividend = dividend_amount * (1 - tax_rate)
    after_tax_yield = (after_tax_dividend / current_price) * 100
    
    # Price movement scenarios
    scenarios = {
        "bullish": {"price_change": 0.05, "probability": 0.3},  # +5%
        "neutral": {"price_change": 0.0, "probability": 0.4},   # No change
        "bearish": {"price_change": -0.05, "probability": 0.3}  # -5%
    }
    
    returns = {}
    for scenario, params in scenarios.items():
        future_price = current_price * (1 + params["price_change"])
        capital_gain = (future_price - current_price) / current_price * 100
        total_return = capital_gain + after_tax_yield
        expected_return = total_return * params["probability"]
        returns[scenario] = {
            "future_price": round(future_price, 2),
            "capital_gain_pct": round(capital_gain, 2),
            "total_return_pct": round(total_return, 2),
            "expected_return_pct": round(expected_return, 2)
        }
    
    # Expected value
    expected_value = sum(r["expected_return_pct"] for r in returns.values())
    
    return {
        "ticker": ticker,
        "dividend_yield_pretax": round(dividend_yield, 2),
        "dividend_yield_aftertax": round(after_tax_yield, 2),
        "tax_rate": tax_rate * 100,
        "is_qualified_dividend": is_qualified,
        "holding_period_days": holding_period_days,
        "scenarios": returns,
        "expected_return_pct": round(expected_value, 2),
        "recommended": expected_value > 0.5,  # Positive expected return threshold
        "risk_level": "Low" if abs(returns["bearish"]["total_return_pct"]) <= 5 else "Medium" if abs(returns["bearish"]["total_return_pct"]) <= 10 else "High"
    }

def calculate_portfolio_analytics(holdings: List[Dict]) -> Dict:
    """
    Calculate advanced portfolio metrics: dividend yield, growth trends, sector allocation.
    """
    if not holdings:
        return {"error": "No holdings provided"}
    
    df = pd.DataFrame(holdings)
    
    # Aggregate metrics
    total_value = (df['shares'] * df['currentPrice']).sum()
    total_dividend_income = (df['shares'] * df['currentPrice'] * df['dividendYield'] / 100).sum()
    portfolio_yield = (total_dividend_income / total_value * 100) if total_value > 0 else 0
    
    # Safety scores by holding
    safety_scores = []
    for _, row in df.iterrows():
        safety = calculate_dividend_safety_score(
            payout_ratio=row.get('payoutRatio', 50),
            earnings_growth=row.get('earningsGrowth', 5)
        )
        safety_scores.append(safety['score'])
    
    avg_safety_score = sum(safety_scores) / len(safety_scores) if safety_scores else 0
    
    return {
        "total_portfolio_value": round(total_value, 2),
        "annual_dividend_income": round(total_dividend_income, 2),
        "portfolio_yield": round(portfolio_yield, 2),
        "avg_safety_score": round(avg_safety_score, 1),
        "holdings_count": len(df),
        "avg_holding_price": round(df['currentPrice'].mean(), 2),
        "dividend_growth_3yr": 12.5,  # Mock data
        "dividend_growth_5yr": 8.2
    }
