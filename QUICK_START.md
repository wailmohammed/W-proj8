# 🚀 W-proj8 Quick Start Guide

## 📖 Table of Contents
1. [How to Login](#how-to-login)
2. [How to Search Stocks](#how-to-search-stocks)
3. [How to View Dividend Analysis](#how-to-view-dividend-analysis)
4. [How to Upgrade Subscription](#how-to-upgrade-subscription)
5. [How to Try Premium Features](#how-to-try-premium-features)

---

## 🔐 How to Login

### Option 1: Login with Demo Account (Recommended)
1. Click the **AuthUI** button in the top-right corner
2. Go to the **Login** tab (if not already selected)
3. Enter the following credentials:
   - **Email**: `demo@example.com`
   - **Password**: `password123`
4. Click **Login**
5. ✅ You'll be logged in with **Premium** subscription (all features unlocked)

### Option 2: Create New Account (Free Tier)
1. Click the **AuthUI** button in the top-right corner
2. Click the **Create Account** link (or toggle)
3. Enter:
   - **Email**: Your email address
   - **Password**: Your password
4. Click **Register**
5. ✅ You'll be logged in with **Free** subscription (limited features)
6. To upgrade, click the **Upgrade** button in the subscription section

---

## 🔍 How to Search Stocks

### Basic Stock Lookup
1. In the **search bar** at the top, enter a stock ticker symbol
   - Examples: `AAPL`, `MSFT`, `TSLA`, `JNJ`, `COCA`
2. Press **Enter** or click the **Search** button
3. The app will load:
   - **Current Price**: Real-time stock price from yfinance
   - **30-Day Chart**: Historical price movements
   - **Dividend History**: Recent dividend payments

### Tips
- Use uppercase ticker symbols (e.g., `AAPL` not `appl`)
- If a stock has no dividends, you'll see: "No dividend history available"
- Prices update in real-time from Yahoo Finance

---

## 📊 How to View Dividend Analysis

### If You Have Premium Subscription
After logging in with demo account, you'll see:

#### 1. **Dividend Safety Score** (Color-Coded)
- Shows a **letter grade** (A-F) with color:
  - 🟢 **A or B**: Very safe dividends
  - 🟡 **C or D**: Moderate risk
  - 🔴 **F**: High risk
- Displays a **score** from 0-100
- Shows "✓ Safe" or "✗ Risky" status

**What it measures:**
- Payout ratio (how much of earnings paid as dividends)
- Earnings growth (company revenue trends)
- Debt levels (financial stability)
- Free cash flow (real cash available)

#### 2. **Dividend Capture Strategy**
- **Recommended Action**: Buy/Hold decision
- **Risk Level**: Low/Medium/High
- **Tax Analysis**: 
  - Pre-tax yield percentage
  - After-tax yield percentage
  - Tax rate applied
  - Qualified vs. ordinary dividend status
- **Return Scenarios**:
  - 📈 Bullish (+5% stock move): Expected return
  - ➡️ Neutral (0% stock move): Expected return
  - 📉 Bearish (-5% stock move): Expected return
- **Expected Return**: Overall probability-weighted return

#### 3. **Toggle Views**
Click the view toggle buttons at the top of the Dividend section:
- **📋 List**: Table format with dates and amounts
- **📅 Calendar**: Calendar-style dividend view
- **📊 Chart**: Graph of dividend history

### If You Have Free Subscription
You'll see: **"Premium features available in Premium/Elite plans"** message

---

## 💳 How to Upgrade Subscription

### Step 1: View Plans
1. Scroll down to the **"Subscription Plans"** section
2. See three tiers:
   - **Free**: $0/month (Current if you just registered)
   - **Premium**: $9.99/month (Recommended for most users)
   - **Elite**: $29.99/month (For power users)

### Step 2: Select Tier
1. Click **Upgrade** button on Premium or Elite plan
2. Choose payment method:
   - **Bitcoin**: For cryptocurrency payments
   - **Ethereum**: For Ethereum payments (default)
3. Click **Pay with [Crypto]** button

### Step 3: Complete Payment
- You'll receive:
  - 💰 **Transaction ID**: Unique payment identifier
  - 📮 **Wallet Address**: Send crypto to this address
- After payment confirms, you're upgraded!

---

## 🌟 How to Try Premium Features

### Quickest Way (Recommended)
1. Use demo login: `demo@example.com` / `password123`
2. All premium features are instantly unlocked

### What You Can Do With Premium
✅ See Dividend Safety Scores (A-F grades)  
✅ Analyze Dividend Capture Strategy  
✅ View tax impact calculations  
✅ See return scenarios (bullish/neutral/bearish)  
✅ Toggle between List/Calendar/Chart views  
✅ Get 1,000 API calls per day  
✅ Track up to 50 different stocks  

### Try These Actions
1. **Check Apple Dividend Safety**: 
   - Search for `AAPL`
   - See safety score (usually A-B grade)
   
2. **Analyze Microsoft Capture Strategy**:
   - Search for `MSFT`
   - View tax scenarios and return potential
   
3. **Compare Dividend Stocks**:
   - Try: `JNJ`, `PG`, `KO`, `T`
   - Compare safety scores across dividend aristocrats

4. **Toggle View Modes**:
   - Switch between List/Calendar/Chart
   - See how your dividend data displays differently

---

## 🎯 Feature Comparison

| Feature | Free | Premium | Elite |
|---------|------|---------|-------|
| Stock Price Lookup | ✅ | ✅ | ✅ |
| Dividend History | ✅ | ✅ | ✅ |
| 30-Day Charts | ✅ | ✅ | ✅ |
| Safety Scoring | ❌ | ✅ | ✅ |
| Capture Strategy | ❌ | ✅ | ✅ |
| Tax Analysis | ❌ | ✅ | ✅ |
| Portfolio Tracking | ❌ | ❌ | ✅ |
| Alerts/Notifications | ❌ | ❌ | ✅ |
| API Calls/Day | 100 | 1,000 | 10,000 |
| Max Tickers | 5 | 50 | 500 |

---

## 🔧 Troubleshooting

### "Invalid ticker" error
- Make sure you're using the correct stock symbol
- Try: AAPL, MSFT, TSLA, JNJ
- Common mistake: Typing lowercase (use AAPL not appl)

### No dividend history shown
- Some stocks don't pay dividends (e.g., AMZN, GOOG)
- Try dividend stocks: JNJ, PG, KO, T, MO

### "Premium features available" message
- You're logged in with Free tier
- Click "Upgrade" button to see subscription plans
- Or login with demo account to see all features

### Connection errors
- Make sure the backend is running on port 8000
- Check: `curl http://localhost:8000/health`
- Should return: `{"status": "healthy"}`

---

## 📚 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Search for stock (in search bar) |
| `Esc` | Close login modal |

---

## 🎓 Learning Resources

### Understanding Dividend Safety Score
- **A/B grades**: Strong, sustainable dividends
- **C grade**: Moderate safety, monitor carefully
- **D/F grades**: Risky, consider avoiding or selling

### Understanding Capture Strategy
- **Qualified Dividend**: Lower tax rate (long-term holding)
- **Ordinary Dividend**: Higher tax rate (short-term)
- **Bullish/Neutral/Bearish**: Price scenarios after dividend date

### API Documentation
- Full API docs: http://localhost:8000/docs
- Try endpoints interactively
- See request/response formats

---

## 💡 Pro Tips

1. **Compare Dividend Stocks**
   - Search multiple stocks
   - Compare their safety scores
   - Pick the safest dividend payers

2. **Tax Planning**
   - Check "After-Tax Yield" in capture strategy
   - Plan purchases around dividend dates
   - Consider your tax bracket

3. **Risk Management**
   - F-grade stocks are risky, investigate before buying
   - Look for consistent A/B grades over time
   - Compare payout ratios

4. **Portfolio Building**
   - Use Premium plan to track 50+ stocks
   - Build a diversified dividend portfolio
   - Monitor safety scores monthly

---

## 🆘 Need Help?

### Live Demo Issues
- Open browser console (F12)
- Check for error messages
- Verify backend is running: `curl http://localhost:8000/health`

### API Questions
- See full API docs: http://localhost:8000/docs
- Use Swagger UI to test endpoints
- Curl examples in PROJECT_SUMMARY.md

### Feature Requests
- File issues on GitHub
- Pull requests welcome
- Check VERIFICATION_CHECKLIST.md for feature status

---

## 🚀 Next: Start Using W-proj8!

1. ✅ Open http://localhost:8000 in your browser
2. ✅ Click AuthUI and login with demo@example.com
3. ✅ Search for a stock (e.g., AAPL)
4. ✅ View dividend safety score
5. ✅ Analyze capture strategy
6. ✅ Upgrade subscription for more tickers

**Happy investing! 📈**

---

**Last Updated**: November 26, 2025  
**Version**: 1.0.0
