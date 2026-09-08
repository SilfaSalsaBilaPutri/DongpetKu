'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useApp } from '@/lib/context/AppContext';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { formatRupiah, formatRupiahCompact, parseRupiahInput } from '@/lib/utils/currency';
import { formatMonthYear, formatDateTimeWIB } from '@/lib/utils/date';
import {
  PieChart,
  Plus,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Bell,
  Sparkles,
} from 'lucide-react';

export default function BudgetsPage() {
  const {
    budgets,
    categories,
    budgetAlerts,
    selectedMonth,
    selectedYear,
    saveBudget,
    deleteBudget,
    markAlertAsRead,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const totalAllocatedBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpentInBudget = budgets.reduce((sum, b) => sum + (b.total_spent || 0), 0);
  const totalRemainingBudget = Math.max(0, totalAllocatedBudget - totalSpentInBudget);

  const handleOpenAdd = () => {
    setEditingBudgetId(null);
    setSelectedCatId(expenseCategories[0]?.id || '');
    setAmountStr('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (budgetId: string, catId: string, currentAmount: number) => {
    setEditingBudgetId(budgetId);
    setSelectedCatId(catId);
    setAmountStr(new Intl.NumberFormat('id-ID').format(currentAmount));
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseRupiahInput(amountStr);
    if (amountNum <= 0) {
      alert('Masukkan nominal budget yang valid!');
      return;
    }
    if (!selectedCatId) {
      alert('Pilih kategori!');
      return;
    }

    await saveBudget(selectedCatId, amountNum, selectedMonth, selectedYear);
    setIsModalOpen(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Budget & Alarm Batas
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Atur batas pengeluaran per kategori untuk {formatMonthYear(selectedMonth, selectedYear)}
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-neon-blue transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Set Budget Kategori</span>
          </button>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-surface-card border border-surface-border">
            <span className="text-xs text-gray-400">Total Alokasi Budget</span>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">
              {formatRupiah(totalAllocatedBudget)}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">Untuk {budgets.length} kategori</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-card border border-surface-border">
            <span className="text-xs text-gray-400">Total Terpakai</span>
            <p className="text-xl sm:text-2xl font-black text-red-400 mt-1">
              {formatRupiah(totalSpentInBudget)}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              {totalAllocatedBudget > 0
                ? `${Math.round((totalSpentInBudget / totalAllocatedBudget) * 100)}% dari total budget`
                : 'Belum ada data'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-card border border-surface-border">
            <span className="text-xs text-gray-400">Sisa Kuota Budget Aman</span>
            <p className="text-xl sm:text-2xl font-black text-accent mt-1">
              {formatRupiah(totalRemainingBudget)}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">Bisa dipakai sampai akhir bulan</p>
          </div>
        </div>

        {/* Alarm Threshold Legend */}
        <div className="p-4 rounded-2xl bg-surface/50 border border-surface-border flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-gray-300">Level Alarm DompetKu:</span>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>&lt;80% Aman</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>80% - 100% Peringatan (Warning)</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span>&gt;100% Melebihi Batas (Over Budget!)</span>
            </div>
          </div>
        </div>

        {/* Budgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-surface-card border border-surface-border rounded-2xl">
              <PieChart className="w-12 h-12 mx-auto mb-2 opacity-40 text-primary-light" />
              <p className="text-sm font-bold text-white">Belum Ada Budget Ditentukan</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">
                Atur batas budget per kategori agar sistem DompetKu dapat memberi alarm otomatis.
              </p>
              <button
                onClick={handleOpenAdd}
                className="py-2 px-4 rounded-xl bg-primary text-white text-xs font-bold"
              >
                + Tambah Budget Kategori
              </button>
            </div>
          ) : (
            budgets.map((b) => {
              const percentage = b.percentage || 0;
              const isOver = percentage >= 100;
              const isWarning = percentage >= 80 && !isOver;
              const spent = b.total_spent || 0;
              const remaining = b.remaining || 0;

              return (
                <div
                  key={b.id}
                  className={`p-5 rounded-2xl border transition shadow-lg ${
                    isOver
                      ? 'bg-gradient-to-b from-[#1E1218] to-surface-card border-red-500/40 shadow-neon-red'
                      : isWarning
                      ? 'bg-gradient-to-b from-[#1E1912] to-surface-card border-amber-500/40 shadow-neon-amber'
                      : 'bg-surface-card border-surface-border hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isOver
                            ? 'bg-red-500/20 text-red-400'
                            : isWarning
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-primary/20 text-primary-light'
                        }`}
                      >
                        <CategoryIcon
                          iconName={b.category?.icon}
                          type="expense"
                          className="w-5 h-5"
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          {b.category?.name || 'Kategori'}
                        </h3>
                        <p className="text-xs text-gray-400">
                          Batas: {formatRupiah(b.amount)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          isOver
                            ? 'bg-red-500/20 text-red-400 border-red-500/40'
                            : isWarning
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        }`}
                      >
                        {percentage}%
                      </span>

                      <button
                        onClick={() => handleOpenEdit(b.id, b.category_id, b.amount)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
                        title="Ubah Budget"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Hapus budget kategori ini?')) {
                            deleteBudget(b.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Hapus Budget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2 mt-4">
                    <div className="w-full h-2.5 rounded-full bg-surface-border overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver
                            ? 'bg-red-500 shadow-neon-red'
                            : isWarning
                            ? 'bg-amber-500 shadow-neon-amber'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-300">
                      <span>
                        Terpakai: <strong className="text-white">{formatRupiah(spent)}</strong>
                      </span>
                      <span>
                        Sisa:{' '}
                        <strong className={isOver ? 'text-red-400' : 'text-accent'}>
                          {isOver ? 'Habis (0)' : formatRupiah(remaining)}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Budget Alert History Logs */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-surface-border shadow-lg">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Riwayat Log Alarm Budget
              </h3>
            </div>
            <span className="text-xs text-gray-400">Tercatat di tabel budget_alerts</span>
          </div>

          <div className="space-y-2.5">
            {budgetAlerts.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                Belum ada alarm yang terpicu.
              </p>
            ) : (
              budgetAlerts.map((alt) => {
                const isOver = alt.alert_type === 'over_budget';
                return (
                  <div
                    key={alt.id}
                    className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                      isOver
                        ? 'bg-red-500/10 border-red-500/30 text-red-200'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isOver ? (
                        <AlertOctagon className="w-5 h-5 text-red-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                      )}
                      <div>
                        <p className="font-bold text-white">
                          {isOver ? '🚨 Alarm: Budget Terlampaui' : '⚠️ Alarm: Budget Hampir Habis'} (
                          {alt.threshold_percentage}%)
                        </p>
                        <p className="text-gray-300 text-[11px]">
                          Kategori: {alt.category?.name || 'Kategori'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-gray-400">
                      {formatDateTimeWIB(alt.triggered_at)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Set / Edit Budget */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-surface-card border border-surface-border rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
                <h3 className="text-base font-bold text-white">
                  {editingBudgetId ? 'Ubah Budget Kategori' : 'Set Budget Kategori Baru'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBudget} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">
                    Pilih Kategori Pengeluaran
                  </label>
                  <select
                    value={selectedCatId}
                    onChange={(e) => setSelectedCatId(e.target.value)}
                    disabled={!!editingBudgetId}
                    className="w-full py-2.5 px-3 rounded-xl bg-surface border border-surface-border text-xs text-white focus:outline-none focus:border-primary"
                  >
                    {expenseCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">
                    Batas Nominal Budget (Rupiah)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={amountStr}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, '');
                        if (!raw) {
                          setAmountStr('');
                          return;
                        }
                        setAmountStr(new Intl.NumberFormat('id-ID').format(parseInt(raw, 10)));
                      }}
                      placeholder="Contoh: 500.000"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface border border-surface-border text-sm font-bold text-white focus:outline-none focus:border-primary"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-xs font-semibold text-gray-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-neon-blue"
                  >
                    Simpan Budget
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
