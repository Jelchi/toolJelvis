from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.finance import (
    TransactionCreate, TransactionResponse,
    BudgetCreate, BudgetResponse,
    SavingsGoalCreate, SavingsGoalResponse,
    FinanceSummaryResponse
)
from app.repositories.finance_repo import FinanceRepository
from app.api.deps import get_current_user, get_active_workspace_id
from app.models.user import User

router = APIRouter()


@router.get("/summary", response_model=FinanceSummaryResponse)
async def get_finance_summary(
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = FinanceRepository(db)
    return await repo.get_summary(workspace_id=workspace_id)


@router.get("/transactions", response_model=List[TransactionResponse])
async def list_transactions(
    type: Optional[str] = Query(None, description="Filter by type: income or expense"),
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = FinanceRepository(db)
    return await repo.list_transactions(workspace_id=workspace_id, type_filter=type)


@router.post("/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    tx_in: TransactionCreate,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = FinanceRepository(db)
    return await repo.create_transaction(workspace_id=workspace_id, owner_id=current_user.id, data=tx_in)


@router.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: str,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = FinanceRepository(db)
    success = await repo.delete_transaction(workspace_id=workspace_id, transaction_id=transaction_id)
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found")


@router.get("/budgets", response_model=List[BudgetResponse])
async def list_budgets(
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = FinanceRepository(db)
    return await repo.list_budgets(workspace_id=workspace_id)


@router.post("/budgets", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_budget(
    budget_in: BudgetCreate,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = FinanceRepository(db)
    return await repo.create_budget(workspace_id=workspace_id, data=budget_in)


@router.get("/goals", response_model=List[SavingsGoalResponse])
async def list_goals(
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = FinanceRepository(db)
    return await repo.list_savings_goals(workspace_id=workspace_id)


@router.post("/goals", response_model=SavingsGoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal_in: SavingsGoalCreate,
    workspace_id: str = Depends(get_active_workspace_id),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = FinanceRepository(db)
    return await repo.create_savings_goal(workspace_id=workspace_id, data=goal_in)
