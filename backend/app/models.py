import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Date
from app.database import Base

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    doctor_name = Column(String(255), nullable=False, index=True)
    hospital = Column(String(255), nullable=True)
    interaction_date = Column(Date, nullable=False)
    product = Column(String(255), nullable=True)
    discussion_notes = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    follow_up_date = Column(Date, nullable=True)
    next_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
