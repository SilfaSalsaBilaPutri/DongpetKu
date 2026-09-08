'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { supabase } from '@/lib/supabase/client';
import { DEMO_STUDENT_USER, ensureUserInDb } from '@/lib/services/supabaseService';
import { Wallet, ArrowRight, Sparkles, Lock, Mail, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setUserProfile, refreshData } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message || 'Login gagal. Periksa email & password.');
        setIsLoading(false);
        return;
      }

      if (data.user) {
        const loggedInUser = {
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Mahasiswa',
          email: data.user.email || email,
          image_url: data.user.user_metadata?.image_url || null,
        };
        await ensureUserInDb(loggedInUser);
        await setUserProfile(loggedInUser);
        await refreshData();
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await ensureUserInDb(DEMO_STUDENT_USER);
      await setUserProfile(DEMO_STUDENT_USER);
      await refreshData();
      router.push('/dashboard');
    } catch (err) {
      console.error('Demo login error:', err);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-foreground flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-background font-black shadow-neon-blue group-hover:scale-105 transition">
            <Wallet className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-white">DompetKu</span>
        </Link>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Masuk ke Financial Command Center
        </h2>
        <p className="mt-1.5 text-xs text-gray-400">
          Kelola uang saku, pantau budget alarm, dan catat transaksi kilat.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-surface-card border border-surface-border rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5">
          {/* Quick Demo Login Button */}
          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            type="button"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-neon-blue transition active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Masuk Demo Instant (Aulia Rahma)</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-surface-border w-full" />
            <span className="bg-surface-card px-3 text-[11px] font-semibold text-gray-400 uppercase">
              atau akun Anda
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mahasiswa@kampus.id"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-white text-xs font-bold transition"
            >
              {isLoading ? 'Memproses...' : 'Masuk dengan Email'}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-gray-400">
              Belum punya akun?{' '}
              <Link href="/register" className="text-primary-light font-bold hover:underline">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
