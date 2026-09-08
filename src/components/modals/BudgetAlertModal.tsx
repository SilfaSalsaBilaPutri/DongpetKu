'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { formatRupiah } from '@/lib/utils/currency';
import { AlertTriangle, AlertOctagon, CheckCircle2, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const BudgetAlertModal: React.FC = () => {
  const { latestAlarmTriggered, setLatestAlarmTriggered, markAlertAsRead } = useApp();

  if (!latestAlarmTriggered) return null;

  const isOverBudget = latestAlarmTriggered.alert_type === 'over_budget';
  const categoryName = latestAlarmTriggered.category?.name || 'Kategori';
  const threshold = latestAlarmTriggered.threshold_percentage;
  const budgetAmount = latestAlarmTriggered.budget?.amount || 0;

  const handleClose = () => {
    markAlertAsRead(latestAlarmTriggered.id);
    setLatestAlarmTriggered(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl transition-all ${
          isOverBudget
            ? 'bg-gradient-to-b from-[#1C121E] to-[#121626] border-red-500/40 shadow-neon-red'
            : 'bg-gradient-to-b from-[#1E1912] to-[#121626] border-amber-500/40 shadow-neon-amber'
        }`}
      >
        {/* Header Icon */}
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isOverBudget
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {isOverBudget ? (
              <AlertOctagon className="w-7 h-7" />
            ) : (
              <AlertTriangle className="w-7 h-7" />
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title & Badge */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 border">
            {isOverBudget ? (
              <span className="text-red-400 bg-red-500/10 border-red-500/20 px-2 py-0.5 rounded-full">
                🚨 Alarm: Budget Terlampaui ({threshold}%)
              </span>
            ) : (
              <span className="text-amber-400 bg-amber-500/10 border-amber-500/20 px-2 py-0.5 rounded-full">
                ⚠️ Peringatan: Budget Hampir Habis ({threshold}%)
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white">
            {isOverBudget ? 'Batas Pengeluaran Jebol!' : 'Peringatan Budget Kategori'}
          </h3>
          <p className="text-sm text-gray-300 mt-1">
            Pengeluaran pada kategori <span className="font-semibold text-white">"{categoryName}"</span> telah mencapai{' '}
            <span className={isOverBudget ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}>
              {threshold}%
            </span>{' '}
            dari batas {formatRupiah(budgetAmount)}.
          </p>
        </div>

        {/* Action Tips for Students */}
        <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 mb-5 text-xs text-gray-300 space-y-1.5">
          <p className="font-medium text-white flex items-center gap-1.5">
            💡 Tips DompetKu Mahasiswa:
          </p>
          <p>
            {isOverBudget
              ? 'Sebaiknya tunda belanja non-pokok di kategori ini sampai awal bulan berikutnya agar tidak defisit.'
              : 'Sisa kuota budget kategori ini tinggal sedikit. Prioritaskan kebutuhan utama saja.'}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-surface-card hover:bg-surface-hover border border-surface-border text-sm font-medium text-gray-200 transition"
          >
            Mengerti
          </button>
          <Link
            href="/budgets"
            onClick={handleClose}
            className={`flex items-center justify-center gap-2 flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition ${
              isOverBudget
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25'
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25'
            }`}
          >
            Lihat Budget <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
