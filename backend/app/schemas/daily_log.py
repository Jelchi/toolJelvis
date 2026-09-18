from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class DailyTaskLogBase(BaseModel):
    log_date: str
    log_date_formatted: Optional[str] = None
    tasks_done_json: Optional[str] = "[]"
    tasks_in_progress_json: Optional[str] = "[]"
    reflection_note: Optional[str] = None


class DailyTaskLogCreate(DailyTaskLogBase):
    pass


class DailyTaskLogUpdate(BaseModel):
    log_date_formatted: Optional[str] = None
    tasks_done_json: Optional[str] = None
    tasks_in_progress_json: Optional[str] = None
    reflection_note: Optional[str] = None


class DailyTaskLogResponse(DailyTaskLogBase):
    id: str
    workspace_id: str
    owner_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
