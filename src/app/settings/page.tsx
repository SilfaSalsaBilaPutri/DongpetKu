'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { useApp } from '@/lib/context/AppContext';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import {
  User as UserIcon,
  Tag,
  Check,
  LogOut,
} from 'lucide-react';

const ICON_OPTIONS = [
  'Utensils',
  'Coffee',
  'Car',
  'Home',
  'ShoppingBag',
  'Film',
  'BookOpen',
  'Smartphone',
  'HeartPulse',
  'Wallet',
  'Laptop',
  'Briefcase',
  'GraduationCap',
  'Sparkles',
  'Zap',
];

export default function SettingsPage() {
  const router = useRouter();
  const {
    user,
    categories,
    addCategory,
    setUserProfile,
    logout,
  } = useApp();

  // Profile Form State
  const [name, setName] = useState(user?.name || 'Aulia Rahma');
  const [email, setEmail] = useState(user?.email || 'aulia.rahma@mahasiswa.id');
  const [profileSaved, setProfileSaved] = useState(false);

  // Add Category Form State
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'income' | 'expense'>('expense');
  const [catIcon, setCatIcon] = useState('Tag');
  const [catAdded, setCatAdded] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      setUserProfile({
        ...user,
        name,
        email,
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    await addCategory({
      name: catName.trim(),
      type: catType,
      icon: catIcon,
    });

    setCatName('');
    setCatAdded(true);
    setTimeout(() => setCatAdded(false), 3000);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Pengaturan Aplikasi
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Atur profil mahasiswa dan kelola kategori transaksi kamu
          </p>
        </div>

        {/* 1. Profile Settings */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-surface-border shadow-lg space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-surface-border">
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary-light flex items-center justify-center">
              <UserIcon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Profil Mahasiswa</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-surface border border-surface-border text-xs text-white focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Email Mahasiswa / Kampus
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-surface border border-surface-border text-xs text-white focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                className="py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-neon-blue transition"
              >
                {profileSaved ? (
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <Check className="w-4 h-4" /> Tersimpan!
                  </span>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition"
              >
                <LogOut className="w-4 h-4" />
                Keluar Akun
              </button>
            </div>
          </form>
        </div>

        {/* 2. Category Management */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-surface-border shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary-light flex items-center justify-center">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Manajemen Kategori</h3>
                <p className="text-xs text-gray-400">Kategori preset global & kategori kustom kamu</p>
              </div>
            </div>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="p-4 rounded-xl bg-surface border border-surface-border space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              + Tambah Kategori Kustom Baru
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5">
                <label className="block text-[11px] text-gray-400 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Contoh: Beli Baju / Gym"
                  className="w-full py-2 px-3 rounded-lg bg-surface-card border border-surface-border text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] text-gray-400 mb-1">Jenis</label>
                <select
                  value={catType}
                  onChange={(e) => setCatType(e.target.value as any)}
                  className="w-full py-2 px-3 rounded-lg bg-surface-card border border-surface-border text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="expense">Pengeluaran (-)</option>
                  <option value="income">Pemasukan (+)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-gray-400 mb-1">Icon</label>
                <select
                  value={catIcon}
                  onChange={(e) => setCatIcon(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-surface-card border border-surface-border text-xs text-white focus:outline-none focus:border-primary"
                >
                  {ICON_OPTIONS.map((ico) => (
                    <option key={ico} value={ico}>
                      {ico}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-neon-blue transition"
                >
                  {catAdded ? 'Ditambahkan!' : '+ Tambah'}
                </button>
              </div>
            </div>
          </form>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface border border-surface-border text-xs"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${c.type === 'income'
                      ? 'bg-accent/20 text-accent'
                      : 'bg-primary/20 text-primary-light'
                    }`}
                >
                  <CategoryIcon iconName={c.icon} type={c.type} className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <p className="font-semibold text-white truncate">{c.name}</p>
                  <p className="text-[10px] text-gray-400">
                    {c.is_preset ? 'Preset Global' : 'Kustom'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}