# Stock & Crypto Tracker

🔗 **Live Demo**: https://stock-tracker-omega-nine.vercel.app

A full-stack real-time data pipeline and dashboard tracking live stock and cryptocurrency prices.

![Dashboard](https://img.shields.io/badge/Status-Live-green) ![Python](https://img.shields.io/badge/Python-3.12-blue) ![React](https://img.shields.io/badge/React-18-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)

## What it does
- Tracks real-time prices for AAPL, TSLA, GOOGL, MSFT, BTC, ETH, and SOL
- Automated ETL pipeline fetches fresh market data from Yahoo Finance every 30 seconds
- Dashboard shows live price charts, volume bars, price change %, top gainer and biggest loser
- Full pipeline observability — every ETL run is logged with status, rows processed, and timestamps

## Architecture
Yahoo Finance (yfinance)
↓
ETL Pipeline (Python) — runs every 30 seconds
↓
PostgreSQL Database
↓
FastAPI REST API
↓
React Dashboard (Recharts)

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React, Recharts, Axios |
| Backend | Python, FastAPI, SQLAlchemy |
| Database | PostgreSQL |
| Pipeline | yfinance, schedule |

## API Endpoints
| Endpoint | Description |
|---|---|
| GET /stocks | All tracked stocks |
| GET /stocks/{ticker} | Single stock by ticker |
| GET /stocks/{ticker}/prices | Full price history |
| POST /stocks | Add a new stock |
| GET /health | Health check |

## Running locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 16

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Pipeline
```bash
python3 pipeline.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Author
Kamran Ayub — [github.com/kayu550](https://github.com/kayu550)
