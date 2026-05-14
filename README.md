# Smart AI Business Assistant Platform

A production-ready AI business assistant platform designed for SMEs. Features include conversational lead capture, dynamic knowledge retrieval (RAG), and business workflows managed by a LangGraph multi-agent architecture.

## Tech Stack
- **Backend**: FastAPI, Python 3.12, LangGraph, SQLAlchemy, Neon Serverless Postgres, PGVector.
- **Frontend**: React (Vite), Tailwind CSS, enterprise-style UI, Recharts.
- **AI**: Google Gemini (primary), Groq Llama 3 (fallback), HuggingFace embeddings.
- **Deployment**: Docker & Docker Compose.

## Prerequisites
- Docker and Docker Compose
- Node.js v20+ (if running locally without Docker)
- Python 3.12 (if running locally without Docker)
- Neon PostgreSQL connection string
- Gemini API Key
- Groq API Key

## Environment Variables
1. Copy `backend/.env.example` to `backend/.env`.
2. Fill in the required API keys and the Neon database URL.

```ini
DATABASE_URL=postgresql+psycopg://user:pass@host/dbname
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
JWT_SECRET_KEY=generate_a_secure_random_string_here
```

## Quickstart (Docker)

To spin up the entire platform (FastAPI backend + React frontend):

```bash
docker-compose up --build
```

- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

## Features
- **Conversational Lead Capture**: Chat interface extracts name, email, company, and intent seamlessly.
- **Knowledge Base (RAG)**: Upload `.txt` and `.md` files; chunks are embedded and stored in PGVector.
- **Workflows**: Trigger automated emails, summarize contexts, and sync data.
- **Enterprise Dashboard**: Secure JWT-protected admin views for Leads, Chat, Analytics, and Workflows.
