import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hcp_crm.db")
LLM_MODEL = os.getenv("LLM_MODEL", "gemma2-9b-it")
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")

# Support for future model switching
SUPPORTED_MODELS = {
    "gemma": "gemma2-9b-it",
    "llama": "llama-3.3-70b-versatile"
}
