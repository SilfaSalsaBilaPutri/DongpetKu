'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Sparkles,
  Plus,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { summary, setIsQuickAddOpen } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1020]/95 backdrop-blur-lg border-t border-surface-border px-3 py-2">
      <div className="flex items-center justify-around relative">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition ${
            pathname === '/dashboard' ? 'text-primary-light' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>

        {/* Transaksi */}
        <Link
          href="/transactions"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition ${
            pathname === '/transactions' ? 'text-primary-light' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span>Transaksi</span>
        </Link>

        {/* Center Floating Quick Add Button */}
        <div className="relative -top-5">
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="w-13 h-13 p-3 rounded-full bg-gradient-to-tr from-primary to-accent text-white shadow-neon-blue border-2 border-[#0B1020] flex items-center justify-center hover:scale-105 active:scale-95 transition"
            aria-label="Quick Add Transaksi"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Budget */}
        <Link
          href="/budgets"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold relative transition ${
            pathname === '/budgets' ? 'text-primary-light' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="relative">
            <PieChart className="w-5 h-5" />
            {summary.alerts_count > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <span>Budget</span>
        </Link>

        {/* Insights */}
        <Link
          href="/insights"
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold transition ${
            pathname === '/insights' ? 'text-primary-light' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Insight</span>
        </Link>
      </div>
    </nav>
  );
};
