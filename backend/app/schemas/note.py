from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class NoteTagSchema(BaseModel):
    tag: str

    model_config = ConfigDict(from_attributes=True)


class NoteBase(BaseModel):
    title: str = "Untitled Note"
    content: Optional[str] = ""
    status: str = "active"
    is_favorite: bool = False
    tags: List[str] = []


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    status: Optional[str] = None
    is_favorite: Optional[bool] = None
    tags: Optional[List[str]] = None


class NoteResponse(BaseModel):
    id: str
    workspace_id: str
    owner_id: str
    title: str
    content: Optional[str] = ""
    status: str
    is_favorite: bool
    is_deleted: bool
    tags: List[str] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
