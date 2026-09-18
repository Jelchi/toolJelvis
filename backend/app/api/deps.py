from typing import AsyncGenerator
from fastapi import Depends, Header
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import CredentialsException, PermissionDeniedException
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.repositories.workspace_repo import WorkspaceRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "access":
            raise CredentialsException()
    except JWTError:
        raise CredentialsException()

    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if user is None or not user.is_active:
        raise CredentialsException(detail="User inactive or not found")
    return user


async def get_active_workspace_id(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    x_workspace_id: str = Header(None, alias="X-Workspace-Id")
) -> str:
    workspace_repo = WorkspaceRepository(db)
    user_workspaces = await workspace_repo.list_user_workspaces(current_user.id)

    if not user_workspaces:
        # Auto-create default personal workspace if user has none
        slug = f"personal-{current_user.id[:8]}"
        ws = await workspace_repo.create(
            name=f"{current_user.full_name}'s Workspace",
            slug=slug,
            created_by=current_user.id
        )
        return ws.id

    if x_workspace_id:
        valid_ids = [w.id for w in user_workspaces]
        if x_workspace_id in valid_ids:
            return x_workspace_id
        raise PermissionDeniedException(detail="You do not have access to this workspace")

    # Default to first workspace
    return user_workspaces[0].id
