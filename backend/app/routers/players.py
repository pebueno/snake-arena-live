from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/players", tags=["Players"])

@router.get("", response_model=List[schemas.ActivePlayer])
async def get_active_players(db: AsyncSession = Depends(get_db)):
    return await crud.get_active_players(db)

@router.get("/{player_id}", response_model=schemas.ActivePlayer, responses={404: {"model": schemas.Error}})
async def get_player(player_id: str, db: AsyncSession = Depends(get_db)):
    player = await crud.get_active_player(db, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player
