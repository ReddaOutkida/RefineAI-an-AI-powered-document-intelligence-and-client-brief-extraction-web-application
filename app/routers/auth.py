from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas import UserCreate, UserLogin
from app.utils.security import hash_password, verify_password, create_access_token
from app.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup")
async def signup(user: UserCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(user.password)
    user_dict = user.dict()
    user_dict["hashed_password"] = hashed
    del user_dict["password"]
    user_dict["docs"] = []
    result = await db.users.insert_one(user_dict)
    return {"msg": "User created", "id": str(result.inserted_id)}

@router.post("/login")
async def login(user: UserLogin, db: AsyncIOMotorDatabase = Depends(get_database)):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(db_user["_id"])})
    return {"access_token": token, "token_type": "bearer"} 