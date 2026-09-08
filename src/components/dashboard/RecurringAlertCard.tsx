'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context/AppContext';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { formatRupiah } from '@/lib/utils/currency';
import { formatDateIndo } from '@/lib/utils/date';
import { Repeat, Zap, Check, ArrowRight } from 'lucide-react';

export const RecurringAlertCard: React.FC = () => {
  const { recurringTransactions, processRecurringTransactions } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState<number | null>(null);

  const activeRecurring = recurringTransactions.filter(r => r.is_active);

  const handleProcessNow = async () => {
    setIsProcessing(true);
    try {
      const count = await processRecurringTransactions();
      setProcessedCount(count);
      setTimeout(() => setProcessedCount(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#121B38] to-surface-card border border-primary/30 shadow-lg flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary-light flex items-center justify-center">
            <Repeat className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Transaksi Rutin</h4>
            <p className="text-xs text-gray-400">Kos, Spotify, Uang Bulanan</p>
          </div>
        </div>

        <Link
          href="/recurring"
          className="text-xs text-accent hover:text-accent-light font-semibold flex items-center gap-1 transition"
        >
          <span>Kelola</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* List of active recurring */}
      <div className="space-y-2 mb-4">
        {activeRecurring.slice(0, 3).map(rec => (
          <div
            key={rec.id}
            className="flex items-center justify-between p-2.5 rounded-xl bg-surface/60 border border-surface-border text-xs"
          >
            <div className="flex items-center gap-2">
              <CategoryIcon iconName={rec.category?.icon} type={rec.transaction_type} className="w-3.5 h-3.5 text-gray-300" />
              <span className="font-medium text-gray-200 line-clamp-1">{rec.description}</span>
            </div>
            <span className="font-bold text-white font-mono shrink-0">
              {formatRupiah(rec.amount)}
            </span>
          </div>
        ))}
      </div>

      {/* Action button */}
      <button
        onClick={handleProcessNow}
        disabled={isProcessing}
        className="w-full py-2.5 px-3 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary-light text-xs font-bold flex items-center justify-center gap-2 transition"
      >
        {isProcessing ? (
          <span>Memproses Transaksi...</span>
        ) : processedCount !== null ? (
          <span className="text-emerald-400 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> {processedCount} Transaksi Dicatat!
          </span>
        ) : (
          <>
            <Zap className="w-3.5 h-3.5" />
            <span>Proses Transaksi Rutin Sekarang</span>
          </>
        )}
      </button>
    </div>
  );
};
