# backend/app/main.py

import os

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
from app.api.routes.analytics import router as analytics_router
from app.api.routes.traces import router as traces_router

from app.db.database import SessionLocal, engine, Base

import app.models

from app.models.trace import AgentTrace
from app.models.automation import TriagedEmail


@asynccontextmanager
async def lifespan(app: FastAPI):

    # Startup Logic
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)

        # Verify DB connection
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()

        print("✅ Database connection successful.")
        print("✅ Tables verified successfully.")

    except Exception as exc:
        print(f"❌ Database startup failed: {exc}")
        raise

    yield

    # Shutdown Logic (future cleanup)
    print("🛑 Application shutdown complete.")


app = FastAPI(
    title="Smart AI Business Assistant",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------
# Dynamic CORS Configuration
# ---------------------------------------------------

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

frontend_url = os.getenv("FRONTEND_URL")

if frontend_url:
    origins.append(frontend_url)

print(f"✅ Allowed CORS Origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------
# API Routes
# ---------------------------------------------------

app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(automations_router, prefix="/api/v1")
app.include_router(leads_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(traces_router, prefix="/api/v1")

# ---------------------------------------------------
# Root Endpoint
# ---------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Smart AI Business Assistant API",
        "status": "running",
        "version": "1.0.0",
    }