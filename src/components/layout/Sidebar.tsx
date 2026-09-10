'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Repeat,
  Sparkles,
  Settings,
  PlusCircle,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Riwayat Transaksi', icon: Receipt },
  { href: '/budgets', label: 'Budget & Alarm', icon: PieChart, hasBadge: true },
  { href: '/recurring', label: 'Transaksi Rutin', icon: Repeat },
  { href: '/insights', label: 'Insight Bulanan', icon: Sparkles },
  { href: '/settings', label: 'Pengaturan & Kategori', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { summary, setIsQuickAddOpen, logout } = useApp();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#0D1429] border-r border-surface-border min-h-[calc(100vh-4rem)] p-4 shrink-0">
      {/* Navigation List */}
      <div className="space-y-1">
        <p className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          Navigasi Utama
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition ${isActive
                  ? 'bg-primary/20 text-white border border-primary/40 shadow-neon-blue'
                  : 'text-gray-300 hover:bg-surface-card hover:text-white'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${isActive ? 'text-primary-light' : 'text-gray-400'
                    }`}
                />
                <span>{item.label}</span>
              </div>

              {item.hasBadge && summary.alerts_count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {summary.alerts_count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Quick Add CTA Card */}
      <div className="mt-8 p-4 rounded-2xl bg-gradient-to-b from-[#18244D] to-[#121A36] border border-primary/30 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-primary/20 blur-xl pointer-events-none" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-accent mb-1">
          Quick Entry
        </h4>
        <p className="text-xs text-gray-300 mb-3">
          Catat pengeluaran harian cuma butuh waktu ≤5 detik!
        </p>
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-neon-blue transition"
        >
          <PlusCircle className="w-4 h-4" />
          + Transaksi Cepat
        </button>
      </div>

      {/* Footer Student Tips & Logout */}
      <div className="mt-auto pt-4 border-t border-surface-border space-y-3">
        <div className="p-3 rounded-xl bg-surface-card/60 border border-surface-border text-[11px] text-gray-400 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <span>
            Data tersimpan aman di PostgreSQL Supabase dengan RLS aktif.
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition"
        >
          <LogOut className="w-4 h-4" />
          Keluar / Logout
        </button>
      </div>
    </aside>
  );
};