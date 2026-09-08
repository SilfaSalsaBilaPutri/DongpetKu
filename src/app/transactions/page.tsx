'use client';

import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useApp } from '@/lib/context/AppContext';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { formatRupiah } from '@/lib/utils/currency';
import { formatDateIndo } from '@/lib/utils/date';
import { exportTransactionsToCSV } from '@/lib/services/exportService';
import {
  Receipt,
  Search,
  Download,
  Plus,
  Trash2,
  Filter,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  Layers,
} from 'lucide-react';

export default function TransactionsPage() {
  const { transactions, categories, deleteTransaction, setIsQuickAddOpen, selectedMonth, selectedYear } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<'current_month' | 'all_time'>('current_month');

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Period filter
      if (filterPeriod === 'current_month') {
        const d = new Date(tx.transaction_date);
        if (d.getMonth() + 1 !== selectedMonth || d.getFullYear() !== selectedYear) {
          return false;
        }
      }

      // Type filter
      if (filterType !== 'all' && tx.transaction_type !== filterType) {
        return false;
      }

      // Category filter
      if (selectedCatId !== 'all' && tx.category_id !== selectedCatId) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const descMatch = (tx.description || '').toLowerCase().includes(q);
        const catMatch = (tx.category?.name || '').toLowerCase().includes(q);
        if (!descMatch && !catMatch) return false;
      }

      return true;
    });
  }, [transactions, filterPeriod, selectedMonth, selectedYear, filterType, selectedCatId, searchQuery]);

  const totalIncome = filteredTransactions
    .filter((t) => t.transaction_type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const handleExport = () => {
    exportTransactionsToCSV(filteredTransactions, `DompetKu_Transaksi_${selectedMonth}_${selectedYear}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Riwayat Transaksi
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Total {filteredTransactions.length} transaksi tercatat
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-surface-card hover:bg-surface-hover border border-surface-border text-xs sm:text-sm font-semibold text-gray-200 transition"
              title="Download format CSV untuk Excel"
            >
              <Download className="w-4 h-4 text-accent" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-neon-blue transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Transaksi Baru</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border shadow-md space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-4 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari transaksi atau catatan..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Type Filter */}
            <div className="sm:col-span-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full py-2 px-3 rounded-xl bg-surface border border-surface-border text-xs text-gray-200 focus:outline-none focus:border-primary"
              >
                <option value="all">Semua Jenis (Pemasukan & Pengeluaran)</option>
                <option value="expense">Hanya Pengeluaran (-)</option>
                <option value="income">Hanya Pemasukan (+)</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-surface border border-surface-border text-xs text-gray-200 focus:outline-none focus:border-primary"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.type === 'expense' ? '🔴' : '🟢'} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Period Filter */}
            <div className="sm:col-span-2">
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value as any)}
                className="w-full py-2 px-3 rounded-xl bg-surface border border-surface-border text-xs text-gray-200 focus:outline-none focus:border-primary"
              >
                <option value="current_month">Bulan Ini</option>
                <option value="all_time">Semua Waktu</option>
              </select>
            </div>
          </div>

          {/* Quick Stats of Filtered List */}
          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-surface-border/50 text-xs text-gray-400">
            <span>
              Menampilkan <strong className="text-white">{filteredTransactions.length}</strong> transaksi
            </span>
            <div className="flex items-center gap-4">
              <span>
                Pemasukan: <strong className="text-accent">{formatRupiah(totalIncome)}</strong>
              </span>
              <span>
                Pengeluaran: <strong className="text-white">{formatRupiah(totalExpense)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Transactions Table / List */}
        <div className="rounded-2xl bg-surface-card border border-surface-border shadow-lg overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-40 text-primary-light" />
              <h3 className="text-sm font-bold text-white mb-1">Tidak Ada Transaksi</h3>
              <p className="text-xs max-w-sm mx-auto">
                Tidak ditemukan transaksi yang cocok dengan filter atau pencarian saat ini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-border bg-surface/60 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Kategori & Deskripsi</th>
                    <th className="py-3 px-4">Tanggal (DD/MM/YYYY)</th>
                    <th className="py-3 px-4">Jenis</th>
                    <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border text-xs">
                  {filteredTransactions.map((tx) => {
                    const isIncome = tx.transaction_type === 'income';

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-surface-hover/60 transition group"
                      >
                        {/* Category & Description */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                isIncome
                                  ? 'bg-accent/20 text-accent border border-accent/30'
                                  : 'bg-primary/20 text-primary-light border border-primary/30'
                              }`}
                            >
                              <CategoryIcon
                                iconName={tx.category?.icon}
                                type={tx.transaction_type}
                                className="w-4 h-4"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-white group-hover:text-primary-light transition">
                                {tx.description}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                {tx.category?.name || 'Kategori'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Date DD/MM/YYYY */}
                        <td className="py-3.5 px-4 text-gray-300 font-mono">
                          {formatDateIndo(tx.transaction_date)}
                        </td>

                        {/* Type badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isIncome
                                ? 'bg-accent/15 text-accent border-accent/30'
                                : 'bg-red-500/15 text-red-400 border-red-500/30'
                            }`}
                          >
                            {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                          </span>
                        </td>

                        {/* Amount in Rupiah */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-sm">
                          <span className={isIncome ? 'text-accent' : 'text-white'}>
                            {isIncome ? '+ ' : '- '}
                            {formatRupiah(tx.amount)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => {
                              if (confirm('Hapus catatan transaksi ini?')) {
                                deleteTransaction(tx.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
