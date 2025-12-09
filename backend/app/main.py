from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
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

# Include routers (MUST be before SPA catch-all)
app.include_router(auth.router)
app.include_router(leaderboard.router)
app.include_router(players.router)

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
    allow_origins=["*"], # Allow all origins for now (or restrict to frontend URL)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
# We expect the frontend build to be in app/static
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

# SPA wrapper
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # If API route is not matched above, it falls through to here.
    # Check if file exists in static (e.g. favicon.ico, etc that are in root of dist)
    if os.path.exists(static_dir):
        file_path = os.path.join(static_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
    
    # Otherwise return index.html
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return JSONResponse({"error": "Frontend not found"}, status_code=404)



@app.get("/")
async def root():
    return {"message": "Welcome to Snake Arena API"}
