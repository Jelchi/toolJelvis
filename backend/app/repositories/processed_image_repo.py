from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.processed_image import ProcessedImage
from app.schemas.processed_image import ProcessedImageCreate


class ProcessedImageRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, workspace_id: str, owner_id: str, data: ProcessedImageCreate) -> ProcessedImage:
        item = ProcessedImage(
            workspace_id=workspace_id,
            owner_id=owner_id,
            title=data.title or "BG Removed Image",
            original_url=data.original_url,
            processed_url=data.processed_url,
            bg_type=data.bg_type or "transparent",
        )
        self.db.add(item)
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def list_images(self, workspace_id: str) -> List[ProcessedImage]:
        result = await self.db.execute(
            select(ProcessedImage)
            .where(ProcessedImage.workspace_id == workspace_id)
            .order_by(ProcessedImage.created_at.desc())
        )
        return list(result.scalars().all())
