import { Budget, Transaction, BudgetAlert, AlertType } from '@/types/database';

export function calculateBudgetStats(
  budget: Budget,
  transactions: Transaction[]
): Budget {
  const currentMonth = budget.month;
  const currentYear = budget.year;

  // Filter expenses matching this category, month, and year
  const categoryExpenses = transactions.filter((tx) => {
    if (tx.transaction_type !== 'expense' || tx.category_id !== budget.category_id) {
      return false;
    }
    const txDate = new Date(tx.transaction_date);
    const txMonth = txDate.getMonth() + 1;
    const txYear = txDate.getFullYear();
    return txMonth === currentMonth && txYear === currentYear;
  });

  const total_spent = categoryExpenses.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const remaining = Math.max(0, budget.amount - total_spent);
  const percentage = budget.amount > 0 ? (total_spent / budget.amount) * 100 : 0;

  let status: 'safe' | 'warning' | 'over_budget' = 'safe';
  if (percentage >= 100) {
    status = 'over_budget';
  } else if (percentage >= 80) {
    status = 'warning';
  }

  return {
    ...budget,
    total_spent,
    remaining,
    percentage: Math.round(percentage * 10) / 10,
    status,
  };
}

export function evaluateBudgetAlert(
  budget: Budget,
  newTotalSpent: number,
  userId: string
): BudgetAlert | null {
  if (budget.amount <= 0) return null;
  const percentage = (newTotalSpent / budget.amount) * 100;

  let alert_type: AlertType | null = null;
  if (percentage >= 100) {
    alert_type = 'over_budget';
  } else if (percentage >= 80) {
    alert_type = 'warning';
  }

  if (!alert_type) return null;

  return {
    id: `alt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    budget_id: budget.id,
    user_id: userId,
    alert_type,
    threshold_percentage: Math.round(percentage * 10) / 10,
    triggered_at: new Date().toISOString(),
    is_read: false,
    budget,
  };
}
