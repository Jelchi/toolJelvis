from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.schemas.diagram import DiagramCreate, DiagramUpdate, DiagramResponse
from app.repositories.diagram_repo import DiagramRepository
from app.api.deps import get_current_user, get_active_workspace_id
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[DiagramResponse])
async def list_diagrams(
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = DiagramRepository(db)
    return await repo.list_diagrams(workspace_id=workspace_id)


@router.post("/", response_model=DiagramResponse, status_code=status.HTTP_201_CREATED)
async def create_diagram(
    diagram_in: DiagramCreate,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = DiagramRepository(db)
    return await repo.create(workspace_id=workspace_id, owner_id=current_user.id, data=diagram_in)


@router.get("/{diagram_id}", response_model=DiagramResponse)
async def get_diagram(
    diagram_id: str,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = DiagramRepository(db)
    diagram = await repo.get_by_id(diagram_id=diagram_id, workspace_id=workspace_id)
    if not diagram:
        raise NotFoundException(detail="Diagram not found")
    return diagram


@router.put("/{diagram_id}", response_model=DiagramResponse)
async def update_diagram(
    diagram_id: str,
    diagram_in: DiagramUpdate,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = DiagramRepository(db)
    diagram = await repo.get_by_id(diagram_id=diagram_id, workspace_id=workspace_id)
    if not diagram:
        raise NotFoundException(detail="Diagram not found")
    return await repo.update(diagram=diagram, data=diagram_in)


@router.delete("/{diagram_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_diagram(
    diagram_id: str,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = DiagramRepository(db)
    diagram = await repo.get_by_id(diagram_id=diagram_id, workspace_id=workspace_id)
    if not diagram:
        raise NotFoundException(detail="Diagram not found")
    await repo.delete(diagram=diagram)
