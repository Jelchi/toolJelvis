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


class ProcessedImage(Base):
    __tablename__ = "processed_images"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    workspace_id: Mapped[str] = mapped_column(String(36), ForeignKey("workspaces.id"), nullable=False, index=True)
    owner_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), default="BG Removed Image")
    original_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    processed_url: Mapped[str] = mapped_column(Text, nullable=False)
    bg_type: Mapped[str] = mapped_column(String(50), default="transparent")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
