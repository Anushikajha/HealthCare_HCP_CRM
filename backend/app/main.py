import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import interactions
from app.config import HOST, PORT

# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-First HCP CRM API",
    description="Backend CRM Services with Integrated LangGraph Agent & Groq Support",
    version="1.0.0"
)

# Configure CORS to allow access from Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, lock this down to the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(interactions.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "AI-First HCP CRM",
        "api_docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
