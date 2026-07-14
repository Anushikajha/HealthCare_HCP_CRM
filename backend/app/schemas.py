from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class InteractionBase(BaseModel):
    doctor_name: str
    hospital: Optional[str] = None
    interaction_date: date
    product: Optional[str] = None
    discussion_notes: Optional[str] = None
    ai_summary: Optional[str] = None
    follow_up_date: Optional[date] = None
    next_action: Optional[str] = None

class InteractionCreate(InteractionBase):
    pass

class InteractionUpdate(BaseModel):
    doctor_name: Optional[str] = None
    hospital: Optional[str] = None
    interaction_date: Optional[date] = None
    product: Optional[str] = None
    discussion_notes: Optional[str] = None
    ai_summary: Optional[str] = None
    follow_up_date: Optional[date] = None
    next_action: Optional[str] = None

class InteractionResponse(InteractionBase):
    id: int
    created_at: datetime

    # Supports both Pydantic v1 (orm_mode) and v2 (from_attributes)
    class Config:
        orm_mode = True
        from_attributes = True

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    extracted_data: Optional[dict] = None
