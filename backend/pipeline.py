import sys
sys.path.append('.')
import yfinance as yf
import schedule
import time
from database import SessionLocal
import models
from datetime import datetime


def run_pipeline():
    db = SessionLocal()
    rows_processed = 0

    # Create a pipeline run log entry
    run_log = models.PipelineRun(status="running")
    db.add(run_log)
    db.commit()

    try:
        # Step 1: Get the list of stocks from the database
        stocks = db.query(models.Stock).all()
        print(f"Found {len(stocks)} stocks to process")

        # Step 2, 3 & 4: Fetch, transform and load
        for stock in stocks:
            print(f"Fetching data for {stock.ticker}...")
            ticker_data = yf.Ticker(stock.ticker)
            history = ticker_data.history(period="5y")

            for date, row in history.iterrows():
                existing = db.query(models.PriceHistory).filter(
                    models.PriceHistory.stock_id == stock.id,
                    models.PriceHistory.recorded_at == date
                ).first()

                if existing:
                    print(f"  Already have {stock.ticker} for {date.date()} - skipping")
                    continue

                price = models.PriceHistory(
                    stock_id=stock.id,
                    open_price=float(row["Open"]),
                    high_price=float(row["High"]),
                    low_price=float(row["Low"]),
                    close_price=float(row["Close"]),
                    volume=int(row["Volume"]),
                    recorded_at=date,
                )
                db.add(price)
                rows_processed += 1
                print(f"  Added {stock.ticker} for {date.date()}")

            db.commit()
            print(f"  {stock.ticker} done")

        # Step 5: Log success
        run_log.status = "success"
        run_log.rows_processed = rows_processed
        run_log.finished_at = datetime.utcnow()
        db.commit()
        print(f"Pipeline completed at {datetime.utcnow()} — {rows_processed} rows added")

    except Exception as e:
        run_log.status = "failed"
        run_log.error_message = str(e)
        run_log.finished_at = datetime.utcnow()
        db.commit()
        print(f"Pipeline failed: {e}")

    finally:
        db.close()


import schedule
import time

run_pipeline()

schedule.every(30).seconds.do(run_pipeline)

print("Scheduler started - pipeline will run every 30 seconds")
print("Press CTRL+C to stop")

while True:
    schedule.run_pending()
    time.sleep(1)
