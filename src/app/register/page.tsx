'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { supabase } from '@/lib/supabase/client';
import { ensureUserInDb } from '@/lib/services/supabaseService';
import { Wallet, ArrowRight, Lock, Mail, User as UserIcon } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { setUserProfile, refreshData } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Pendaftaran gagal.');
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        const newUser = {
          id: data.user.id,
          name: name || 'Mahasiswa',
          email: email,
        };
        await ensureUserInDb(newUser);
        await setUserProfile(newUser);
        await refreshData();
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Register error:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat mendaftar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-foreground flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-background font-black shadow-neon-blue group-hover:scale-105 transition">
            <Wallet className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-white">DompetKu</span>
        </Link>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Buat Akun DompetKu Baru
        </h2>
        <p className="mt-1.5 text-xs text-gray-400">
          Mulai atur budget bulanan dan aktifkan alarm pengeluaran.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-surface-card border border-surface-border rounded-2xl shadow-2xl p-6 sm:p-8 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap Anda"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

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
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-neon-blue transition"
            >
              {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-gray-400">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-primary-light font-bold hover:underline">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
