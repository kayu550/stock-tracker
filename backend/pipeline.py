import sys
sys.path.append('.')
import yfinance as yf
import schedule
import time
from database import SessionLocal
import models
from datetime import datetime
from sqlalchemy import text

def run_pipeline():
    rows_processed = 0

    # Step 1 - Get stock list
    db = SessionLocal()
    try:
        stocks = db.query(models.Stock).all()
        stock_list = [(s.id, s.ticker) for s in stocks]
        print(f"Found {len(stock_list)} stocks to process")
    except Exception as e:
        print(f"Failed to get stocks: {e}")
        return
    finally:
        db.close()

    # Step 2 - Process each stock
    for stock_id, ticker in stock_list:
        print(f"Fetching data for {ticker}...")

        # Fetch from Yahoo Finance
        try:
            ticker_data = yf.Ticker(ticker)
            history = ticker_data.history(period="5y")
        except Exception as e:
            print(f"  Failed to fetch {ticker}: {e}")
            continue

        if history.empty:
            print(f"  No data returned for {ticker}")
            continue

        # Load ALL existing dates for this stock in one query
        db = SessionLocal()
        try:
            result = db.execute(
                text("SELECT recorded_at FROM price_history WHERE stock_id = :sid"),
                {"sid": stock_id}
            )
            existing_dates = {row[0].replace(tzinfo=None) for row in result}
            print(f"  {ticker} has {len(existing_dates)} existing rows")
        except Exception as e:
            print(f"  Failed to load existing dates: {e}")
            db.close()
            continue
        finally:
            db.close()

        # Filter to only new rows
        new_rows = []
        for date, row in history.iterrows():
            date_naive = date.replace(tzinfo=None)
            if date_naive not in existing_dates:
                new_rows.append((date, row))

        print(f"  {ticker} has {len(new_rows)} new rows to insert")

        if not new_rows:
            print(f"  {ticker} already up to date — skipping")
            continue

        # Insert in batches of 100
        batch_size = 100
        for i in range(0, len(new_rows), batch_size):
            batch = new_rows[i:i + batch_size]
            db = SessionLocal()
            try:
                for date, row in batch:
                    price = models.PriceHistory(
                        stock_id=stock_id,
                        open_price=float(row["Open"]),
                        high_price=float(row["High"]),
                        low_price=float(row["Low"]),
                        close_price=float(row["Close"]),
                        volume=int(row["Volume"]),
                        recorded_at=date,
                    )
                    db.add(price)
                db.commit()
                print(f"  {ticker} inserted batch {i//batch_size + 1}/{(len(new_rows)-1)//batch_size + 1}")
                rows_processed += len(batch)
            except Exception as e:
                db.rollback()
                print(f"  Batch failed: {e}")
            finally:
                db.close()

        print(f"  {ticker} complete")

    # Step 3 - Log the run
    db = SessionLocal()
    try:
        run_log = models.PipelineRun(
            status="success",
            rows_processed=rows_processed,
            finished_at=datetime.utcnow()
        )
        db.add(run_log)
        db.commit()
        print(f"Pipeline completed at {datetime.utcnow()} — {rows_processed} rows added")
    except Exception as e:
        print(f"Failed to log run: {e}")
    finally:
        db.close()


run_pipeline()

schedule.every(30).seconds.do(run_pipeline)
print("Scheduler started - pipeline will run every 30 seconds")
print("Press CTRL+C to stop")

while True:
    schedule.run_pending()
    time.sleep(1)
