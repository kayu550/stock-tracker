# Stock & Crypto Tracker

A full-stack real-time data pipeline and dashboard tracking live stock and cryptocurrency prices.

## Stack
- **Backend**: Python, FastAPI, SQLAlchemy
- **Database**: PostgreSQL
- **Pipeline**: Automated ETL using yfinance (runs every 30 seconds)
- **Frontend**: React, Recharts

## Features
- Live price tracking for AAPL, TSLA, GOOGL, MSFT, BTC, ETH, SOL
- Automated ETL pipeline fetching real market data from Yahoo Finance
- REST API with 5 endpoints
- React dashboard with live charts and colour-coded price movement
- Pipeline run logging for observability

## Architecture
Browser → React Frontend → FastAPI Backend → PostgreSQL Database
                                    ↑
                         Automated ETL Pipeline (yfinance)
