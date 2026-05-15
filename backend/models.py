from sqlalchemy import Column, Integer, String, Numeric, BigInteger, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True)
    ticker = Column(String(10),nullable=False, unique=True)
    company_name= Column(String(255),nullable=False)
    sector= Column(String(100))
    created_at = Column(DateTime, default = datetime.datetime.utcnow)


    prices = relationship("PriceHistory", back_populates="stock")
    
class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False)
    open_price = Column(Numeric(12, 4), nullable=False)
    high_price = Column(Numeric(12, 4), nullable=False)
    low_price = Column(Numeric(12, 4), nullable=False)
    close_price = Column(Numeric(12, 4), nullable=False)
    volume = Column(BigInteger, nullable=False)
    recorded_at = Column(DateTime, nullable=False)

    stock = relationship("Stock", back_populates="prices") 


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key = True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable = False)
    target_price = Column(Numeric(12,4), nullable = False)
    direction = Column(String(4), nullable = False)
    triggered = Column(Boolean, default = False, nullable = False)
    created = Column(DateTime, default = datetime.datetime.utcnow)

class PipelineRun(Base):
    __tablename__ = "pipeline_runs"

    id             = Column(Integer, primary_key=True)
    status         = Column(String(16), nullable=False)
    rows_processed = Column(Integer, default=0)
    started_at     = Column(DateTime, default=datetime.datetime.utcnow)
    finished_at    = Column(DateTime, nullable=True)
    error_message  = Column(String(256), nullable=True)


    
