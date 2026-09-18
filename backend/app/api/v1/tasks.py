from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.repositories.task_repo import TaskRepository
from app.api.deps import get_current_user, get_active_workspace_id
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[TaskResponse])
async def list_tasks(
    status: Optional[str] = Query(None, description="Filter by status: backlog, todo, in_progress, review, done"),
    priority: Optional[str] = Query(None, description="Filter by priority: low, medium, high, urgent"),
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = TaskRepository(db)
    return await repo.list_tasks(workspace_id=workspace_id, status=status, priority=priority)


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_in: TaskCreate,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = TaskRepository(db)
    return await repo.create(workspace_id=workspace_id, owner_id=current_user.id, data=task_in)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_in: TaskUpdate,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = TaskRepository(db)
    task = await repo.get_by_id(task_id=task_id, workspace_id=workspace_id)
    if not task:
        raise NotFoundException(detail="Task not found")
    return await repo.update(task=task, data=task_in)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = TaskRepository(db)
    task = await repo.get_by_id(task_id=task_id, workspace_id=workspace_id)
    if not task:
        raise NotFoundException(detail="Task not found")
    await repo.delete(task=task)


# Daily Task Logs DB endpoints
from app.schemas.daily_log import DailyTaskLogCreate, DailyTaskLogResponse
from app.repositories.daily_log_repo import DailyTaskLogRepository


@router.get("/daily-logs/all", response_model=List[DailyTaskLogResponse])
async def list_daily_task_logs(
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = DailyTaskLogRepository(db)
    return await repo.list_logs(workspace_id=workspace_id)


@router.post("/daily-logs/upsert", response_model=DailyTaskLogResponse)
async def upsert_daily_task_log(
    data: DailyTaskLogCreate,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = DailyTaskLogRepository(db)
    return await repo.upsert(workspace_id=workspace_id, owner_id=current_user.id, data=data)

