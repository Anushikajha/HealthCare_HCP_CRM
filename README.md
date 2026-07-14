# AI-First CRM HCP Module – Log Interaction Screen

This is a professional Customer Relationship Management (CRM) module tailored for field pharmaceutical representatives interacting with Healthcare Professionals (HCPs / doctors). It features a modern, responsive React + Redux Dashboard and a Python FastAPI backend integrated with a state-of-the-art **LangGraph Agent** powered by Groq.

## Technology Stack
- **Frontend**: React.js, Redux Toolkit, Vanilla CSS (Premium Glassmorphic Theme), Lucide Icons, Google Inter Font.
- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, Pydantic.
- **AI Agent**: LangGraph, LangChain Core, Groq API (Default model: `gemma2-9b-it`, future support: `llama-3.3-70b-versatile`).
- **Database**: SQLite (Default) or PostgreSQL/MySQL.

---

## Architecture Overview

```
User ➔ React UI ➔ FastAPI ➔ LangGraph Agent ➔ Groq (gemma2-9b-it) ➔ DB (SQLite/Postgres)
```

### The LangGraph Agent & Tools
The backend implements a compiled `StateGraph` which manages conversation state and processes user input. It binds 5 specialized tools:
1. **Log Interaction Tool** (`log_interaction_tool`): Parses physician names, hospitals, product details, discussion notes, follow-up timelines, and schedules next actions, auto-saving them to the DB.
2. **Edit Interaction Tool** (`edit_interaction_tool`): Modifies existing CRM logs in the database.
3. **Search Interaction Tool** (`search_interactions_tool`): Filters past visits by doctor name.
4. **Summarize History Tool** (`summarize_history_tool`): Fetches history of meetings for a doctor and runs an aggregated summarization prompt through Groq.
5. **Schedule Follow-up Tool** (`schedule_followup_tool`): Sets reminders and schedules follow-up dates.

---

## Getting Started

### 1. Backend Configuration

1. Clone or navigate to the project directory:
   ```bash
   cd C:/Users/Anushika/.gemini/antigravity/scratch/hcp-crm
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables. Edit the created `.env` file and insert your Groq API Key:
   ```env
   GROQ_API_KEY=gsk_your_groq_api_key_here
   DATABASE_URL=sqlite:///./hcp_crm.db
   LLM_MODEL=gemma2-9b-it
   PORT=8000
   HOST=127.0.0.1
   ```

5. Run the FastAPI development server:
   ```bash
   python -m app.main
   ```
   The backend server will run at `http://127.0.0.1:8000`. You can view the swagger docs at `http://127.0.0.1:8000/docs`.

---

### 2. Frontend Configuration

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd C:/Users/Anushika/.gemini/antigravity/scratch/hcp-crm/frontend
   ```

2. Install Node.js packages:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend UI will run at `http://localhost:3000`. Vite is pre-configured with a reverse proxy routing `/api` calls directly to the FastAPI server at port `8000`.

---

## Visualizing & Logging Interactions

The module gives you two ways to capture data:
1. **Structured Form**: Manual data entry featuring field validation, clear inputs (HCP name, Hospital, Date, Product discussed, Notes, Follow-up date, Next action), and immediate table refresh.
2. **AI Chat Interface**: An interactive, conversational portal. Simply type naturally, e.g.:
   > *"I met Dr. Sharma today. We discussed Diabetes medicine. He requested samples and wants a follow-up next Monday."*
   The LangGraph Agent intercepts this, triggers `log_interaction_tool`, extracts entities, auto-fills missing fields (calculates relative dates like "next Monday"), and inserts the record into the database. The UI instantly detects this and refreshes your dashboard feed!
