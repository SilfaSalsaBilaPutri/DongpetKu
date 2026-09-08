'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context/AppContext';
import { formatRupiah } from '@/lib/utils/currency';
import { formatMonthYear, INDONESIAN_MONTHS } from '@/lib/utils/date';
import {
  Wallet,
  Bell,
  Search,
  Plus,
  ChevronDown,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    user,
    summary,
    budgetAlerts,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    setIsQuickAddOpen,
    markAlertAsRead,
    markAllAlertsAsRead,
  } = useApp();

  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  const unreadAlerts = budgetAlerts.filter(a => !a.is_read);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B1020]/90 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand & Month Selector */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-neon-blue group-hover:scale-105 transition">
              <Wallet className="w-5 h-5 text-background font-bold" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-white">DompetKu</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary-light border border-primary/30">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono -mt-0.5">Student Command Center</p>
            </div>
          </Link>

          {/* Month & Year Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
              className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-surface-card hover:bg-surface-hover border border-surface-border text-xs sm:text-sm font-semibold text-gray-200 transition"
            >
              <Calendar className="w-3.5 h-3.5 text-accent" />
              <span>{formatMonthYear(selectedMonth, selectedYear)}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {isMonthPickerOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-surface-card border border-surface-border rounded-xl shadow-2xl p-2 z-50 animate-fade-in">
                <div className="flex items-center justify-between px-2 py-1 mb-2 border-b border-surface-border text-xs font-bold text-gray-400">
                  <span>PILIH PERIODE</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setSelectedYear(selectedYear - 1)}
                      className="px-1.5 py-0.5 rounded bg-surface hover:text-white"
                    >
                      {selectedYear - 1}
                    </button>
                    <span className="px-1.5 py-0.5 rounded bg-primary/30 text-white font-bold">{selectedYear}</span>
                    <button
                      onClick={() => setSelectedYear(selectedYear + 1)}
                      className="px-1.5 py-0.5 rounded bg-surface hover:text-white"
                    >
                      {selectedYear + 1}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto">
                  {INDONESIAN_MONTHS.map((m, idx) => {
                    const monthNum = idx + 1;
                    const isSelected = monthNum === selectedMonth;
                    return (
                      <button
                        key={m}
                        onClick={() => {
                          setSelectedMonth(monthNum);
                          setIsMonthPickerOpen(false);
                        }}
                        className={`py-1 px-1.5 rounded-lg text-xs font-medium text-center transition ${
                          isSelected
                            ? 'bg-primary text-white font-bold'
                            : 'text-gray-300 hover:bg-surface-hover hover:text-white'
                        }`}
                      >
                        {m.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center / Action: Quick Add Raycast Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="w-full flex items-center justify-between py-2 px-3.5 rounded-xl bg-surface-card/80 hover:bg-surface-card border border-surface-border hover:border-gray-600 text-gray-400 text-xs transition shadow-inner group"
          >
            <span className="flex items-center gap-2 text-gray-300 group-hover:text-white">
              <Search className="w-3.5 h-3.5 text-primary-light" />
              <span>Tambah transaksi cepat...</span>
            </span>
            <kbd className="px-2 py-0.5 rounded bg-surface border border-surface-border text-[10px] font-mono text-gray-400 font-semibold group-hover:text-primary-light group-hover:border-primary/40">
              N
            </kbd>
          </button>
        </div>

        {/* Right: Quick Add Button + Notification Bell + User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Add CTA Button */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 text-white text-xs sm:text-sm font-bold shadow-neon-blue transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah Transaksi</span>
            <span className="sm:hidden">Tambah</span>
          </button>

          {/* Budget Alarm Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              className="relative p-2 rounded-xl bg-surface-card hover:bg-surface-hover border border-surface-border text-gray-300 hover:text-white transition"
              aria-label="Peringatan Budget"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isAlertsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-card border border-surface-border rounded-2xl shadow-2xl p-4 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-border">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Alarm & Peringatan Budget</span>
                    {unreadAlerts.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                        {unreadAlerts.length} Baru
                      </span>
                    )}
                  </div>
                  {unreadAlerts.length > 0 && (
                    <button
                      onClick={markAllAlertsAsRead}
                      className="text-xs text-primary-light hover:underline"
                    >
                      Tandai Dibaca
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {budgetAlerts.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-xs">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-70" />
                      Semua budget kategori aman terkendali!
                    </div>
                  ) : (
                    budgetAlerts.map(alert => {
                      const isOver = alert.alert_type === 'over_budget';
                      return (
                        <div
                          key={alert.id}
                          onClick={() => markAlertAsRead(alert.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                            isOver
                              ? 'bg-red-500/10 border-red-500/30 text-red-200 hover:bg-red-500/15'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-200 hover:bg-amber-500/15'
                          } ${!alert.is_read ? 'ring-1 ring-white/20' : 'opacity-70'}`}
                        >
                          <div className="flex items-start gap-2.5">
                            {isOver ? (
                              <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white">
                                  {isOver ? 'Budget Terlampaui!' : 'Budget Hampir Habis'}
                                </span>
                                <span className="text-[10px] font-mono opacity-60">
                                  {new Date(alert.triggered_at).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}{' '}
                                  WIB
                                </span>
                              </div>
                              <p className="text-gray-300 mt-1">
                                Kategori <span className="font-semibold text-white">{alert.category?.name || 'Kategori'}</span> telah mencapai{' '}
                                <span className="font-bold text-white">{alert.threshold_percentage}%</span>.
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-surface-border text-center">
                  <Link
                    href="/budgets"
                    onClick={() => setIsAlertsOpen(false)}
                    className="text-xs font-semibold text-accent hover:text-accent-light"
                  >
                    Kelola Semua Budget &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <Link
            href="/settings"
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-surface-card hover:bg-surface-hover border border-surface-border transition group"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-primary/20 border border-primary/40 shrink-0">
              {user?.image_url ? (
                <img
                  src={user.image_url}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-primary">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-white group-hover:text-primary-light transition truncate max-w-[100px]">
                {user?.name?.split(' ')[0] || 'Aulia'}
              </p>
              <p className="text-[10px] text-gray-400">Mahasiswi</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};
