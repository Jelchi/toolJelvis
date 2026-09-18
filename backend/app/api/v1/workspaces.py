from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.workspace import WorkspaceCreate, WorkspaceResponse
from app.repositories.workspace_repo import WorkspaceRepository
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[WorkspaceResponse])
async def list_workspaces(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    ws_repo = WorkspaceRepository(db)
    return await ws_repo.list_user_workspaces(current_user.id)


@router.post("/", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    ws_in: WorkspaceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    ws_repo = WorkspaceRepository(db)
    slug = ws_in.name.lower().replace(" ", "-") + f"-{current_user.id[:4]}"
    return await ws_repo.create(
        name=ws_in.name,
        slug=slug,
        created_by=current_user.id,
        description=ws_in.description,
    )
