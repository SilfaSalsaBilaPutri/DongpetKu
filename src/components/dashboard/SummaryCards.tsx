'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { formatRupiah, formatRupiahCompact } from '@/lib/utils/currency';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';

export const SummaryCards: React.FC = () => {
  const { summary } = useApp();

  const isBudgetWarning = summary.budget_used_percentage >= 80 && summary.budget_used_percentage < 100;
  const isBudgetOver = summary.budget_used_percentage >= 100;
  const sisaBudget = Math.max(0, summary.total_budget - summary.total_expense);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Saldo Bersih */}
      <div className="p-5 rounded-2xl bg-surface-card border border-surface-border hover:border-primary/40 transition shadow-lg relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Sisa Saldo Kas
          </span>
          <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary-light flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-extrabold text-white tracking-tight">
            {formatRupiah(summary.net_balance)}
          </h3>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <span className={summary.net_balance >= 0 ? 'text-accent font-medium' : 'text-red-400 font-medium'}>
              {summary.net_balance >= 0 ? 'Surplus' : 'Defisit'} Bulan Ini
            </span>
          </p>
        </div>
        <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-primary/10 blur-xl pointer-events-none group-hover:bg-primary/20 transition" />
      </div>

      {/* 2. Total Pemasukan */}
      <div className="p-5 rounded-2xl bg-surface-card border border-surface-border hover:border-accent/40 transition shadow-lg relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Total Pemasukan
          </span>
          <div className="w-8 h-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-extrabold text-accent tracking-tight">
            {formatRupiah(summary.total_income)}
          </h3>
          <p className="text-xs text-gray-400">
            Uang bulanan, freelance & beasiswa
          </p>
        </div>
        <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-accent/10 blur-xl pointer-events-none group-hover:bg-accent/20 transition" />
      </div>

      {/* 3. Total Pengeluaran */}
      <div className="p-5 rounded-2xl bg-surface-card border border-surface-border hover:border-red-500/40 transition shadow-lg relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Total Pengeluaran
          </span>
          <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-extrabold text-white tracking-tight">
            {formatRupiah(summary.total_expense)}
          </h3>
          <p className="text-xs text-gray-400">
            Terpakai dari kas bulan ini
          </p>
        </div>
        <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-red-500/10 blur-xl pointer-events-none group-hover:bg-red-500/20 transition" />
      </div>

      {/* 4. Sisa & Status Budget Alarm */}
      <div 
        className={`p-5 rounded-2xl border transition shadow-lg relative overflow-hidden group ${
          isBudgetOver
            ? 'bg-gradient-to-b from-[#1C121E] to-surface-card border-red-500/40 shadow-neon-red'
            : isBudgetWarning
            ? 'bg-gradient-to-b from-[#1E1912] to-surface-card border-amber-500/40 shadow-neon-amber'
            : 'bg-surface-card border-surface-border hover:border-emerald-500/40'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Budget Bulanan
          </span>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isBudgetOver
                ? 'bg-red-500/20 text-red-400'
                : isBudgetWarning
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {isBudgetOver ? (
              <ShieldAlert className="w-4 h-4 animate-pulse" />
            ) : isBudgetWarning ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <PieChart className="w-4 h-4" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-extrabold text-white">
              {summary.budget_used_percentage}%
            </h3>
            <span className="text-xs text-gray-400 font-medium">
              Sisa: {formatRupiah(sisaBudget)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-surface-border overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isBudgetOver
                  ? 'bg-red-500 shadow-neon-red'
                  : isBudgetWarning
                  ? 'bg-amber-500 shadow-neon-amber'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, summary.budget_used_percentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Total: {formatRupiahCompact(summary.total_budget)}</span>
            <span
              className={`font-bold ${
                isBudgetOver
                  ? 'text-red-400'
                  : isBudgetWarning
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {isBudgetOver ? 'Over Budget!' : isBudgetWarning ? 'Hampir Habis' : 'Aman'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
