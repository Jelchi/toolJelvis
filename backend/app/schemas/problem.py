from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class ProblemBase(BaseModel):
    ticket_number: str
    title: str
    description: Optional[str] = None
    category: Optional[str] = "General"
    image_url: Optional[str] = None
    status: str = "open"
    priority: str = "medium"
    solution: Optional[str] = None
    opened_date: Optional[datetime] = None
    resolved_date: Optional[datetime] = None
    reminder_at: Optional[datetime] = None


class ProblemCreate(ProblemBase):
    pass


class ProblemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    solution: Optional[str] = None
    resolved_date: Optional[datetime] = None
    reminder_at: Optional[datetime] = None


class ProblemResponse(ProblemBase):
    id: str
    workspace_id: str
    owner_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
