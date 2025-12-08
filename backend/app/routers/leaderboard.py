from fastapi import APIRouter, HTTPException, Query, Cookie, Depends
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("", response_model=List[schemas.LeaderboardEntry])
async def get_leaderboard(
    mode: Optional[schemas.GameMode] = None,
    limit: int = Query(default=10, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    return await crud.get_leaderboard(db, mode, limit)

@router.post("", response_model=schemas.ScoreResponse, status_code=201, responses={401: {"model": schemas.Error}})
async def submit_score(
    score_submit: schemas.ScoreSubmit,
    session_id: str | None = Cookie(default=None),
    db: AsyncSession = Depends(get_db)
):
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await crud.get_user_by_email(db, session_id)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        rank = await crud.submit_score(db, user.id, user.username, score_submit.score, score_submit.mode)
        return schemas.ScoreResponse(success=True, rank=rank)
    except ValueError as e:
        # Should not happen if user exists
        raise HTTPException(status_code=400, detail=str(e))
