from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.problem import ProblemTicket
from app.schemas.problem import ProblemCreate, ProblemUpdate


class ProblemRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, workspace_id: str, owner_id: str, data: ProblemCreate) -> ProblemTicket:
        ticket = ProblemTicket(
            workspace_id=workspace_id,
            owner_id=owner_id,
            ticket_number=data.ticket_number,
            title=data.title,
            description=data.description,
            category=data.category or "General",
            image_url=data.image_url,
            status=data.status,
            priority=data.priority,
            solution=data.solution,
            opened_date=data.opened_date or datetime.now(timezone.utc),
            resolved_date=data.resolved_date,
            reminder_at=data.reminder_at,
        )
        self.db.add(ticket)
        await self.db.commit()
        await self.db.refresh(ticket)
        return ticket

    async def get_by_id(self, problem_id: str, workspace_id: str) -> Optional[ProblemTicket]:
        result = await self.db.execute(
            select(ProblemTicket).where(ProblemTicket.id == problem_id, ProblemTicket.workspace_id == workspace_id)
        )
        return result.scalars().first()

    async def list_problems(self, workspace_id: str) -> List[ProblemTicket]:
        result = await self.db.execute(
            select(ProblemTicket)
            .where(ProblemTicket.workspace_id == workspace_id)
            .order_by(ProblemTicket.opened_date.desc())
        )
        return list(result.scalars().all())

    async def update(self, ticket: ProblemTicket, data: ProblemUpdate) -> ProblemTicket:
        if data.title is not None:
            ticket.title = data.title
        if data.description is not None:
            ticket.description = data.description
        if data.category is not None:
            ticket.category = data.category
        if data.image_url is not None:
            ticket.image_url = data.image_url
        if data.status is not None:
            ticket.status = data.status
            if data.status in ["resolved", "closed"] and not ticket.resolved_date:
                ticket.resolved_date = datetime.now(timezone.utc)
        if data.priority is not None:
            ticket.priority = data.priority
        if data.solution is not None:
            ticket.solution = data.solution
        if data.resolved_date is not None:
            ticket.resolved_date = data.resolved_date
        if data.reminder_at is not None:
            ticket.reminder_at = data.reminder_at

        ticket.updated_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(ticket)
        return ticket

    async def delete(self, ticket: ProblemTicket) -> None:
        await self.db.delete(ticket)
        await self.db.commit()
