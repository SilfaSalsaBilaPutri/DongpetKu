'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useApp } from '@/lib/context/AppContext';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { formatRupiah, parseRupiahInput } from '@/lib/utils/currency';
import { formatDateIndo, getTodayDateString } from '@/lib/utils/date';
import {
  Repeat,
  Plus,
  Zap,
  Check,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Clock,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react';

export default function RecurringPage() {
  const {
    recurringTransactions,
    categories,
    addRecurringTransaction,
    toggleRecurringTransaction,
    deleteRecurringTransaction,
    processRecurringTransactions,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<string | null>(null);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleOpenAdd = () => {
    setSelectedCatId(filteredCategories[0]?.id || '');
    setAmountStr('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseRupiahInput(amountStr);
    if (amountNum <= 0 || !selectedCatId) {
      alert('Lengkapi semua data dengan benar!');
      return;
    }

    const cat = categories.find((c) => c.id === selectedCatId);
    const finalDesc = description.trim() || `Rutin: ${cat?.name}`;

    await addRecurringTransaction({
      category_id: selectedCatId,
      transaction_type: type,
      amount: amountNum,
      description: finalDesc,
      frequency,
      start_date: getTodayDateString(),
      next_transaction_date: getTodayDateString(),
      is_active: true,
    });

    setIsModalOpen(false);
  };

  const handleRunNow = async () => {
    setIsProcessing(true);
    try {
      const count = await processRecurringTransactions();
      setProcessResult(`Berhasil mencatat ${count} transaksi rutin ke riwayat!`);
      setTimeout(() => setProcessResult(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Transaksi Rutin & Berulang
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Otomasi pencatatan uang bulanan, biaya kos, dan langganan periodik.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRunNow}
              disabled={isProcessing}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-surface-card hover:bg-surface-hover border border-surface-border text-xs sm:text-sm font-semibold text-accent transition"
            >
              <Zap className="w-4 h-4 text-accent" />
              <span>{isProcessing ? 'Memproses...' : 'Proses Semua Sekarang'}</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-neon-blue transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Transaksi Rutin</span>
            </button>
          </div>
        </div>

        {/* Process Banner Alert */}
        {processResult && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{processResult}</span>
          </div>
        )}

        {/* Recurring List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recurringTransactions.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-surface-card border border-surface-border rounded-2xl">
              <Repeat className="w-12 h-12 mx-auto mb-2 opacity-40 text-primary-light" />
              <p className="text-sm font-bold text-white">Belum Ada Transaksi Rutin</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">
                Tambahkan pembayaran kos atau uang saku agar otomatis tercatat tanpa input berulang tiap bulan.
              </p>
              <button
                onClick={handleOpenAdd}
                className="py-2 px-4 rounded-xl bg-primary text-white text-xs font-bold"
              >
                + Tambah Transaksi Rutin
              </button>
            </div>
          ) : (
            recurringTransactions.map((rec) => {
              const isIncome = rec.transaction_type === 'income';
              const cat = categories.find((c) => c.id === rec.category_id);

              return (
                <div
                  key={rec.id}
                  className={`p-5 rounded-2xl border transition shadow-lg flex flex-col justify-between ${
                    rec.is_active
                      ? 'bg-surface-card border-surface-border hover:border-primary/40'
                      : 'bg-surface/30 border-surface-border/50 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isIncome
                              ? 'bg-accent/20 text-accent border border-accent/30'
                              : 'bg-primary/20 text-primary-light border border-primary/30'
                          }`}
                        >
                          <CategoryIcon
                            iconName={cat?.icon}
                            type={rec.transaction_type}
                            className="w-4 h-4"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white line-clamp-1">
                            {rec.description}
                          </h4>
                          <span className="text-[11px] text-gray-400">{cat?.name || 'Kategori'}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleRecurringTransaction(rec.id)}
                        className="text-gray-400 hover:text-white transition"
                        title={rec.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        {rec.is_active ? (
                          <ToggleRight className="w-6 h-6 text-accent" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-500" />
                        )}
                      </button>
                    </div>

                    <div className="my-4">
                      <p className="text-xs text-gray-400">Nominal Rutin:</p>
                      <p
                        className={`text-xl font-black font-mono mt-0.5 ${
                          isIncome ? 'text-accent' : 'text-white'
                        }`}
                      >
                        {isIncome ? '+ ' : '- '}
                        {formatRupiah(rec.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-surface-border flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary-light" />
                      <span className="capitalize">{rec.frequency} (Bulanan)</span>
                    </span>

                    <button
                      onClick={() => {
                        if (confirm('Hapus transaksi rutin ini?')) {
                          deleteRecurringTransaction(rec.id);
                        }
                      }}
                      className="p-1 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Add Recurring */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-surface-card border border-surface-border rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-border">
                <h3 className="text-base font-bold text-white">Buat Transaksi Rutin Baru</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Type toggle */}
                <div className="grid grid-cols-2 p-1 rounded-xl bg-surface border border-surface-border gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setType('expense');
                      const first = categories.find((c) => c.type === 'expense');
                      if (first) setSelectedCatId(first.id);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold ${
                      type === 'expense'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'text-gray-400'
                    }`}
                  >
                    <ArrowDownCircle className="w-3.5 h-3.5" /> Pengeluaran
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('income');
                      const first = categories.find((c) => c.type === 'income');
                      if (first) setSelectedCatId(first.id);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold ${
                      type === 'income'
                        ? 'bg-accent/20 text-accent border border-accent/30'
                        : 'text-gray-400'
                    }`}
                  >
                    <ArrowUpCircle className="w-3.5 h-3.5" /> Pemasukan
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">
                    Deskripsi / Nama Tagihan
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Contoh: Sewa Kos Bulanan / Spotify Student"
                    className="w-full py-2.5 px-3 rounded-xl bg-surface border border-surface-border text-xs text-white focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">
                    Pilih Kategori
                  </label>
                  <select
                    value={selectedCatId}
                    onChange={(e) => setSelectedCatId(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-surface border border-surface-border text-xs text-white focus:outline-none focus:border-primary"
                  >
                    {filteredCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">
                    Nominal Rutin (Rupiah)
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
                      placeholder="0"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface border border-surface-border text-sm font-bold text-white focus:outline-none focus:border-primary"
                      required
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
                    Simpan Rutin
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
