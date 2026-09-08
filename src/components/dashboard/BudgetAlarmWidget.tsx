'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context/AppContext';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { formatRupiah, formatRupiahCompact } from '@/lib/utils/currency';
import {
  PieChart,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  ArrowRight,
  Plus,
} from 'lucide-react';

export const BudgetAlarmWidget: React.FC = () => {
  const { budgets } = useApp();

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-surface-border shadow-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Budget Alarm per Kategori
            </h3>
            <p className="text-xs text-gray-400">Monitoring ambang batas 80% & 100%</p>
          </div>
        </div>

        <Link
          href="/budgets"
          className="text-xs font-semibold text-primary-light hover:text-white flex items-center gap-1 transition"
        >
          <span>Atur Budget</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Budget List */}
      <div className="space-y-4 flex-1">
        {budgets.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <PieChart className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Belum ada budget yang diset untuk bulan ini.</p>
            <Link
              href="/budgets"
              className="mt-3 inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-primary/20 text-primary-light border border-primary/30 text-xs font-semibold hover:bg-primary/30 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Set Budget Pertama
            </Link>
          </div>
        ) : (
          budgets.map((b) => {
            const isOver = (b.percentage || 0) >= 100;
            const isWarning = (b.percentage || 0) >= 80 && !isOver;
            const spent = b.total_spent || 0;
            const percentage = b.percentage || 0;

            return (
              <div
                key={b.id}
                className={`p-3.5 rounded-xl border transition ${
                  isOver
                    ? 'bg-red-500/10 border-red-500/30'
                    : isWarning
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-surface/50 border-surface-border hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
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
                        className="w-3.5 h-3.5"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white">
                        {b.category?.name || 'Kategori'}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isOver
                          ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                          : isWarning
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>
                </div>

                {/* Amount Progress */}
                <div className="space-y-1.5">
                  <div className="w-full h-2 rounded-full bg-surface-border overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? 'bg-red-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>
                      Terpakai: <span className="text-white font-medium">{formatRupiah(spent)}</span>
                    </span>
                    <span>
                      Batas: <span className="text-gray-300">{formatRupiahCompact(b.amount)}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
