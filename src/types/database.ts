export type TransactionType = 'income' | 'expense';

export type AlertType = 'warning' | 'limit_reached' | 'over_budget';

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface User {
  id: string;
  name: string;
  email: string;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  user_id?: string | null;
  name: string;
  type: TransactionType;
  icon: string;
  is_preset: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  transaction_type: TransactionType;
  amount: number;
  description: string;
  transaction_date: string; // YYYY-MM-DD
  recurring_transaction_id?: string | null;
  created_at?: string;
  updated_at?: string;
  // Joined field
  category?: Category;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: number; // 1-12
  year: number;
  created_at?: string;
  updated_at?: string;
  // Joined fields & calculated stats
  category?: Category;
  total_spent?: number;
  remaining?: number;
  percentage?: number;
  status?: 'safe' | 'warning' | 'over_budget';
}

export interface BudgetAlert {
  id: string;
  budget_id: string;
  user_id: string;
  alert_type: AlertType;
  threshold_percentage: number;
  triggered_at: string;
  is_read: boolean;
  budget?: Budget;
  category?: Category;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  category_id: string;
  transaction_type: TransactionType;
  amount: number;
  description: string;
  frequency: RecurringFrequency;
  start_date: string;
  next_transaction_date: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  category?: Category;
}

export interface MonthlySummary {
  month: number;
  year: number;
  total_income: number;
  total_expense: number;
  net_balance: number;
  total_budget: number;
  budget_used_percentage: number;
  alerts_count: number;
}
