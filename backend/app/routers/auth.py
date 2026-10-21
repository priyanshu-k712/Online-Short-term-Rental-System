from pymongo.errors import DuplicateKeyError
from fastapi import APIRouter, Depends, HTTPException, status

from ..database import db
from ..dependencies import get_current_user
from ..schemas import TokenResponse, UserCreate, UserLogin, UserPublic
from ..security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])


def public_user(user_document: dict) -> dict:
    return {
        "id": str(user_document["_id"]),
        "name": user_document["name"],
        "email": user_document["email"],
        "role": user_document["role"],
    }


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate):
    if db.users.find_one({"email": payload.email}):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user_document = {
        "name": payload.name,
        "email": payload.email,
        "password_hash": hash_password(payload.password),
        "role": payload.role,
    }

    try:
        result = db.users.insert_one(user_document)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    created_user = db.users.find_one({"_id": result.inserted_id})
    return public_user(created_user)


@router.post("/login", response_model=TokenResponse)
def login_user(payload: UserLogin):
    user = db.users.find_one({"email": payload.email})
    if user is None or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    safe_user = public_user(user)
    token = create_access_token(safe_user["id"], safe_user["role"])
    return {"access_token": token, "token_type": "bearer", "user": safe_user}


@router.get("/me", response_model=UserPublic)
def get_my_profile(current_user: dict = Depends(get_current_user)):
    return current_user
