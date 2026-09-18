from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class ProcessedImageBase(BaseModel):
    title: Optional[str] = "BG Removed Image"
    original_url: Optional[str] = None
    processed_url: str
    bg_type: Optional[str] = "transparent"


class ProcessedImageCreate(ProcessedImageBase):
    pass


class ProcessedImageResponse(ProcessedImageBase):
    id: str
    workspace_id: str
    owner_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
