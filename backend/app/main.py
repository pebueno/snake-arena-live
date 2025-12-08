from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, leaderboard, players

from contextlib import asynccontextmanager
from .database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB (create tables)
    await init_db()
    yield

app = FastAPI(
    title="Snake Arena API",
    version="1.0.0",
    description="API for the Snake Arena game backend.",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], # Adjust as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(leaderboard.router)
app.include_router(players.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Snake Arena API"}
