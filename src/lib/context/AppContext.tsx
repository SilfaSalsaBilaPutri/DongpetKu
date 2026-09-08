'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  User,
  Category,
  Transaction,
  Budget,
  BudgetAlert,
  RecurringTransaction,
  MonthlySummary,
} from '@/types/database';
import { calculateBudgetStats, evaluateBudgetAlert } from '@/lib/services/budgetService';
import {
  checkSupabaseConnection,
  ensureUserInDb,
  getCategories,
  getTransactions,
  getBudgets,
  getBudgetAlerts,
  getRecurringTransactions,
  createTransaction,
  updateTransaction as updateTxInDb,
  deleteTransaction as deleteTxFromDb,
  upsertBudget,
  deleteBudget as deleteBudgetFromDb,
  createCategory,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction as deleteRecFromDb,
  createBudgetAlert,
  markAlertRead,
} from '@/lib/services/supabaseService';
import { supabase } from '@/lib/supabase/client';

interface AppContextType {
  user: User | null;
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  budgetAlerts: BudgetAlert[];
  recurringTransactions: RecurringTransaction[];
  selectedMonth: number;
  selectedYear: number;
  isQuickAddOpen: boolean;
  latestAlarmTriggered: BudgetAlert | null;
  summary: MonthlySummary;
  isLoading: boolean;
  isSupabaseConnected: boolean;
  supabaseError: string | null;

  // Actions
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  setIsQuickAddOpen: (isOpen: boolean) => void;
  setLatestAlarmTriggered: (alert: BudgetAlert | null) => void;

  refreshData: () => Promise<void>;
  seedStudentData: () => Promise<void>; // Dibuat wajib (non-optional) agar tidak undefined

  addTransaction: (tx: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<{ success: boolean; alert?: BudgetAlert | null }>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;

  saveBudget: (categoryId: string, amount: number, month?: number, year?: number) => Promise<boolean>;
  deleteBudget: (budgetId: string) => Promise<boolean>;

  addCategory: (category: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'is_preset'>) => Promise<Category | null>;

  addRecurringTransaction: (recurring: Omit<RecurringTransaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<boolean>;
  toggleRecurringTransaction: (id: string) => Promise<boolean>;
  deleteRecurringTransaction: (id: string) => Promise<boolean>;
  processRecurringTransactions: () => Promise<number>;

  markAlertAsRead: (alertId: string) => void;
  markAllAlertsAsRead: () => void;

  setUserProfile: (user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'dompetku_active_user_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  // Set default state awal user ke null
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rawBudgets, setRawBudgets] = useState<Budget[]>([]);
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [latestAlarmTriggered, setLatestAlarmTriggered] = useState<BudgetAlert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(true);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  // Inisialisasi Auth & Sesi Pengguna
  useEffect(() => {
    const initSession = async () => {
      try {
        setIsLoading(true);

        // 1. Cek Sesi Auth Supabase Utama
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const authUser: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Mahasiswa',
            email: session.user.email || '',
            image_url: session.user.user_metadata?.image_url || null,
          };
          const savedUser = await ensureUserInDb(authUser);
          const activeUser = savedUser || authUser;
          setUser(activeUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(activeUser));
          return;
        }

        // 2. Cek user yang tersimpan di localStorage
        const savedJson = localStorage.getItem(USER_STORAGE_KEY);
        if (savedJson) {
          const parsed = JSON.parse(savedJson) as User;
          const verified = await ensureUserInDb(parsed);
          setUser(verified || parsed);
          return;
        }

        setUser(null);
      } catch (err) {
        console.warn('Session init error:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    // Supabase auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const authUser: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Mahasiswa',
          email: session.user.email || '',
          image_url: session.user.user_metadata?.image_url || null,
        };
        const savedUser = await ensureUserInDb(authUser);
        const activeUser = savedUser || authUser;
        setUser(activeUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(activeUser));
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setTransactions([]);
        setRawBudgets([]);
        setBudgetAlerts([]);
        setRecurringTransactions([]);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Ambil Data Riil dari Supabase berdasarkan user ID
  const refreshData = useCallback(async () => {
    if (!user || !user.id) {
      setTransactions([]);
      setRawBudgets([]);
      setBudgetAlerts([]);
      setRecurringTransactions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      await ensureUserInDb(user);

      const conn = await checkSupabaseConnection();
      setIsSupabaseConnected(conn.connected);
      if (!conn.connected) {
        setSupabaseError(conn.error || 'Tidak dapat terhubung ke tabel Supabase.');
      } else {
        setSupabaseError(null);
      }

      const [cats, txs, bdgs, alerts, recs] = await Promise.all([
        getCategories(user.id),
        getTransactions(user.id),
        getBudgets(user.id, selectedMonth, selectedYear),
        getBudgetAlerts(user.id),
        getRecurringTransactions(user.id),
      ]);

      setCategories(cats);
      setTransactions(txs);
      setRawBudgets(bdgs);
      setBudgetAlerts(alerts);
      setRecurringTransactions(recs);
    } catch (err: any) {
      console.error('Error fetching data from Supabase:', err);
      setSupabaseError(err.message || 'Gagal memuat data dari database');
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedMonth, selectedYear]);

  // Fungsi seeding / data awal
  const seedStudentData = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Shortcut Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setIsQuickAddOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Relasi Kategori dengan Transaksi
  const enrichedTransactions = useMemo(() => {
    return transactions.map(tx => {
      const cat = tx.category || categories.find(c => c.id === tx.category_id);
      return { ...tx, category: cat };
    }).sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
  }, [transactions, categories]);

  // Hitung status budget
  const budgets = useMemo(() => {
    return rawBudgets.map(b => {
      const cat = b.category || categories.find(c => c.id === b.category_id);
      const stats = calculateBudgetStats(b, enrichedTransactions);
      return { ...stats, category: cat };
    });
  }, [rawBudgets, categories, enrichedTransactions]);

  // Ringkasan Keuangan Bulanan
  const summary: MonthlySummary = useMemo(() => {
    const monthTransactions = enrichedTransactions.filter(tx => {
      const d = new Date(tx.transaction_date);
      return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
    });

    const total_income = monthTransactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const total_expense = monthTransactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const total_budget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const budget_used_percentage = total_budget > 0 ? (total_expense / total_budget) * 100 : 0;
    const net_balance = total_income - total_expense;

    const unreadAlerts = budgetAlerts.filter(a => !a.is_read).length;

    return {
      month: selectedMonth,
      year: selectedYear,
      total_income,
      total_expense,
      net_balance,
      total_budget,
      budget_used_percentage: Math.round(budget_used_percentage * 10) / 10,
      alerts_count: unreadAlerts,
    };
  }, [enrichedTransactions, budgets, budgetAlerts, selectedMonth, selectedYear]);

  // Tambah Transaksi
  const addTransaction = useCallback(
    async (txData: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      if (!user) throw new Error('User tidak ditemukan / belum terautentikasi');
      await ensureUserInDb(user);

      let triggeredAlert: BudgetAlert | null = null;

      try {
        const created = await createTransaction({
          user_id: user.id,
          category_id: txData.category_id,
          transaction_type: txData.transaction_type,
          amount: txData.amount,
          description: txData.description,
          transaction_date: txData.transaction_date,
          recurring_transaction_id: txData.recurring_transaction_id || null,
        });

        if (created) {
          setTransactions(prev => [created, ...prev]);
        } else {
          await refreshData();
        }

        if (txData.transaction_type === 'expense') {
          const txDate = new Date(txData.transaction_date);
          const txMonth = txDate.getMonth() + 1;
          const txYear = txDate.getFullYear();

          const activeBudget = rawBudgets.find(
            b => b.category_id === txData.category_id && b.month === txMonth && b.year === txYear
          );

          if (activeBudget && activeBudget.amount > 0) {
            const allCategoryExpenses = transactions
              .filter(
                t =>
                  t.transaction_type === 'expense' &&
                  t.category_id === txData.category_id &&
                  new Date(t.transaction_date).getMonth() + 1 === txMonth &&
                  new Date(t.transaction_date).getFullYear() === txYear
              )
              .reduce((sum, t) => sum + Number(t.amount), 0) + Number(txData.amount);

            const alertObj = evaluateBudgetAlert(activeBudget, allCategoryExpenses, user.id);
            if (alertObj) {
              const cat = categories.find(c => c.id === txData.category_id);
              triggeredAlert = { ...alertObj, category: cat };
              setBudgetAlerts(prev => [triggeredAlert!, ...prev]);
              setLatestAlarmTriggered(triggeredAlert);

              await createBudgetAlert({
                budget_id: activeBudget.id,
                user_id: user.id,
                alert_type: alertObj.alert_type,
                threshold_percentage: alertObj.threshold_percentage,
                is_read: false,
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to create transaction in Supabase:', err);
        throw err;
      }

      return { success: true, alert: triggeredAlert };
    },
    [user, rawBudgets, transactions, categories, refreshData]
  );

  const updateTransaction = useCallback(async (id: string, updatedFields: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(tx => (tx.id === id ? { ...tx, ...updatedFields, updated_at: new Date().toISOString() } : tx))
    );
    await updateTxInDb(id, updatedFields);
    return true;
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    await deleteTxFromDb(id);
    return true;
  }, []);

  const saveBudget = useCallback(
    async (categoryId: string, amount: number, month?: number, year?: number) => {
      if (!user) return false;
      await ensureUserInDb(user);
      const targetMonth = month || selectedMonth;
      const targetYear = year || selectedYear;

      const saved = await upsertBudget({
        user_id: user.id,
        category_id: categoryId,
        amount,
        month: targetMonth,
        year: targetYear,
      });

      if (saved) {
        setRawBudgets(prev => {
          const idx = prev.findIndex(
            b => b.category_id === categoryId && b.month === targetMonth && b.year === targetYear
          );
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = saved;
            return updated;
          }
          return [...prev, saved];
        });
      }

      return true;
    },
    [user, selectedMonth, selectedYear]
  );

  const deleteBudget = useCallback(async (budgetId: string) => {
    setRawBudgets(prev => prev.filter(b => b.id !== budgetId));
    await deleteBudgetFromDb(budgetId);
    return true;
  }, []);

  const addCategory = useCallback(
    async (catData: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'is_preset'>) => {
      if (!user) return null;
      await ensureUserInDb(user);
      const saved = await createCategory({
        ...catData,
        user_id: user.id,
        is_preset: false,
      });

      if (saved) {
        setCategories(prev => [...prev, saved]);
        return saved;
      }
      return null;
    },
    [user]
  );

  const addRecurringTransaction = useCallback(
    async (recData: Omit<RecurringTransaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      if (!user) return false;
      await ensureUserInDb(user);
      const saved = await createRecurringTransaction({
        ...recData,
        user_id: user.id,
      });

      if (saved) {
        setRecurringTransactions(prev => [...prev, saved]);
      }
      return true;
    },
    [user]
  );

  const toggleRecurringTransaction = useCallback(async (id: string) => {
    const item = recurringTransactions.find(r => r.id === id);
    if (!item) return false;
    const nextState = !item.is_active;

    setRecurringTransactions(prev =>
      prev.map(r => (r.id === id ? { ...r, is_active: nextState } : r))
    );

    await updateRecurringTransaction(id, { is_active: nextState });
    return true;
  }, [recurringTransactions]);

  const deleteRecurringTransaction = useCallback(async (id: string) => {
    setRecurringTransactions(prev => prev.filter(r => r.id !== id));
    await deleteRecFromDb(id);
    return true;
  }, []);

  const processRecurringTransactions = useCallback(async () => {
    const activeRecurring = recurringTransactions.filter(r => r.is_active);
    let count = 0;
    const today = new Date().toISOString().split('T')[0];

    for (const rec of activeRecurring) {
      await addTransaction({
        category_id: rec.category_id,
        transaction_type: rec.transaction_type,
        amount: rec.amount,
        description: `[Otomatis] ${rec.description}`,
        transaction_date: today,
        recurring_transaction_id: rec.id,
      });
      count++;
    }

    return count;
  }, [recurringTransactions, addTransaction]);

  const markAlertAsRead = useCallback(async (alertId: string) => {
    setBudgetAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, is_read: true } : a))
    );
    await markAlertRead(alertId);
  }, []);

  const markAllAlertsAsRead = useCallback(async () => {
    setBudgetAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
    for (const a of budgetAlerts) {
      await markAlertRead(a.id);
    }
  }, [budgetAlerts]);

  const setUserProfile = useCallback(async (profile: User) => {
    const saved = await ensureUserInDb(profile);
    const finalUser = saved || profile;
    setUser(finalUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(finalUser));
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    setTransactions([]);
    setRawBudgets([]);
    setBudgetAlerts([]);
    setRecurringTransactions([]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        categories,
        transactions: enrichedTransactions,
        budgets,
        budgetAlerts,
        recurringTransactions,
        selectedMonth,
        selectedYear,
        isQuickAddOpen,
        latestAlarmTriggered,
        summary,
        isLoading,
        isSupabaseConnected,
        supabaseError,
        setSelectedMonth,
        setSelectedYear,
        setIsQuickAddOpen,
        setLatestAlarmTriggered,
        refreshData,
        seedStudentData,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        saveBudget,
        deleteBudget,
        addCategory,
        addRecurringTransaction,
        toggleRecurringTransaction,
        deleteRecurringTransaction,
        processRecurringTransactions,
        markAlertAsRead,
        markAllAlertsAsRead,
        setUserProfile,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};