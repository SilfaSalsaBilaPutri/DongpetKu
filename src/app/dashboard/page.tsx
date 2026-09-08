'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { BudgetAlarmWidget } from '@/components/dashboard/BudgetAlarmWidget';
import { ExpenseTrendsChart } from '@/components/dashboard/ExpenseTrendsChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { RecurringAlertCard } from '@/components/dashboard/RecurringAlertCard';
import { useApp } from '@/lib/context/AppContext';
import { formatMonthYear } from '@/lib/utils/date';
import { Zap, Database, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const {
    user,
    selectedMonth,
    selectedYear,
    setIsQuickAddOpen,
    isSupabaseConnected,
    supabaseError,
    seedStudentData,
    transactions,
    isLoading,
  } = useApp();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Supabase Migration Notice Banner (if tables not yet created in Supabase) */}
        {!isSupabaseConnected && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 to-primary/15 border border-amber-500/30 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white">Status Database Supabase</p>
                <p className="text-gray-300">
                  {supabaseError || 'Jalankan skrip supabase_schema.sql di SQL Editor Supabase untuk menghubungkan tabel riil.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/settings"
                className="py-1.5 px-3 rounded-lg bg-surface border border-surface-border text-white text-xs font-semibold hover:bg-surface-hover transition"
              >
                Lihat Panduan SQL &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* If Supabase is connected but transactions are empty, show seed helper */}
        {isSupabaseConnected && transactions.length === 0 && !isLoading && (
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 text-xs text-primary-light flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-accent" />
              <div>
                <p className="font-bold text-white">Database Supabase Terhubung!</p>
                <p className="text-gray-300">
                  Database masih kosong. Anda bisa mengisinya dengan data awal mahasiswa (Aulia Rahma) atau langsung mencatat transaksi baru.
                </p>
              </div>
            </div>
            <button
              onClick={() => seedStudentData()}
              className="py-1.5 px-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-neon-blue transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Inisialisasi Data Awal</span>
            </button>
          </div>
        )}

        {/* Top Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Halo, {user?.name?.split(' ')[0] || 'Aulia'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Dashboard Keuangan Mahasiswa — Periode{' '}
              <span className="text-primary-light font-semibold">
                {formatMonthYear(selectedMonth, selectedYear)}
              </span>
            </p>
          </div>

          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-neon-blue transition active:scale-95 self-start sm:self-auto"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>+ Quick Add Transaksi (≤5s)</span>
          </button>
        </div>

        {/* 1. Metric Summary Cards */}
        <SummaryCards />

        {/* 2. Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Analytics & Transactions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <ExpenseTrendsChart />
            <RecentTransactions />
          </div>

          {/* Right Column: Budget Alarms & Recurring (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <BudgetAlarmWidget />
            <RecurringAlertCard />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
