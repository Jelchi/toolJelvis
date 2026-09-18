from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse
from app.repositories.note_repo import NoteRepository
from app.api.deps import get_current_user, get_active_workspace_id
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[NoteResponse])
async def list_notes(
    search: Optional[str] = Query(None, description="Search keyword in title or content"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    is_favorite: Optional[bool] = Query(None, description="Filter by favorite status"),
    include_deleted: bool = Query(False, description="Include soft deleted notes"),
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = NoteRepository(db)
    notes = await repo.list_notes(
        workspace_id=workspace_id,
        search=search,
        tag=tag,
        is_favorite=is_favorite,
        include_deleted=include_deleted
    )

    # Convert SQLAlchemy model tags to simple list of tag strings for response schema
    response_notes = []
    for note in notes:
        tag_list = [t.tag for t in note.tags]
        note_dict = {
            "id": note.id,
            "workspace_id": note.workspace_id,
            "owner_id": note.owner_id,
            "title": note.title,
            "content": note.content,
            "status": note.status,
            "is_favorite": note.is_favorite,
            "is_deleted": note.is_deleted,
            "tags": tag_list,
            "created_at": note.created_at,
            "updated_at": note.updated_at,
        }
        response_notes.append(NoteResponse(**note_dict))
    return response_notes


@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_in: NoteCreate,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = NoteRepository(db)
    note = await repo.create(workspace_id=workspace_id, owner_id=current_user.id, data=note_in)
    tag_list = [t.tag for t in note.tags]
    return NoteResponse(
        id=note.id,
        workspace_id=note.workspace_id,
        owner_id=note.owner_id,
        title=note.title,
        content=note.content,
        status=note.status,
        is_favorite=note.is_favorite,
        is_deleted=note.is_deleted,
        tags=tag_list,
        created_at=note.created_at,
        updated_at=note.updated_at,
    )


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: str,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = NoteRepository(db)
    note = await repo.get_by_id(note_id=note_id, workspace_id=workspace_id)
    if not note:
        raise NotFoundException(detail="Note not found or deleted")
    tag_list = [t.tag for t in note.tags]
    return NoteResponse(
        id=note.id,
        workspace_id=note.workspace_id,
        owner_id=note.owner_id,
        title=note.title,
        content=note.content,
        status=note.status,
        is_favorite=note.is_favorite,
        is_deleted=note.is_deleted,
        tags=tag_list,
        created_at=note.created_at,
        updated_at=note.updated_at,
    )


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: str,
    note_in: NoteUpdate,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = NoteRepository(db)
    note = await repo.get_by_id(note_id=note_id, workspace_id=workspace_id)
    if not note:
        raise NotFoundException(detail="Note not found")
    updated_note = await repo.update(note=note, data=note_in)
    tag_list = [t.tag for t in updated_note.tags]
    return NoteResponse(
        id=updated_note.id,
        workspace_id=updated_note.workspace_id,
        owner_id=updated_note.owner_id,
        title=updated_note.title,
        content=updated_note.content,
        status=updated_note.status,
        is_favorite=updated_note.is_favorite,
        is_deleted=updated_note.is_deleted,
        tags=tag_list,
        created_at=updated_note.created_at,
        updated_at=updated_note.updated_at,
    )


@router.delete("/{note_id}", response_model=NoteResponse)
async def delete_note(
    note_id: str,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = NoteRepository(db)
    note = await repo.get_by_id(note_id=note_id, workspace_id=workspace_id)
    if not note:
        raise NotFoundException(detail="Note not found")
    deleted_note = await repo.soft_delete(note=note)
    tag_list = [t.tag for t in deleted_note.tags]
    return NoteResponse(
        id=deleted_note.id,
        workspace_id=deleted_note.workspace_id,
        owner_id=deleted_note.owner_id,
        title=deleted_note.title,
        content=deleted_note.content,
        status=deleted_note.status,
        is_favorite=deleted_note.is_favorite,
        is_deleted=deleted_note.is_deleted,
        tags=tag_list,
        created_at=deleted_note.created_at,
        updated_at=deleted_note.updated_at,
    )


@router.post("/{note_id}/restore", response_model=NoteResponse)
async def restore_note(
    note_id: str,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = NoteRepository(db)
    note = await repo.get_by_id(note_id=note_id, workspace_id=workspace_id)
    if not note:
        raise NotFoundException(detail="Note not found")
    restored_note = await repo.restore(note=note)
    tag_list = [t.tag for t in restored_note.tags]
    return NoteResponse(
        id=restored_note.id,
        workspace_id=restored_note.workspace_id,
        owner_id=restored_note.owner_id,
        title=restored_note.title,
        content=restored_note.content,
        status=restored_note.status,
        is_favorite=restored_note.is_favorite,
        is_deleted=restored_note.is_deleted,
        tags=tag_list,
        created_at=restored_note.created_at,
        updated_at=restored_note.updated_at,
    )
