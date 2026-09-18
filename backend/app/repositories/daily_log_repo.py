from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.daily_log import DailyTaskLog
from app.schemas.daily_log import DailyTaskLogCreate, DailyTaskLogUpdate


class DailyTaskLogRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def upsert(self, workspace_id: str, owner_id: str, data: DailyTaskLogCreate) -> DailyTaskLog:
        # Check if log for log_date exists
        result = await self.db.execute(
            select(DailyTaskLog).where(
                DailyTaskLog.workspace_id == workspace_id,
                DailyTaskLog.log_date == data.log_date
            )
        )
        existing = result.scalars().first()

        if existing:
            if data.log_date_formatted:
                existing.log_date_formatted = data.log_date_formatted
            if data.tasks_done_json:
                existing.tasks_done_json = data.tasks_done_json
            if data.tasks_in_progress_json:
                existing.tasks_in_progress_json = data.tasks_in_progress_json
            if data.reflection_note is not None:
                existing.reflection_note = data.reflection_note
            existing.updated_at = datetime.now(timezone.utc)
            await self.db.commit()
            await self.db.refresh(existing)
            return existing

        new_log = DailyTaskLog(
            workspace_id=workspace_id,
            owner_id=owner_id,
            log_date=data.log_date,
            log_date_formatted=data.log_date_formatted,
            tasks_done_json=data.tasks_done_json or "[]",
            tasks_in_progress_json=data.tasks_in_progress_json or "[]",
            reflection_note=data.reflection_note,
        )
        self.db.add(new_log)
        await self.db.commit()
        await self.db.refresh(new_log)
        return new_log

    async def get_by_date(self, log_date: str, workspace_id: str) -> Optional[DailyTaskLog]:
        result = await self.db.execute(
            select(DailyTaskLog).where(
                DailyTaskLog.workspace_id == workspace_id,
                DailyTaskLog.log_date == log_date
            )
        )
        return result.scalars().first()

    async def list_logs(self, workspace_id: str) -> List[DailyTaskLog]:
        result = await self.db.execute(
            select(DailyTaskLog)
            .where(DailyTaskLog.workspace_id == workspace_id)
            .order_by(DailyTaskLog.log_date.desc())
        )
        return list(result.scalars().all())
