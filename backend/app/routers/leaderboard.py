from fastapi import APIRouter, HTTPException, Query, Cookie
from typing import List, Optional
from ..models import LeaderboardEntry, ScoreSubmit, ScoreResponse, GameMode, Error
from ..db import db

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    mode: Optional[GameMode] = None,
    limit: int = Query(default=10, ge=1, le=100)
):
    return db.get_leaderboard(mode, limit)

@router.post("", response_model=ScoreResponse, status_code=201, responses={401: {"model": Error}})
async def submit_score(
    score_submit: ScoreSubmit,
    session_id: str | None = Cookie(default=None)
):
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = db.get_user_by_email(session_id)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        rank = db.submit_score(user.id, score_submit.score, score_submit.mode)
        return ScoreResponse(success=True, rank=rank)
    except ValueError as e:
        # Should not happen if user exists
        raise HTTPException(status_code=400, detail=str(e))
