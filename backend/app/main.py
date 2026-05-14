# backend/app/main.py
from dotenv import load_dotenv
load_dotenv()
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.routes.auth import router as auth_router
from app.api.routes.documents import router as documents_router
from app.api.routes.health import router as health_router
from app.api.routes.chat import router as chat_router
from app.api.routes.automations import router as automations_router
from app.api.routes.leads import router as leads_router
# FIX: Added the missing import for the analytics router
from app.api.routes.analytics import router as analytics_router
from app.db.database import SessionLocal, engine, Base
import app.models  # ensure all models are loaded for table creation
from app.api.routes.traces import router as traces_router 
from app.models.trace import AgentTrace  
from app.models.automation import TriagedEmail

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup check: verify database connection once when the app starts
    try:
        # Create all tables in the database
        Base.metadata.create_all(bind=engine)
        
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        print("Database connection successful. Tables verified.")
    except Exception as exc:
        print(f"Database connection failed: {exc}")
        raise

    yield

    # Shutdown cleanup can go here later if needed


app = FastAPI(
    title="Smart AI Business Assistant",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(automations_router, prefix="/api/v1")
app.include_router(leads_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(traces_router, prefix="/api/v1")  # Added this line to include the traces router

@app.get("/")
def root():
    return {
        "message": "Smart AI Business Assistant API",
        "status": "running",
    }