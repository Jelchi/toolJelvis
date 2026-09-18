from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class PresentationBase(BaseModel):
    title: str
    description: Optional[str] = None
    slides_json: str = "[]"


class PresentationCreate(PresentationBase):
    pass


class PresentationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    slides_json: Optional[str] = None


class PresentationResponse(PresentationBase):
    id: str
    workspace_id: str
    owner_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
