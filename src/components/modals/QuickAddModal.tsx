'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { formatRupiah, parseRupiahInput } from '@/lib/utils/currency';
import { getTodayDateString } from '@/lib/utils/date';
import { TransactionType } from '@/types/database';
import { X, Zap, ArrowDownCircle, ArrowUpCircle, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

const QUICK_AMOUNTS = [
  { label: '+10rb', value: 10000 },
  { label: '+20rb', value: 20000 },
  { label: '+50rb', value: 50000 },
  { label: '+100rb', value: 100000 },
  { label: '+500rb', value: 500000 },
  { label: '+1 Jt', value: 1000000 },
];

export const QuickAddModal: React.FC = () => {
  const { isQuickAddOpen, setIsQuickAddOpen, categories, addTransaction } = useApp();

  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>(getTodayDateString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Gunakan useMemo agar referensi array tidak berubah di setiap re-render
  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );

  // 2. Jalankan Auto-focus dan Auto-select HANYA saat modal pertama kali DIBUKA
  useEffect(() => {
    if (isQuickAddOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isQuickAddOpen]);

  // 3. Set default kategori secara terpisah saat type atau ketersediaan kategori berubah
  useEffect(() => {
    if (filteredCategories.length > 0) {
      const isSelectedValid = filteredCategories.some((c) => c.id === selectedCategoryId);
      if (!selectedCategoryId || !isSelectedValid) {
        setSelectedCategoryId(filteredCategories[0].id);
      }
    }
  }, [type, filteredCategories]);

  if (!isQuickAddOpen) return null;

  const currentAmountNum = parseRupiahInput(amountStr);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    if (!rawVal) {
      setAmountStr('');
      return;
    }
    const num = parseInt(rawVal, 10);
    setAmountStr(new Intl.NumberFormat('id-ID').format(num));
  };

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseRupiahInput(amountStr);
    const updated = current + addValue;
    setAmountStr(new Intl.NumberFormat('id-ID').format(updated));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentAmountNum <= 0) {
      alert('Masukkan nominal transaksi!');
      inputRef.current?.focus();
      return;
    }

    if (!selectedCategoryId) {
      alert('Pilih kategori transaksi!');
      return;
    }

    const selectedCat = categories.find((c) => c.id === selectedCategoryId);
    const finalDesc = description.trim() || selectedCat?.name || 'Transaksi';

    setIsSubmitting(true);

    try {
      await addTransaction({
        category_id: selectedCategoryId,
        transaction_type: type,
        amount: currentAmountNum,
        description: finalDesc,
        transaction_date: transactionDate,
      });

      if (type === 'income') {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#2DD4BF', '#3B82F6', '#22C55E'],
          });
        } catch (_) { }
      }

      // Reset Form State
      setAmountStr('');
      setDescription('');
      setIsQuickAddOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-lg bg-[#11182E] border border-surface-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-surface-border flex items-center justify-between bg-surface-card/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary-light">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Quick Add Transaksi
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-md bg-accent/15 text-accent border border-accent/20">
                  ≤5 Detik
                </span>
              </h2>
              <p className="text-xs text-gray-400">Tekan 'N' kapan saja untuk akses cepat</p>
            </div>
          </div>

          <button
            onClick={() => setIsQuickAddOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-surface-card border border-surface-border gap-1">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const firstExp = categories.find((c) => c.type === 'expense');
                if (firstExp) setSelectedCategoryId(firstExp.id);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${type === 'expense'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              Pengeluaran
            </button>

            <button
              type="button"
              onClick={() => {
                setType('income');
                const firstInc = categories.find((c) => c.type === 'income');
                if (firstInc) setSelectedCategoryId(firstInc.id);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${type === 'income'
                  ? 'bg-accent/20 text-accent border border-accent/30 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              Pemasukan
            </button>
          </div>

          {/* Big Amount Input */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              Nominal (Rupiah)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-lg sm:text-2xl font-bold text-gray-400">
                Rp
              </span>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={amountStr}
                onChange={handleAmountChange}
                placeholder="0"
                className={`w-full pl-14 pr-4 py-3.5 sm:py-4 rounded-xl bg-surface-card border text-2xl sm:text-3xl font-extrabold text-white placeholder-gray-600 focus:outline-none transition ${type === 'expense'
                    ? 'border-surface-border focus:border-primary focus:ring-2 focus:ring-primary/25'
                    : 'border-surface-border focus:border-accent focus:ring-2 focus:ring-accent/25'
                  }`}
              />
            </div>
          </div>

          {/* Quick Amount Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-gray-400">Nominal Cepat:</span>
              {currentAmountNum > 0 && (
                <button
                  type="button"
                  onClick={() => setAmountStr('')}
                  className="text-[11px] text-gray-400 hover:text-red-400 transition"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {QUICK_AMOUNTS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleQuickAddAmount(chip.value)}
                  className="py-1.5 px-2 rounded-lg bg-surface-card hover:bg-surface-hover border border-surface-border text-xs font-medium text-gray-200 hover:text-white transition active:scale-95"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector Grid */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">
              Pilih Kategori
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
              {filteredCategories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition ${isSelected
                        ? type === 'expense'
                          ? 'bg-primary/20 border-primary text-white shadow-neon-blue'
                          : 'bg-accent/20 border-accent text-white shadow-neon-cyan'
                        : 'bg-surface-card/70 border-surface-border text-gray-300 hover:bg-surface-hover hover:border-gray-600'
                      }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isSelected
                          ? type === 'expense'
                            ? 'bg-primary text-white'
                            : 'bg-accent text-background'
                          : 'bg-surface-border text-gray-300'
                        }`}
                    >
                      <CategoryIcon iconName={cat.icon} type={cat.type} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Note Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1">
                Tanggal Transaksi
              </label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full py-2 px-3 rounded-lg bg-surface-card border border-surface-border text-xs text-gray-200 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Kopi Kenangan / Ojol"
                className="w-full py-2 px-3 rounded-lg bg-surface-card border border-surface-border text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || currentAmountNum <= 0}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] ${currentAmountNum <= 0
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                  : type === 'expense'
                    ? 'bg-primary hover:bg-primary-hover text-white shadow-neon-blue border border-primary-light/30'
                    : 'bg-accent hover:bg-accent-hover text-background shadow-neon-cyan border border-accent-light/30'
                }`}
            >
              {isSubmitting ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>
                    Simpan {type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}{' '}
                    {currentAmountNum > 0 ? formatRupiah(currentAmountNum) : ''}
                  </span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-gray-500 mt-2">
              Bisa langsung tekan <kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-surface-border text-gray-400 font-mono">Enter</kbd> untuk simpan cepat
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};