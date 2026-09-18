from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.diagram import Diagram
from app.schemas.diagram import DiagramCreate, DiagramUpdate


class DiagramRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, workspace_id: str, owner_id: str, data: DiagramCreate) -> Diagram:
        diagram = Diagram(
            workspace_id=workspace_id,
            owner_id=owner_id,
            title=data.title,
            diagram_type=data.diagram_type,
            nodes_data=data.nodes_data,
            edges_data=data.edges_data,
            thumbnail_url=data.thumbnail_url,
        )
        self.db.add(diagram)
        await self.db.commit()
        await self.db.refresh(diagram)
        return diagram

    async def get_by_id(self, diagram_id: str, workspace_id: str) -> Optional[Diagram]:
        result = await self.db.execute(
            select(Diagram).where(Diagram.id == diagram_id, Diagram.workspace_id == workspace_id)
        )
        return result.scalars().first()

    async def list_diagrams(self, workspace_id: str) -> List[Diagram]:
        result = await self.db.execute(
            select(Diagram).where(Diagram.workspace_id == workspace_id).order_by(Diagram.updated_at.desc())
        )
        return list(result.scalars().all())

    async def update(self, diagram: Diagram, data: DiagramUpdate) -> Diagram:
        if data.title is not None:
            diagram.title = data.title
        if data.diagram_type is not None:
            diagram.diagram_type = data.diagram_type
        if data.nodes_data is not None:
            diagram.nodes_data = data.nodes_data
        if data.edges_data is not None:
            diagram.edges_data = data.edges_data
        if data.thumbnail_url is not None:
            diagram.thumbnail_url = data.thumbnail_url

        diagram.updated_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(diagram)
        return diagram

    async def delete(self, diagram: Diagram) -> None:
        await self.db.delete(diagram)
        await self.db.commit()
