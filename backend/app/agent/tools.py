import datetime
import os
from typing import Optional
from langchain_core.tools import tool
from app.database import SessionLocal
from app.models import Interaction
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

# Helper to parse dates robustly
def parse_date(date_str: Optional[str]) -> Optional[datetime.date]:
    if not date_str:
        return None
    date_str = date_str.strip()
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d", "%d/%m/%Y"):
        try:
            return datetime.datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    # Fallbacks for conversational relative dates
    lower_str = date_str.lower()
    today = datetime.date.today()
    if "today" in lower_str:
        return today
    elif "yesterday" in lower_str:
        return today - datetime.timedelta(days=1)
    elif "tomorrow" in lower_str:
        return today + datetime.timedelta(days=1)
    elif "next monday" in lower_str:
        # Calculate days until next monday
        days_ahead = 0 - today.weekday()
        if days_ahead <= 0: # Target is next week's Monday
            days_ahead += 7
        return today + datetime.timedelta(days=days_ahead)
    elif "next friday" in lower_str:
        days_ahead = 4 - today.weekday()
        if days_ahead <= 0:
            days_ahead += 7
        return today + datetime.timedelta(days=days_ahead)
    return None

def resolve_model_name(model_name: Optional[str] = None) -> str:
    from app.config import LLM_MODEL

    requested_model = (model_name or LLM_MODEL or "").strip()
    if requested_model in {"gemma2-9b-it", "gemma"}:
        return "llama-3.3-70b-versatile"
    if requested_model:
        return requested_model
    return "llama-3.3-70b-versatile"


def get_llm():
    from app.config import GROQ_API_KEY, LLM_MODEL
    model_name = resolve_model_name(LLM_MODEL)
    return ChatGroq(groq_api_key=GROQ_API_KEY, model_name=model_name, temperature=0.1)

@tool
def log_interaction_tool(
    doctor_name: str,
    hospital: Optional[str] = None,
    interaction_date: Optional[str] = None,
    product: Optional[str] = None,
    discussion_notes: Optional[str] = None,
    ai_summary: Optional[str] = None,
    follow_up_date: Optional[str] = None,
    next_action: Optional[str] = None,
) -> str:
    """
    Logs a new interaction with a doctor/HCP.
    Use this tool when the user wants to record/save/log a new meeting, discussion, or conversation.
    Dates should be in YYYY-MM-DD format if possible.
    """
    db = SessionLocal()
    try:
        int_date = parse_date(interaction_date) or datetime.date.today()
        f_up_date = parse_date(follow_up_date)

        # Generate a professional AI summary if not provided
        summary = ai_summary
        if not summary and discussion_notes:
            try:
                llm = get_llm()
                prompt = ChatPromptTemplate.from_template(
                    "You are a medical liaison writing a succinct professional CRM summary. Summarize the following meeting discussion notes in 1 or 2 concise sentences: '{notes}'"
                )
                chain = prompt | llm
                summary = chain.invoke({"notes": discussion_notes}).content.strip()
            except Exception:
                summary = f"Meeting discussing {product or 'products'}."
        
        if not summary:
            summary = f"Logged meeting with Dr. {doctor_name}."

        interaction = Interaction(
            doctor_name=doctor_name,
            hospital=hospital,
            interaction_date=int_date,
            product=product,
            discussion_notes=discussion_notes,
            ai_summary=summary,
            follow_up_date=f_up_date,
            next_action=next_action
        )
        db.add(interaction)
        db.commit()
        db.refresh(interaction)

        return (
            f"SUCCESS: Interaction logged with ID {interaction.id} for Dr. {interaction.doctor_name}.\n"
            f"Extracted Entities:\n"
            f"- Doctor Name: {interaction.doctor_name}\n"
            f"- Hospital: {interaction.hospital or 'Not Provided'}\n"
            f"- Date: {interaction.interaction_date}\n"
            f"- Product: {interaction.product or 'Not Provided'}\n"
            f"- AI Summary: {interaction.ai_summary}\n"
            f"- Follow-up Date: {interaction.follow_up_date or 'None'}\n"
            f"- Next Action: {interaction.next_action or 'None'}"
        )
    except Exception as e:
        db.rollback()
        return f"ERROR: Failed to log interaction. Details: {str(e)}"
    finally:
        db.close()

@tool
def edit_interaction_tool(
    interaction_id: int,
    doctor_name: Optional[str] = None,
    hospital: Optional[str] = None,
    interaction_date: Optional[str] = None,
    product: Optional[str] = None,
    discussion_notes: Optional[str] = None,
    ai_summary: Optional[str] = None,
    follow_up_date: Optional[str] = None,
    next_action: Optional[str] = None,
) -> str:
    """
    Edits or updates an existing logged interaction.
    Use this tool when the user wants to update, modify, or change details of an interaction by its ID.
    Only specify fields that need to be updated.
    """
    db = SessionLocal()
    try:
        interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
        if not interaction:
            return f"ERROR: Interaction with ID {interaction_id} not found."

        if doctor_name is not None:
            interaction.doctor_name = doctor_name
        if hospital is not None:
            interaction.hospital = hospital
        if interaction_date is not None:
            parsed_date = parse_date(interaction_date)
            if parsed_date:
                interaction.interaction_date = parsed_date
        if product is not None:
            interaction.product = product
        if discussion_notes is not None:
            interaction.discussion_notes = discussion_notes
        if ai_summary is not None:
            interaction.ai_summary = ai_summary
        if follow_up_date is not None:
            interaction.follow_up_date = parse_date(follow_up_date)
        if next_action is not None:
            interaction.next_action = next_action

        db.commit()
        db.refresh(interaction)
        return f"SUCCESS: Interaction ID {interaction_id} updated successfully."
    except Exception as e:
        db.rollback()
        return f"ERROR: Failed to edit interaction. Details: {str(e)}"
    finally:
        db.close()

@tool
def search_interactions_tool(doctor_name: str) -> str:
    """
    Searches for interactions with a specific doctor/HCP by their name.
    Use this tool when the user asks to look up, search, find, or view interactions for a doctor.
    """
    db = SessionLocal()
    try:
        results = db.query(Interaction).filter(Interaction.doctor_name.ilike(f"%{doctor_name}%")).all()
        if not results:
            return f"No interactions found for doctor matching '{doctor_name}'."

        output = []
        for r in results:
            output.append(
                f"ID: {r.id} | Doctor: {r.doctor_name} | Hospital: {r.hospital} | Date: {r.interaction_date} | "
                f"Product: {r.product} | Summary: {r.ai_summary} | Follow-up: {r.follow_up_date} | Next Action: {r.next_action}"
            )
        return "Found the following interactions:\n" + "\n".join(output)
    except Exception as e:
        return f"ERROR: Failed to search. Details: {str(e)}"
    finally:
        db.close()

@tool
def summarize_history_tool(doctor_name: str) -> str:
    """
    Summarizes all previous interactions/meetings with a specific doctor/HCP.
    Use this tool when the user asks to summarize past discussions, get meeting history, or analyze previous notes.
    """
    db = SessionLocal()
    try:
        results = db.query(Interaction).filter(Interaction.doctor_name.ilike(f"%{doctor_name}%")).order_by(Interaction.interaction_date.desc()).all()
        if not results:
            return f"No prior interaction history found for Dr. {doctor_name} to summarize."

        history_text = ""
        for i, r in enumerate(results, 1):
            history_text += (
                f"\nMeeting {i} (Date: {r.interaction_date}):\n"
                f"- Product: {r.product or 'N/A'}\n"
                f"- Notes: {r.discussion_notes or 'N/A'}\n"
                f"- AI Summary: {r.ai_summary or 'N/A'}\n"
                f"- Next Action: {r.next_action or 'N/A'}\n"
            )

        llm = get_llm()
        prompt = ChatPromptTemplate.from_template(
            "You are a medical representative's assistant. Summarize the following meeting history for Dr. {doctor_name} into a single, cohesive, professional summary paragraph. Focus on doctor sentiments, product discussions, and follow-up paths:\n\n{history_text}"
        )
        chain = prompt | llm
        summary_response = chain.invoke({"doctor_name": doctor_name, "history_text": history_text})
        return f"AI Summary of Previous Meetings for Dr. {doctor_name}:\n\n{summary_response.content}"
    except Exception as e:
        return f"ERROR: Failed to generate summary. Details: {str(e)}"
    finally:
        db.close()

@tool
def schedule_followup_tool(doctor_name: str, follow_up_date: str, next_action: str) -> str:
    """
    Schedules a follow-up or next action for a doctor/HCP.
    Use this tool when the user wants to set a reminder, schedule a next meeting, or record a follow-up date for a doctor.
    """
    db = SessionLocal()
    try:
        f_date = parse_date(follow_up_date)
        if not f_date:
            return f"ERROR: Invalid date format '{follow_up_date}'. Please use YYYY-MM-DD or standard relative terms."

        interaction = db.query(Interaction).filter(Interaction.doctor_name.ilike(f"%{doctor_name}%")).order_by(Interaction.interaction_date.desc()).first()

        if not interaction:
            return f"ERROR: No previous interaction found for Dr. {doctor_name}. You must log a meeting before scheduling a follow-up action."

        interaction.follow_up_date = f_date
        interaction.next_action = next_action
        db.commit()
        db.refresh(interaction)

        return f"SUCCESS: Scheduled follow-up for Dr. {interaction.doctor_name} on {interaction.follow_up_date}. Next action: {interaction.next_action}"
    except Exception as e:
        db.rollback()
        return f"ERROR: Failed to schedule follow-up. Details: {str(e)}"
    finally:
        db.close()
