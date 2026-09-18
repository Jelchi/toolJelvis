from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate


class TaskRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, workspace_id: str, owner_id: str, data: TaskCreate) -> Task:
        task = Task(
            workspace_id=workspace_id,
            owner_id=owner_id,
            title=data.title,
            description=data.description,
            status=data.status,
            priority=data.priority,
            due_date=data.due_date,
            related_note_id=data.related_note_id,
            is_completed=data.is_completed,
        )
        self.db.add(task)
        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def get_by_id(self, task_id: str, workspace_id: str) -> Optional[Task]:
        result = await self.db.execute(
            select(Task).where(Task.id == task_id, Task.workspace_id == workspace_id)
        )
        return result.scalars().first()

    async def list_tasks(
        self,
        workspace_id: str,
        status: Optional[str] = None,
        priority: Optional[str] = None
    ) -> List[Task]:
        stmt = select(Task).where(Task.workspace_id == workspace_id)
        if status:
            stmt = stmt.where(Task.status == status)
        if priority:
            stmt = stmt.where(Task.priority == priority)
        stmt = stmt.order_by(Task.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def update(self, task: Task, data: TaskUpdate) -> Task:
        if data.title is not None:
            task.title = data.title
        if data.description is not None:
            task.description = data.description
        if data.status is not None:
            task.status = data.status
            if data.status == "done":
                task.is_completed = True
        if data.priority is not None:
            task.priority = data.priority
        if data.due_date is not None:
            task.due_date = data.due_date
        if data.related_note_id is not None:
            task.related_note_id = data.related_note_id
        if data.is_completed is not None:
            task.is_completed = data.is_completed

        task.updated_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def delete(self, task: Task) -> None:
        await self.db.delete(task)
        await self.db.commit()
