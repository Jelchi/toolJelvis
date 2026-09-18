from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    requires_password_change: bool = False
    password_age_days: int = 0
    message: Optional[str] = None


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    type: Optional[str] = None


class UserBase(BaseModel):
    email: str
    username: Optional[str] = None
    full_name: str


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: str  # Can be email 'jelvis@bcas.co.id' or username 'jelvis'
    password: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


class UserResponse(UserBase):
    id: str
    is_active: bool
    is_superuser: bool
    password_changed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
