from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.presentation import PresentationDeck
from app.schemas.presentation import PresentationCreate, PresentationUpdate


class PresentationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, workspace_id: str, owner_id: str, data: PresentationCreate) -> PresentationDeck:
        deck = PresentationDeck(
            workspace_id=workspace_id,
            owner_id=owner_id,
            title=data.title,
            description=data.description,
            slides_json=data.slides_json,
        )
        self.db.add(deck)
        await self.db.commit()
        await self.db.refresh(deck)
        return deck

    async def get_by_id(self, deck_id: str, workspace_id: str) -> Optional[PresentationDeck]:
        result = await self.db.execute(
            select(PresentationDeck).where(PresentationDeck.id == deck_id, PresentationDeck.workspace_id == workspace_id)
        )
        return result.scalars().first()

    async def list_decks(self, workspace_id: str) -> List[PresentationDeck]:
        result = await self.db.execute(
            select(PresentationDeck)
            .where(PresentationDeck.workspace_id == workspace_id)
            .order_by(PresentationDeck.updated_at.desc())
        )
        return list(result.scalars().all())

    async def update(self, deck: PresentationDeck, data: PresentationUpdate) -> PresentationDeck:
        if data.title is not None:
            deck.title = data.title
        if data.description is not None:
            deck.description = data.description
        if data.slides_json is not None:
            deck.slides_json = data.slides_json

        deck.updated_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(deck)
        return deck

    async def delete(self, deck: PresentationDeck) -> None:
        await self.db.delete(deck)
        await self.db.commit()
