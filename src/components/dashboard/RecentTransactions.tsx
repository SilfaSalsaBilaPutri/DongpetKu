'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context/AppContext';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { formatRupiah } from '@/lib/utils/currency';
import { formatDateIndo, formatRelativeDate } from '@/lib/utils/date';
import { Receipt, ArrowRight, Trash2, Plus } from 'lucide-react';

export const RecentTransactions: React.FC = () => {
  const { transactions, deleteTransaction, setIsQuickAddOpen } = useApp();
  const recent = transactions.slice(0, 6);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-surface-border shadow-lg flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-3 border-b border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary-light flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">Transaksi Terkini</h3>
            <p className="text-xs text-gray-400">Catatan pengeluaran & pemasukan terbaru</p>
          </div>
        </div>

        <Link
          href="/transactions"
          className="text-xs font-semibold text-primary-light hover:text-white flex items-center gap-1 transition"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Transaction List */}
      <div className="space-y-2 flex-1">
        {recent.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Belum ada transaksi yang dicatat.</p>
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-primary/20 text-primary-light border border-primary/30 text-xs font-semibold hover:bg-primary/30 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Catat Sekarang (≤5s)
            </button>
          </div>
        ) : (
          recent.map((tx) => {
            const isIncome = tx.transaction_type === 'income';

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl bg-surface/50 hover:bg-surface-hover border border-surface-border transition group"
              >
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
                    <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-primary-light transition line-clamp-1">
                      {tx.description}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                      <span>{tx.category?.name || 'Kategori'}</span>
                      <span>•</span>
                      <span>{formatRelativeDate(tx.transaction_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs sm:text-sm font-bold font-mono ${
                      isIncome ? 'text-accent' : 'text-white'
                    }`}
                  >
                    {isIncome ? '+ ' : '- '}
                    {formatRupiah(tx.amount)}
                  </span>

                  <button
                    onClick={() => {
                      if (confirm('Hapus transaksi ini?')) {
                        deleteTransaction(tx.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-gray-400 hover:text-red-400 transition"
                    title="Hapus Transaksi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
