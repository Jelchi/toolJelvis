from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user, get_active_workspace_id
from app.models.user import User
from app.schemas.presentation import PresentationCreate, PresentationUpdate, PresentationResponse
from app.repositories.presentation_repo import PresentationRepository

router = APIRouter()


@router.get("/", response_model=List[PresentationResponse])
async def list_presentations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_active_workspace_id)
):
    repo = PresentationRepository(db)
    return await repo.list_decks(workspace_id)


@router.post("/", response_model=PresentationResponse, status_code=status.HTTP_201_CREATED)
async def create_presentation(
    data: PresentationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_active_workspace_id)
):
    repo = PresentationRepository(db)
    return await repo.create(workspace_id, current_user.id, data)


@router.get("/{deck_id}", response_model=PresentationResponse)
async def get_presentation(
    deck_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_active_workspace_id)
):
    repo = PresentationRepository(db)
    deck = await repo.get_by_id(deck_id, workspace_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Presentation deck not found")
    return deck


@router.put("/{deck_id}", response_model=PresentationResponse)
async def update_presentation(
    deck_id: str,
    data: PresentationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_active_workspace_id)
):
    repo = PresentationRepository(db)
    deck = await repo.get_by_id(deck_id, workspace_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Presentation deck not found")
    return await repo.update(deck, data)


@router.delete("/{deck_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_presentation(
    deck_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_active_workspace_id)
):
    repo = PresentationRepository(db)
    deck = await repo.get_by_id(deck_id, workspace_id)
    if not deck:
        raise HTTPException(status_code=404, detail="Presentation deck not found")
    await repo.delete(deck)
