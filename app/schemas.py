from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: str
    docs: List[str] = []

class DocumentBase(BaseModel):
    filename: str
    metadata: Optional[dict] = {}

class DocumentCreate(DocumentBase):
    pass

class DocumentOut(DocumentBase):
    id: str
    user_id: str
    upload_date: datetime
    file_path: str 