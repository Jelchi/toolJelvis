import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class DailyTaskLog(Base):
    __tablename__ = "daily_task_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    workspace_id: Mapped[str] = mapped_column(String(36), ForeignKey("workspaces.id"), nullable=False, index=True)
    owner_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    log_date: Mapped[str] = mapped_column(String(20), nullable=False, index=True)  # YYYY-MM-DD
    log_date_formatted: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    tasks_done_json: Mapped[str] = mapped_column(Text, default="[]")
    tasks_in_progress_json: Mapped[str] = mapped_column(Text, default="[]")
    reflection_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
