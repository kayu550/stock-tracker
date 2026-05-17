from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://stock-tracker-omega-nine.vercel.app",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Stock Tracker API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/stocks")
def get_stocks(db: Session = Depends(get_db)):
    stocks = db.query(models.Stock).all()
    return [
        {
            "id": s.id,
            "ticker": s.ticker,
            "company_name": s.company_name,
            "sector": s.sector,
        }
        for s in stocks
    ]

@app.get("/stocks/{ticker}")
def get_stock(ticker: str, db: Session = Depends(get_db)):
    stock = db.query(models.Stock).filter(models.Stock.ticker == ticker.upper()).first()
    if stock is None:
        return {"error": "Stock not found"}
    return {
        "id": stock.id,
        "ticker": stock.ticker,
        "company_name": stock.company_name,
        "sector": stock.sector,
    }

@app.get("/stocks/{ticker}/prices")
def get_prices(ticker: str, db: Session = Depends(get_db)):
    stock = db.query(models.Stock).filter(models.Stock.ticker == ticker.upper()).first()
    if stock is None:
        return {"error": "Stock not found"}
    prices = db.query(models.PriceHistory).filter(models.PriceHistory.stock_id == stock.id).all()
    return [
        {
            "date": p.recorded_at,
            "open": float(p.open_price),
            "high": float(p.high_price),
            "low": float(p.low_price),
            "close": float(p.close_price),
            "volume": p.volume,
        }
        for p in prices
    ]

@app.post("/stocks")
def create_stock(ticker: str, company_name: str, sector: str, db: Session = Depends(get_db)):
    stock = models.Stock(
        ticker=ticker.upper(),
        company_name=company_name,
        sector=sector
    )
    db.add(stock)
    db.commit()
    db.refresh(stock)
    return {"id": stock.id, "ticker": stock.ticker}
