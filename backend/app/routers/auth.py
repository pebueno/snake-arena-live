from fastapi import APIRouter, HTTPException, Response, Depends, Cookie
from sqlalchemy.ext.asyncio import AsyncSession
from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup", response_model=schemas.User, status_code=201, responses={400: {"model": schemas.Error}})
async def signup(user_create: schemas.UserCreate, response: Response, db: AsyncSession = Depends(get_db)):
    try:
        # Check if user exists
        if await crud.get_user_by_email(db, user_create.email):
            raise HTTPException(status_code=400, detail="Email already registered")
        if await crud.get_user_by_username(db, user_create.username):
            raise HTTPException(status_code=400, detail="Username already taken")

        user = await crud.create_user(db, user_create)
        # Set session cookie (simplified for mock)
        response.set_cookie(key="session_id", value=user.email)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=schemas.User, responses={401: {"model": schemas.Error}})
async def login(user_login: schemas.UserLogin, response: Response, db: AsyncSession = Depends(get_db)):
    if not await crud.verify_password(db, user_login.email, user_login.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = await crud.get_user_by_email(db, user_login.email)
    # Set session cookie
    response.set_cookie(key="session_id", value=user.email)
    return user

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("session_id")
    return {"message": "Logout successful"}

@router.get("/me", response_model=schemas.User, responses={401: {"model": schemas.Error}})
async def get_me(session_id: str | None = Cookie(default=None), db: AsyncSession = Depends(get_db)):
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await crud.get_user_by_email(db, session_id)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return user
