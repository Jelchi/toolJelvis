from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import NotFoundException
from app.schemas.problem import ProblemCreate, ProblemUpdate, ProblemResponse
from app.repositories.problem_repo import ProblemRepository
from app.api.deps import get_current_user, get_active_workspace_id
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[ProblemResponse])
async def list_problems(
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = ProblemRepository(db)
    return await repo.list_problems(workspace_id=workspace_id)


@router.post("/", response_model=ProblemResponse, status_code=status.HTTP_201_CREATED)
async def create_problem(
    problem_in: ProblemCreate,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = ProblemRepository(db)
    return await repo.create(workspace_id=workspace_id, owner_id=current_user.id, data=problem_in)


@router.get("/{problem_id}", response_model=ProblemResponse)
async def get_problem(
    problem_id: str,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = ProblemRepository(db)
    problem = await repo.get_by_id(problem_id=problem_id, workspace_id=workspace_id)
    if not problem:
        raise NotFoundException(detail="Problem ticket not found")
    return problem


@router.put("/{problem_id}", response_model=ProblemResponse)
async def update_problem(
    problem_id: str,
    problem_in: ProblemUpdate,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = ProblemRepository(db)
    problem = await repo.get_by_id(problem_id=problem_id, workspace_id=workspace_id)
    if not problem:
        raise NotFoundException(detail="Problem ticket not found")
    return await repo.update(ticket=problem, data=problem_in)


@router.delete("/{problem_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_problem(
    problem_id: str,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = ProblemRepository(db)
    problem = await repo.get_by_id(problem_id=problem_id, workspace_id=workspace_id)
    if not problem:
        raise NotFoundException(detail="Problem ticket not found")
    await repo.delete(ticket=problem)
