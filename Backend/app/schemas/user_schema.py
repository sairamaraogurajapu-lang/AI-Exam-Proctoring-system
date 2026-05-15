from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    student_id: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = Field(None, ge=2000, le=2030)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=72)
    
    @validator('password')
    def validate_password_length(cls, v):
        """Ensure password doesn't exceed 72 bytes"""
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password cannot exceed 72 bytes')
        return v

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    student_id: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., max_length=72)
    
    @validator('password')
    def validate_password_length(cls, v):
        """Ensure password doesn't exceed 72 bytes"""
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password cannot exceed 72 bytes')
        return v

class Token(BaseModel):
    access_token: str
    token_type: str