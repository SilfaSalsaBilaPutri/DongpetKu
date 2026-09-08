'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useApp } from '@/lib/context/AppContext';
import { formatRupiah, formatRupiahCompact } from '@/lib/utils/currency';
import { formatMonthYear } from '@/lib/utils/date';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Award,
  Wallet,
  CheckCircle2,
} from 'lucide-react';

export default function InsightsPage() {
  const { transactions, budgets, summary, selectedMonth, selectedYear } = useApp();

  // Expenses this month
  const monthExpenses = transactions.filter((tx) => {
    if (tx.transaction_type !== 'expense') return false;
    const d = new Date(tx.transaction_date);
    return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
  });

  // Calculate top spending category
  const categoryTotals: Record<string, { name: string; amount: number; icon: string }> = {};
  monthExpenses.forEach((tx) => {
    const catId = tx.category_id;
    const catName = tx.category?.name || 'Lainnya';
    const catIcon = tx.category?.icon || 'Tag';
    if (!categoryTotals[catId]) {
      categoryTotals[catId] = { name: catName, amount: 0, icon: catIcon };
    }
    categoryTotals[catId].amount += Number(tx.amount);
  });

  const sortedCategories = Object.values(categoryTotals).sort((a, b) => b.amount - a.amount);
  const highestExpenseCat = sortedCategories[0] || null;

  // Calculate daily average spending
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const currentDay = Math.min(new Date().getDate(), daysInMonth);
  const dailyAverage = currentDay > 0 ? summary.total_expense / currentDay : 0;
  const projectedMonthlyExpense = dailyAverage * daysInMonth;

  // Savings rate
  const savingsRate =
    summary.total_income > 0
      ? Math.max(0, ((summary.total_income - summary.total_expense) / summary.total_income) * 100)
      : 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Insight & Laporan Finansial <Sparkles className="w-6 h-6 text-accent" />
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Analisis kesehatan keuangan mahasiswa untuk {formatMonthYear(selectedMonth, selectedYear)}
          </p>
        </div>

        {/* 3 Key Health Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Savings Rate Card */}
          <div className="p-5 rounded-2xl bg-surface-card border border-surface-border shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400">Tingkat Tabungan (Savings Rate)</span>
              <Award className="w-4 h-4 text-accent" />
            </div>
            <h3 className="text-2xl font-black text-accent">{Math.round(savingsRate)}%</h3>
            <p className="text-[11px] text-gray-400 mt-1">
              {savingsRate >= 20 ? '🎉 Sangat Bagus! Sesuai standar 20% tabungan.' : '⚠️ Perlu dioptimalkan lagi.'}
            </p>
          </div>

          {/* Daily Burn Rate */}
          <div className="p-5 rounded-2xl bg-surface-card border border-surface-border shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400">Rata-rata Pengeluaran Harian</span>
              <TrendingDown className="w-4 h-4 text-primary-light" />
            </div>
            <h3 className="text-2xl font-black text-white">{formatRupiah(dailyAverage)}</h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Proyeksi akhir bulan: {formatRupiahCompact(projectedMonthlyExpense)}
            </p>
          </div>

          {/* Top Category Spending */}
          <div className="p-5 rounded-2xl bg-surface-card border border-surface-border shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400">Pos Pengeluaran Terbesar</span>
              <Wallet className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-lg font-black text-white line-clamp-1">
              {highestExpenseCat ? highestExpenseCat.name : '-'}
            </h3>
            <p className="text-[11px] text-amber-400 font-bold mt-1">
              {highestExpenseCat ? formatRupiah(highestExpenseCat.amount) : 'Rp 0'}
            </p>
          </div>
        </div>

        {/* Personalized Student Actionable Recommendations */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#121E3E] to-surface-card border border-primary/40 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-primary-light font-bold text-sm">
            <Lightbulb className="w-5 h-5 text-accent" />
            <span>Rekomendasi Cerdas DompetKu untuk Mahasiswa</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-xl bg-surface/60 border border-surface-border text-xs space-y-1">
              <p className="font-bold text-white flex items-center gap-1.5">
                ☕ Atur Batas Ngopi & Nongkrong
              </p>
              <p className="text-gray-300">
                Pengeluaran ngopi seringkali tidak terasa. Gunakan batas mingguan (misal max Rp 75.000/minggu) untuk menjaga saldo tetap aman.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface/60 border border-surface-border text-xs space-y-1">
              <p className="font-bold text-white flex items-center gap-1.5">
                🏠 Amankan Tagihan Pokok di Awal Bulan
              </p>
              <p className="text-gray-300">
                Segera bayar kos dan tagihan di awal bulan begitu uang saku masuk agar tidak terpakai untuk belanja konsumtif.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface/60 border border-surface-border text-xs space-y-1">
              <p className="font-bold text-white flex items-center gap-1.5">
                🛵 Manfaatkan Promo & Langganan Transport
              </p>
              <p className="text-gray-300">
                Gunakan paket voucher transportasi online atau maksimalkan transportasi publik (KRL/TransJakarta) untuk hemat hingga 40%.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface/60 border border-surface-border text-xs space-y-1">
              <p className="font-bold text-white flex items-center gap-1.5">
                💻 Tambah Sumber Pemasukan Freelance
              </p>
              <p className="text-gray-300">
                Proyek freelance atau kerja paruh waktu dapat mendiversifikasi pendapatan selain uang bulanan orang tua.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown of All Categories */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-surface-border shadow-lg">
          <h3 className="text-base font-bold text-white mb-4">
            Rincian Pengeluaran per Kategori
          </h3>

          <div className="space-y-3">
            {sortedCategories.map((cat, idx) => {
              const share = summary.total_expense > 0 ? (cat.amount / summary.total_expense) * 100 : 0;
              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-500 font-bold">#{idx + 1}</span>
                      <CategoryIcon iconName={cat.icon} type="expense" className="w-3.5 h-3.5 text-primary-light" />
                      <span className="font-semibold text-white">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">{formatRupiah(cat.amount)}</span>
                      <span className="text-gray-400 font-mono text-[11px] w-12 text-right">
                        {Math.round(share)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
