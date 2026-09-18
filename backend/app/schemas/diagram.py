from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class DiagramBase(BaseModel):
    title: str = "Untitled Diagram"
    diagram_type: str = "flowchart"
    nodes_data: str = "[]"
    edges_data: str = "[]"
    thumbnail_url: Optional[str] = None


class DiagramCreate(DiagramBase):
    pass


class DiagramUpdate(BaseModel):
    title: Optional[str] = None
    diagram_type: Optional[str] = None
    nodes_data: Optional[str] = None
    edges_data: Optional[str] = None
    thumbnail_url: Optional[str] = None


class DiagramResponse(DiagramBase):
    id: str
    workspace_id: str
    owner_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
