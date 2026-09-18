from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, delete

from app.models.finance import Transaction, Budget, SavingsGoal
from app.schemas.finance import (
    TransactionCreate, BudgetCreate, SavingsGoalCreate,
    FinanceSummaryResponse, CategoryBreakdownItem
)


class FinanceRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_transaction(self, workspace_id: str, owner_id: str, data: TransactionCreate) -> Transaction:
        tx = Transaction(
            workspace_id=workspace_id,
            owner_id=owner_id,
            type=data.type,
            amount=data.amount,
            category=data.category,
            description=data.description,
            account=data.account,
            date=data.date or datetime.utcnow(),
        )
        self.db.add(tx)
        await self.db.commit()
        await self.db.refresh(tx)
        return tx

    async def list_transactions(self, workspace_id: str, type_filter: Optional[str] = None) -> List[Transaction]:
        query = select(Transaction).where(Transaction.workspace_id == workspace_id)
        if type_filter and type_filter in ("income", "expense"):
            query = query.where(Transaction.type == type_filter)
        query = query.order_by(Transaction.date.desc())
        res = await self.db.execute(query)
        return list(res.scalars().all())

    async def delete_transaction(self, workspace_id: str, transaction_id: str) -> bool:
        res = await self.db.execute(
            select(Transaction).where(Transaction.workspace_id == workspace_id, Transaction.id == transaction_id)
        )
        tx = res.scalars().first()
        if not tx:
            return False
        await self.db.delete(tx)
        await self.db.commit()
        return True

    async def get_summary(self, workspace_id: str) -> FinanceSummaryResponse:
        transactions = await self.list_transactions(workspace_id=workspace_id)
        total_income = sum(t.amount for t in transactions if t.type == "income")
        total_expense = sum(t.amount for t in transactions if t.type == "expense")
        total_balance = total_income - total_expense
        savings_rate = ((total_income - total_expense) / total_income * 100) if total_income > 0 else 0.0

        # Group expenses by category
        category_totals = {}
        category_counts = {}
        for t in transactions:
            if t.type == "expense":
                category_totals[t.category] = category_totals.get(t.category, 0.0) + t.amount
                category_counts[t.category] = category_counts.get(t.category, 0) + 1

        breakdown_items = []
        for cat, amt in category_totals.items():
            pct = (amt / total_expense * 100) if total_expense > 0 else 0.0
            breakdown_items.append(CategoryBreakdownItem(
                category=cat,
                total_amount=round(amt, 2),
                percentage=round(pct, 1),
                count=category_counts.get(cat, 1)
            ))

        breakdown_items.sort(key=lambda x: x.total_amount, reverse=True)

        return FinanceSummaryResponse(
            total_balance=round(total_balance, 2),
            total_income=round(total_income, 2),
            total_expense=round(total_expense, 2),
            net_savings_rate=round(savings_rate, 1),
            category_breakdown=breakdown_items,
            transaction_count=len(transactions)
        )

    async def create_budget(self, workspace_id: str, data: BudgetCreate) -> Budget:
        budget = Budget(
            workspace_id=workspace_id,
            category=data.category,
            monthly_limit=data.monthly_limit
        )
        self.db.add(budget)
        await self.db.commit()
        await self.db.refresh(budget)
        return budget

    async def list_budgets(self, workspace_id: str) -> List[Budget]:
        res = await self.db.execute(select(Budget).where(Budget.workspace_id == workspace_id))
        return list(res.scalars().all())

    async def create_savings_goal(self, workspace_id: str, data: SavingsGoalCreate) -> SavingsGoal:
        goal = SavingsGoal(
            workspace_id=workspace_id,
            target_name=data.target_name,
            target_amount=data.target_amount,
            current_amount=data.current_amount,
            target_date=data.target_date
        )
        self.db.add(goal)
        await self.db.commit()
        await self.db.refresh(goal)
        return goal

    async def list_savings_goals(self, workspace_id: str) -> List[SavingsGoal]:
        res = await self.db.execute(select(SavingsGoal).where(SavingsGoal.workspace_id == workspace_id))
        return list(res.scalars().all())
