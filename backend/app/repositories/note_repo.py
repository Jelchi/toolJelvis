from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_
from app.models.note import Note, NoteTag
from app.schemas.note import NoteCreate, NoteUpdate


class NoteRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, workspace_id: str, owner_id: str, data: NoteCreate) -> Note:
        note = Note(
            workspace_id=workspace_id,
            owner_id=owner_id,
            title=data.title,
            content=data.content or "",
            status=data.status,
            is_favorite=data.is_favorite,
        )
        self.db.add(note)
        await self.db.commit()
        await self.db.refresh(note)

        if data.tags:
            for tag_name in data.tags:
                tag = NoteTag(note_id=note.id, tag=tag_name.strip().lower())
                self.db.add(tag)
            await self.db.commit()
            await self.db.refresh(note)

        return note

    async def get_by_id(self, note_id: str, workspace_id: str) -> Optional[Note]:
        stmt = select(Note).where(
            Note.id == note_id,
            Note.workspace_id == workspace_id,
            Note.is_deleted == False
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def list_notes(
        self,
        workspace_id: str,
        search: Optional[str] = None,
        tag: Optional[str] = None,
        is_favorite: Optional[bool] = None,
        include_deleted: bool = False
    ) -> List[Note]:
        stmt = select(Note).where(Note.workspace_id == workspace_id)

        if not include_deleted:
            stmt = stmt.where(Note.is_deleted == False)

        if is_favorite is not None:
            stmt = stmt.where(Note.is_favorite == is_favorite)

        if search:
            search_pattern = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    Note.title.ilike(search_pattern),
                    Note.content.ilike(search_pattern)
                )
            )

        if tag:
            stmt = stmt.join(NoteTag).where(NoteTag.tag == tag.strip().lower())

        stmt = stmt.order_by(Note.updated_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().unique().all())

    async def update(self, note: Note, data: NoteUpdate) -> Note:
        if data.title is not None:
            note.title = data.title
        if data.content is not None:
            note.content = data.content
        if data.status is not None:
            note.status = data.status
        if data.is_favorite is not None:
            note.is_favorite = data.is_favorite

        note.updated_at = datetime.now(timezone.utc)

        if data.tags is not None:
            # Clear existing tags and re-add
            for tag in note.tags:
                await self.db.delete(tag)
            await self.db.commit()

            for tag_name in data.tags:
                new_tag = NoteTag(note_id=note.id, tag=tag_name.strip().lower())
                self.db.add(new_tag)

        await self.db.commit()
        await self.db.refresh(note)
        return note

    async def soft_delete(self, note: Note) -> Note:
        note.is_deleted = True
        note.deleted_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(note)
        return note

    async def restore(self, note: Note) -> Note:
        note.is_deleted = False
        note.deleted_at = None
        await self.db.commit()
        await self.db.refresh(note)
        return note
