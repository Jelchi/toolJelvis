from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class TransactionBase(BaseModel):
    type: str = "expense"  # 'income' or 'expense'
    amount: float
    category: str = "Lainnya"
    description: Optional[str] = None
    account: str = "BCA"  # BCA, Mandiri, Cash, E-Wallet, Kartu Kredit
    date: Optional[datetime] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: str
    workspace_id: str
    owner_id: str
    date: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BudgetBase(BaseModel):
    category: str
    monthly_limit: float


class BudgetCreate(BudgetBase):
    pass


class BudgetResponse(BudgetBase):
    id: str
    workspace_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SavingsGoalBase(BaseModel):
    target_name: str
    target_amount: float
    current_amount: float = 0.0
    target_date: Optional[str] = None


class SavingsGoalCreate(SavingsGoalBase):
    pass


class SavingsGoalResponse(SavingsGoalBase):
    id: str
    workspace_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CategoryBreakdownItem(BaseModel):
    category: str
    total_amount: float
    percentage: float
    count: int


class FinanceSummaryResponse(BaseModel):
    total_balance: float
    total_income: float
    total_expense: float
    net_savings_rate: float
    category_breakdown: List[CategoryBreakdownItem] = []
    transaction_count: int
