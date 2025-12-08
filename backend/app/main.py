from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, leaderboard, players

from contextlib import asynccontextmanager
from .database import init_db
from .seed import seed_data
import os
import logging
import traceback

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB (create tables)
    logger.info("Initializing database...")
    await init_db()
    
    # Auto-seed if requested
    if os.getenv("SEED_DB", "false").lower() == "true":
        logger.info("Seeding database...")
        try:
            await seed_data()
        except Exception as e:
            logger.error(f"Failed to seed database: {e}")
            traceback.print_exc()
            
    yield

app = FastAPI(
    title="Snake Arena API",
    version="1.0.0",
    description="API for the Snake Arena game backend.",
    lifespan=lifespan
)

# Global Exception Handler for debugging 500s
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "detail": str(exc)},
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
