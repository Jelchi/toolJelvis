from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import verify_password, create_access_token, create_refresh_token
from app.core.exceptions import BadRequestException, CredentialsException
from app.schemas.auth import UserCreate, UserLogin, Token, UserResponse, ChangePasswordRequest
from app.repositories.user_repo import UserRepository
from app.repositories.workspace_repo import WorkspaceRepository
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    user_repo = UserRepository(db)
    existing_user = await user_repo.get_by_email(user_in.email)
    if existing_user:
        raise BadRequestException(detail="Email is already registered")

    user = await user_repo.create(
        email=user_in.email,
        username=user_in.username,
        password=user_in.password,
        full_name=user_in.full_name,
    )

    # Auto create initial workspace for user
    ws_repo = WorkspaceRepository(db)
    await ws_repo.create(
        name=f"{user.full_name}'s Workspace",
        slug=f"workspace-{user.id[:8]}",
        created_by=user.id,
    )

    return user


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    user_repo = UserRepository(db)
    user = await user_repo.get_by_email_or_username(credentials.email)
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise CredentialsException(detail="Incorrect username/email or password")

    # Calculate password age in days
    now = datetime.now(timezone.utc)
    password_changed_at = user.password_changed_at or user.created_at
    if password_changed_at.tzinfo is None:
        password_changed_at = password_changed_at.replace(tzinfo=timezone.utc)

    password_age_days = (now - password_changed_at).days
    requires_change = password_age_days >= 30

    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)

    msg = "Wajib ganti kata sandi bulanan Anda!" if requires_change else "Login sukses"

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        requires_password_change=requires_change,
        password_age_days=password_age_days,
        message=msg,
    )


@router.post("/change-password", response_model=UserResponse)
async def change_password(
    req: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(req.old_password, current_user.hashed_password):
        raise BadRequestException(detail="Kata sandi lama tidak sesuai")

    if len(req.new_password) < 6:
        raise BadRequestException(detail="Kata sandi baru minimal 6 karakter")

    user_repo = UserRepository(db)
    return await user_repo.update_password(current_user, req.new_password)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
