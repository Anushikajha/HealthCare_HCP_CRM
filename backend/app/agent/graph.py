from typing import Annotated, Sequence, TypedDict
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from app.agent.tools import (
    log_interaction_tool,
    edit_interaction_tool,
    search_interactions_tool,
    summarize_history_tool,
    schedule_followup_tool,
    get_llm
)
from app.config import GROQ_API_KEY, LLM_MODEL

# Define state structure
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]

# List of tools
tools = [
    log_interaction_tool,
    edit_interaction_tool,
    search_interactions_tool,
    summarize_history_tool,
    schedule_followup_tool
]

def _build_llm_with_tools():
    if not GROQ_API_KEY:
        return None
    try:
        llm = get_llm()
        return llm.bind_tools(tools)
    except Exception:
        return None


llm_with_tools = _build_llm_with_tools()

# Define nodes
def build_fallback_response(user_message: str) -> str:
    message = user_message.strip()
    if not message:
        return "I’m currently offline because the AI service is not configured. Please add a valid GROQ API key to continue using the assistant."

    lower_message = message.lower()
    if any(keyword in lower_message for keyword in ["log", "record", "meeting", "dr.", "doctor"]):
        return (
            "I’m currently running in offline mode because the AI service is not configured. "
            f"Your request was received: '{message}'. Once GROQ is configured, I can log or summarize the interaction automatically."
        )

    return (
        "I’m currently running in offline mode because the AI service is not configured. "
        f"Your request was received: '{message}'. Add a valid GROQ API key to enable full AI assistance."
    )


def agent_node(state: AgentState):
    messages = state["messages"]
    if not llm_with_tools:
        fallback_text = build_fallback_response(messages[-1].content if messages else "")
        return {"messages": [AIMessage(content=fallback_text)]}

    try:
        response = llm_with_tools.invoke(messages)
        return {"messages": [response]}
    except Exception:
        fallback_text = build_fallback_response(messages[-1].content if messages else "")
        return {"messages": [AIMessage(content=fallback_text)]}

def tool_node(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1]
    
    tool_messages = []
    if last_message.tool_calls:
        for tool_call in last_message.tool_calls:
            tool_name = tool_call["name"]
            tool_args = tool_call["args"]
            tool_id = tool_call["id"]
            
            tool_map = {tool.name: tool for tool in tools}
            tool_fn = tool_map.get(tool_name)
            
            if tool_fn:
                try:
                    result = tool_fn.invoke(tool_args)
                except Exception as e:
                    result = f"Error executing tool {tool_name}: {str(e)}"
            else:
                result = f"Tool '{tool_name}' not found."
            
            tool_messages.append(
                ToolMessage(content=str(result), tool_call_id=tool_id, name=tool_name)
            )
            
    return {"messages": tool_messages}

# Routing edge
def should_continue(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1]
    if last_message.tool_calls:
        return "tools"
    return END

# Build Graph
workflow = StateGraph(AgentState)
workflow.add_node("agent", agent_node)
workflow.add_node("tools", tool_node)

workflow.set_entry_point("agent")
workflow.add_conditional_edges(
    "agent",
    should_continue,
    {
        "tools": "tools",
        END: END
    }
)
workflow.add_edge("tools", "agent")

compiled_graph = workflow.compile()

def run_agent(user_message: str, chat_history: list = None):
    """
    Main entrypoint to run the LangGraph agent with history.
    Parses conversation messages and retrieves the final AI text response 
    along with any structured tool actions executed (e.g. log / edit database records).
    """
    if not GROQ_API_KEY:
        return build_fallback_response(user_message), {}

    messages = []
    
    # Inject systemic helpful instructions
    system_prompt = (
        "You are an expert CRM Assistant for pharmaceutical reps. "
        "Your job is to manage interactions with Healthcare Professionals (HCPs / doctors). "
        "Use the tools at your disposal to log new interactions, edit existing logs, "
        "search logs, schedule follow-ups, and summarize history. "
        "For logging new interactions: you must extract doctor_name, hospital, product, "
        "interaction_date, discussion_notes, follow_up_date, and next_action. "
        "If some info (like hospital or product) is not mentioned, check if you can extract it "
        "or leave it None. If dates are mentioned relative (e.g. today, tomorrow, next Monday), "
        "pass the relative date text directly to the tool - it knows how to parse them. "
        "If you successfully log or edit, explicitly mention it in your response."
    )
    
    # LangGraph doesn't require a separate system node if we use conversational context.
    # We will inject the prompt context or standard SystemMessage.
    from langchain_core.messages import SystemMessage
    messages.append(SystemMessage(content=system_prompt))
    
    # Append history
    if chat_history:
        for msg in chat_history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))
                
    # Append current user prompt
    messages.append(HumanMessage(content=user_message))
    
    # Execute graph workflow
    result = compiled_graph.invoke({"messages": messages})
    
    final_message = result["messages"][-1]
    response_text = final_message.content
    
    # Analyze if any data-modifying tool message was called to return structured updates
    extracted_data = {}
    for msg in reversed(result["messages"]):
        if isinstance(msg, ToolMessage):
            if msg.name == "log_interaction_tool" and msg.content.startswith("SUCCESS"):
                from app.database import SessionLocal
                from app.models import Interaction
                db = SessionLocal()
                try:
                    latest = db.query(Interaction).order_by(Interaction.id.desc()).first()
                    if latest:
                        extracted_data = {
                            "id": latest.id,
                            "doctor_name": latest.doctor_name,
                            "hospital": latest.hospital,
                            "interaction_date": str(latest.interaction_date),
                            "product": latest.product,
                            "discussion_notes": latest.discussion_notes,
                            "ai_summary": latest.ai_summary,
                            "follow_up_date": str(latest.follow_up_date) if latest.follow_up_date else None,
                            "next_action": latest.next_action,
                            "action_type": "log"
                        }
                finally:
                    db.close()
                break
            elif msg.name == "edit_interaction_tool" and msg.content.startswith("SUCCESS"):
                # Return indicating edit happened
                extracted_data = {"action_type": "edit"}
                break
                
    return response_text, extracted_data
