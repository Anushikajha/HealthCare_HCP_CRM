from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Interaction
from app.schemas import (
    InteractionCreate,
    InteractionUpdate,
    InteractionResponse,
    ChatRequest,
    ChatResponse
)
from app.agent.graph import run_agent

router = APIRouter(prefix="/api/interactions", tags=["Interactions"])

@router.post("/", response_model=InteractionResponse, status_code=status.HTTP_201_CREATED)
def create_interaction(obj_in: InteractionCreate, db: Session = Depends(get_db)):
    """
    Manually create a new HCP interaction.
    """
    # Auto-generate basic AI summary if none provided
    ai_summary = obj_in.ai_summary
    if not ai_summary and obj_in.discussion_notes:
        ai_summary = f"Interaction summary: {obj_in.discussion_notes[:100]}..."
    elif not ai_summary:
        ai_summary = f"Meeting with Dr. {obj_in.doctor_name} regarding {obj_in.product or 'unspecified product'}."

    db_obj = Interaction(
        doctor_name=obj_in.doctor_name,
        hospital=obj_in.hospital,
        interaction_date=obj_in.interaction_date,
        product=obj_in.product,
        discussion_notes=obj_in.discussion_notes,
        ai_summary=ai_summary,
        follow_up_date=obj_in.follow_up_date,
        next_action=obj_in.next_action
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/", response_model=List[InteractionResponse])
def read_interactions(
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve all HCP interactions. Optionally filter by doctor name or hospital using the search query.
    """
    query = db.query(Interaction)
    if search:
        query = query.filter(
            (Interaction.doctor_name.ilike(f"%{search}%")) |
            (Interaction.hospital.ilike(f"%{search}%")) |
            (Interaction.product.ilike(f"%{search}%"))
        )
    return query.order_by(Interaction.interaction_date.desc(), Interaction.id.desc()).all()

@router.get("/{interaction_id}", response_model=InteractionResponse)
def read_single_interaction(interaction_id: int, db: Session = Depends(get_db)):
    """
    Get a single interaction by ID.
    """
    interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not interaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interaction with ID {interaction_id} not found"
        )
    return interaction

@router.put("/{interaction_id}", response_model=InteractionResponse)
def update_interaction(
    interaction_id: int,
    obj_in: InteractionUpdate,
    db: Session = Depends(get_db)
):
    """
    Manually update details of an existing HCP interaction.
    """
    db_obj = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not db_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interaction with ID {interaction_id} not found"
        )
    
    update_data = obj_in.dict(exclude_unset=True)
    for field in update_data:
        setattr(db_obj, field, update_data[field])
        
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.delete("/{interaction_id}", response_model=dict)
def delete_interaction(interaction_id: int, db: Session = Depends(get_db)):
    """
    Delete an interaction by ID.
    """
    db_obj = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not db_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interaction with ID {interaction_id} not found"
        )
    db.delete(db_obj)
    db.commit()
    return {"message": f"Interaction with ID {interaction_id} successfully deleted", "id": interaction_id}

@router.post("/chat", response_model=ChatResponse)
def chat_with_agent(payload: ChatRequest):
    """
    AI Conversational Chat endpoint that routes prompts to the LangGraph agent.
    If the agent logs or edits records under the hood, the metadata is parsed and returned.
    """
    try:
        # We can implement simple in-memory session history or just run stateless if history is empty.
        # For simplicity, we run single message or stateless since the prompt can send context.
        # But wait, let's keep a history list if needed. In a real app, you might query session history.
        # Let's run the agent!
        response_text, extracted_data = run_agent(payload.message)
        return ChatResponse(response=response_text, extracted_data=extracted_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent Error: {str(e)}"
        )
