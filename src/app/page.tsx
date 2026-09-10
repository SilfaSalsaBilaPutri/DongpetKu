'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  Zap,
  ShieldAlert,
  Repeat,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { DEMO_STUDENT_USER, ensureUserInDb } from '@/lib/services/supabaseService';

export default function LandingPage() {
  const router = useRouter();
  const { setUserProfile, refreshData } = useApp();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Alur login demo dibuat persis sama seperti halaman login (LoginPage)
  const handleDemoLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);

    try {
      await ensureUserInDb(DEMO_STUDENT_USER);
      await setUserProfile(DEMO_STUDENT_USER);
      await refreshData();
      router.push('/dashboard');
    } catch (err) {
      console.error('Demo login error:', err);
      router.push('/dashboard');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-foreground selection:bg-primary/30 selection:text-white flex flex-col overflow-x-hidden">
      {/* Top Navbar */}
      <nav className="border-b border-surface-border bg-[#0B1020]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-background font-black shadow-neon-blue">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">DompetKu</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary-light border border-primary/30">
              v1.0
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-gray-300 hover:text-white px-3 py-1.5 transition"
            >
              Masuk
            </Link>
            <button
              onClick={handleDemoLogin}
              disabled={isLoggingIn}
              className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 text-white text-xs sm:text-sm font-bold shadow-neon-blue transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Buka Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Glow Background blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-accent/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-card border border-primary/30 text-xs font-semibold text-accent mb-6 shadow-inner animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>A Modern Financial Command Center for Students</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
          Kendalikan Uang Saku & Kosan Sebelum{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-accent to-emerald-400">
            Budget Jebol.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          Bukan sekadar pencatat biasa. DompetKu hadir dengan kecepatan input transaksi{' '}
          <strong className="text-white">≤5 detik</strong> dan alarm pintar yang memperingatkanmu saat pengeluaran kategori mencapai 80%.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-16">
          <button
            onClick={handleDemoLogin}
            disabled={isLoggingIn}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-neon-blue transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>{isLoggingIn ? 'Memuat Demo Aulia...' : 'Mulai Sekarang (Demo Gratis)'}</span>
          </button>

          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-surface-card hover:bg-surface-hover border border-surface-border text-gray-200 text-sm font-semibold transition"
          >
            <span>Login dengan Akun</span>
          </Link>
        </div>

        {/* Live Interactive Preview Card */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-surface-card border border-surface-border shadow-2xl p-4 sm:p-6 text-left relative overflow-hidden group">
          <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-gray-400 ml-2">DompetKu Command Center Preview</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-accent/20 text-accent border border-accent/30">
              Live State
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-surface/60 border border-surface-border">
              <span className="text-xs text-gray-400">Total Uang Saku Bersih</span>
              <p className="text-2xl font-black text-accent mt-1">Rp 2.218.000</p>
              <p className="text-[11px] text-gray-400 mt-1">Surplus kas bulan ini</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-300 font-bold">Makan & Minum</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                  82.5% (Warning)
                </span>
              </div>
              <p className="text-xl font-extrabold text-white mt-1">Rp 825.000 / Rp 1.000.000</p>
              <div className="w-full h-1.5 bg-surface-border rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[82.5%]" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs text-red-300 font-bold">Kopi & Nongkrong</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 animate-pulse">
                  113% (Over Budget!)
                </span>
              </div>
              <p className="text-xl font-extrabold text-white mt-1">Rp 340.000 / Rp 300.000</p>
              <div className="w-full h-1.5 bg-surface-border rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-red-500 rounded-full w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-surface-border">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Fitur Unggulan Mahasiswa
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Dirancang khusus untuk gaya hidup dan kebiasaan mahasiswa perantau.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border hover:border-primary/40 transition">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary-light flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Quick Add ≤5 Detik</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Buka modal dengan tombol <code>N</code> atau tombol cepat di HP, pilih nominal instan, klik kategori dan selesai tanpa ribet!
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border hover:border-amber-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Budget Alarm 80% & 100%</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Dapatkan peringatan otomatis saat kuota budget nongkrong, makan, atau ojol mendekati batas agar saldo tidak habis di akhir bulan.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border hover:border-accent/40 transition">
            <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center mb-4">
              <Repeat className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Otomasi Transaksi Rutin</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Catat tagihan kos bulanan, Spotify student, dan uang bulanan secara terjadwal otomatis tanpa lupa.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-surface-border bg-surface/40 text-center text-xs text-gray-500">
        <p>© 2026 DompetKu — Financial Command Center for Students. Built with Next.js & Supabase.</p>
      </footer>
    </div>
  );
}