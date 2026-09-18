from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.workspace import Workspace, WorkspaceMember


class WorkspaceRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, name: str, slug: str, created_by: str, description: Optional[str] = None) -> Workspace:
        workspace = Workspace(
            name=name,
            slug=slug,
            created_by=created_by,
            description=description,
        )
        self.db.add(workspace)
        await self.db.commit()
        await self.db.refresh(workspace)

        # Add creator as workspace member
        member = WorkspaceMember(
            workspace_id=workspace.id,
            user_id=created_by,
        )
        self.db.add(member)
        await self.db.commit()
        return workspace

    async def get_by_id(self, workspace_id: str) -> Optional[Workspace]:
        result = await self.db.execute(select(Workspace).where(Workspace.id == workspace_id))
        return result.scalars().first()

    async def list_user_workspaces(self, user_id: str) -> List[Workspace]:
        result = await self.db.execute(
            select(Workspace)
            .join(WorkspaceMember, Workspace.id == WorkspaceMember.workspace_id)
            .where(WorkspaceMember.user_id == user_id)
        )
        return list(result.scalars().all())
