from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from app.models.user import User
from app.core.security import get_password_hash


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalars().first()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email.lower()))
        return result.scalars().first()

    async def get_by_email_or_username(self, identifier: str) -> Optional[User]:
        clean_id = identifier.strip().lower()
        result = await self.db.execute(
            select(User).where(
                or_(
                    User.email == clean_id,
                    User.username == clean_id
                )
            )
        )
        return result.scalars().first()

    async def create(self, email: str, password: str, full_name: str, username: Optional[str] = None) -> User:
        user = User(
            email=email.lower(),
            username=username.lower() if username else None,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            password_changed_at=datetime.now(timezone.utc),
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update_password(self, user: User, new_password: str) -> User:
        user.hashed_password = get_password_hash(new_password)
        user.password_changed_at = datetime.now(timezone.utc)
        user.updated_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(user)
        return user
