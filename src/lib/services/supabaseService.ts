import { supabase } from '@/lib/supabase/client';
import {
  Category,
  Transaction,
  Budget,
  BudgetAlert,
  RecurringTransaction,
  User,
} from '@/types/database';

export const DEMO_STUDENT_USER: User = {
  id: 'a0000000-0000-0000-0000-000000000001',
  name: 'Aulia Rahma',
  email: 'aulia.rahma@mahasiswa.id',
  image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
};

/**
 * Check if Supabase connection and tables are accessible
 */
export async function checkSupabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.from('categories').select('id').limit(1);
    if (error) {
      return { connected: false, error: error.message };
    }
    return { connected: true };
  } catch (err: any) {
    return { connected: false, error: err.message || 'Connection failed' };
  }
}

/**
 * USER & AUTH CRUD
 * Guarantees a record exists in public.users to satisfy Foreign Key constraints
 */
export async function ensureUserInDb(user: User): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          image_url: user.image_url || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      console.warn('Upsert user by id failed, attempting select:', error);
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      if (existingUser) return existingUser as User;
    }

    return (data as User) || user;
  } catch (err) {
    console.error('Error ensuring user in Supabase:', err);
    return user;
  }
}

export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data as User;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

/**
 * CATEGORIES CRUD
 */
export async function getCategories(userId?: string | null): Promise<Category[]> {
  try {
    let query = supabase.from('categories').select('*');

    // Perbaikan kondisi OR agar dipastikan membaca kategori preset (is_preset = true)
    if (userId) {
      query = query.or(`is_preset.eq.true,user_id.eq.${userId}`);
    } else {
      query = query.eq('is_preset', true);
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) throw error;

    // Fallback: Jika pengguna/penguji tidak memiliki custom category, ambil preset bawaan
    if ((!data || data.length === 0) && userId) {
      const { data: presetData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_preset', true)
        .order('created_at', { ascending: true });

      return (presetData as Category[]) || [];
    }

    return (data as Category[]) || [];
  } catch (err) {
    console.error('Error fetching categories from Supabase:', err);
    return [];
  }
}

export async function createCategory(
  category: Omit<Category, 'id' | 'created_at' | 'updated_at'>
): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  } catch (err) {
    console.error('Error creating category in Supabase:', err);
    return null;
  }
}

/**
 * TRANSACTIONS CRUD
 */
export async function getTransactions(userId: string): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Transaction[]) || [];
  } catch (err) {
    console.error('Error fetching transactions from Supabase:', err);
    return [];
  }
}

export async function createTransaction(
  transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
): Promise<Transaction | null> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: transaction.user_id,
          category_id: transaction.category_id,
          transaction_type: transaction.transaction_type,
          amount: Number(transaction.amount),
          description: transaction.description,
          transaction_date: transaction.transaction_date,
          recurring_transaction_id: transaction.recurring_transaction_id || null,
        }
      ])
      .select('*, category:categories(*)')
      .single();

    if (error) throw error;
    return data as Transaction;
  } catch (err) {
    console.error('Error creating transaction in Supabase:', err);
    throw err;
  }
}

export async function updateTransaction(
  id: string,
  updates: Partial<Transaction>
): Promise<Transaction | null> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();

    if (error) throw error;
    return data as Transaction;
  } catch (err) {
    console.error('Error updating transaction in Supabase:', err);
    return null;
  }
}

export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting transaction in Supabase:', err);
    return false;
  }
}

/**
 * BUDGETS CRUD
 */
export async function getBudgets(userId: string, month: number, year: number): Promise<Budget[]> {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .eq('month', month)
      .eq('year', year);

    if (error) throw error;
    return (data as Budget[]) || [];
  } catch (err) {
    console.error('Error fetching budgets from Supabase:', err);
    return [];
  }
}

export async function upsertBudget(
  budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>
): Promise<Budget | null> {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .upsert(
        [
          {
            user_id: budget.user_id,
            category_id: budget.category_id,
            amount: Number(budget.amount),
            month: budget.month,
            year: budget.year,
            updated_at: new Date().toISOString(),
          }
        ],
        { onConflict: 'user_id,category_id,month,year' }
      )
      .select('*, category:categories(*)')
      .single();

    if (error) throw error;
    return data as Budget;
  } catch (err) {
    console.error('Error upserting budget in Supabase:', err);
    return null;
  }
}

export async function deleteBudget(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting budget in Supabase:', err);
    return false;
  }
}

/**
 * BUDGET ALERTS
 */
export async function getBudgetAlerts(userId: string): Promise<BudgetAlert[]> {
  try {
    const { data, error } = await supabase
      .from('budget_alerts')
      .select('*, budget:budgets(*)')
      .eq('user_id', userId)
      .order('triggered_at', { ascending: false });

    if (error) throw error;
    return (data as BudgetAlert[]) || [];
  } catch (err) {
    console.error('Error fetching budget alerts from Supabase:', err);
    return [];
  }
}

export async function createBudgetAlert(
  alert: Omit<BudgetAlert, 'id' | 'triggered_at'>
): Promise<BudgetAlert | null> {
  try {
    const { data, error } = await supabase
      .from('budget_alerts')
      .insert([
        {
          budget_id: alert.budget_id,
          user_id: alert.user_id,
          alert_type: alert.alert_type,
          threshold_percentage: alert.threshold_percentage,
          is_read: alert.is_read || false,
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data as BudgetAlert;
  } catch (err) {
    console.error('Error creating budget alert in Supabase:', err);
    return null;
  }
}

export async function markAlertRead(alertId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('budget_alerts')
      .update({ is_read: true })
      .eq('id', alertId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error marking alert as read in Supabase:', err);
    return false;
  }
}

/**
 * RECURRING TRANSACTIONS CRUD
 */
export async function getRecurringTransactions(userId: string): Promise<RecurringTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as RecurringTransaction[]) || [];
  } catch (err) {
    console.error('Error fetching recurring transactions from Supabase:', err);
    return [];
  }
}

export async function createRecurringTransaction(
  recurring: Omit<RecurringTransaction, 'id' | 'created_at' | 'updated_at'>
): Promise<RecurringTransaction | null> {
  try {
    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert([
        {
          user_id: recurring.user_id,
          category_id: recurring.category_id,
          transaction_type: recurring.transaction_type,
          amount: Number(recurring.amount),
          description: recurring.description,
          frequency: recurring.frequency || 'monthly',
          start_date: recurring.start_date,
          next_transaction_date: recurring.next_transaction_date,
          is_active: recurring.is_active ?? true,
        }
      ])
      .select('*, category:categories(*)')
      .single();

    if (error) throw error;
    return data as RecurringTransaction;
  } catch (err) {
    console.error('Error creating recurring transaction in Supabase:', err);
    return null;
  }
}

export async function updateRecurringTransaction(
  id: string,
  updates: Partial<RecurringTransaction>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('recurring_transactions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error updating recurring transaction in Supabase:', err);
    return false;
  }
}

export async function deleteRecurringTransaction(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('recurring_transactions').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting recurring transaction in Supabase:', err);
    return false;
  }
}