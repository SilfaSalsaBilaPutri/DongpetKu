# DompetKu — Coldstart Document

> Dokumen ini merangkum seluruh keputusan yang sudah **diapprove** dari sesi sebelumnya, untuk dijadikan starting context/coldstart pada percakapan atau tools baru (termasuk Antigravity).

---

## 1. Ide Produk

**Nama Produk:** DompetKu — Expense Tracker + Budget Alarm v1.0

**Konsep Inti:** Aplikasi pencatat pengeluaran untuk mahasiswa, dengan fokus pada input transaksi cepat, budget per kategori, dan alarm/peringatan sebelum budget habis.

**Karakter Produk:** "A modern financial command center for students" — bukan sekadar aplikasi pencatat keuangan biasa, tapi dashboard finansial yang terasa profesional dan modern.

---

## 2. PRD Ringkas

- **Target user:** Mahasiswa usia 18–24 tahun, umumnya ngekos/merantau, menggunakan berbagai metode pembayaran (cash, GoPay, DANA, transfer bank), tetapi belum melakukan budgeting secara serius.
- **Fokus MVP:** *Track + Budget + Insight*, dengan input transaksi manual yang cepat.
- **Fitur prioritas MVP:**
  1. Quick Add Transaction (target ≤5 detik per input)
  2. Budget + Alarm per kategori
  3. Dashboard Bulanan & Trends
  4. Recurring Transactions (transaksi rutin, mis. kos, langganan)
  5. Export CSV

---

## 3. User Persona

### 👤 Aulia Rahma

| Atribut | Detail |
|---|---|
| Usia | 21 tahun |
| Status | Mahasiswi tingkat akhir |
| Domisili | Perantau, tinggal di kos di Jakarta |
| Sumber keuangan | Uang bulanan dari orang tua Rp3.500.000 + freelance sesekali |
| Perangkat utama | Smartphone |
| Kebiasaan pembayaran | GoPay, DANA, cash, transfer bank |

**Kebutuhan Utama:**
1. Mencatat pengeluaran dengan cepat setelah transaksi
2. Mengetahui ke mana uangnya digunakan tiap bulan
3. Mengatur batas budget per kategori (makan, transportasi, hiburan)
4. Mendapat peringatan sebelum budget habis
5. Mengingat transaksi rutin (kos, langganan)
6. Melihat ringkasan keuangan bulanan yang mudah dipahami

**Masalah Utama (Pain Point):**
> "Uang aku sering habis sebelum akhir bulan, tapi aku nggak tahu sebenarnya habis buat apa."

- Sering belanja kecil (kopi, makanan, ojol) tanpa sadar totalnya
- Tidak punya batas pengeluaran per kategori
- Baru sadar uang hampir habis di minggu terakhir bulan
- Lupa memperhitungkan pengeluaran rutin
- Tidak pernah review pengeluaran bulanan secara terstruktur

**Tujuan Menggunakan DompetKu:** Mengetahui kondisi keuangan secara cepat dan mendapat peringatan sebelum pengeluaran melewati batas budget.

---

## 4. User Flow Utama

**Goal:** User berhasil mencatat pengeluaran dan mengetahui apakah pengeluaran tersebut masih aman terhadap budget kategori.

| Step | Aksi User | Halaman yang Muncul | Sistem / Hasil |
|---|---|---|---|
| 1 | Membuka DompetKu | Landing / Login Page | Opsi Login atau Register |
| 2 | Login menggunakan akun | Login Page | Sistem memvalidasi akun |
| 3 | Login berhasil | Dashboard | Ringkasan pemasukan, pengeluaran, kondisi budget bulan ini |
| 4 | Ingin mencatat pengeluaran baru | Dashboard → Quick Add | Tekan tombol "+ Tambah Transaksi" |
| 5 | Mengisi transaksi | Add Transaction Page/Modal | Input nominal, kategori, tanggal, jenis transaksi |
| 6 | Menyimpan transaksi | Transaction Success / Dashboard | Transaksi tersimpan, saldo/ringkasan diperbarui |
| 7 | Sistem cek penggunaan budget | Budget Status / Dashboard | Sistem menghitung persentase penggunaan budget kategori |
| 8A | Budget masih aman (<80%) | Dashboard | Status budget normal |
| 8B | Budget mencapai >80% | Budget Alert / Notification | Peringatan budget hampir habis |
| 8C | Budget >100% | Budget Alert / Notification | Peringatan budget terlampaui |
| 9 | Melihat kondisi pengeluaran | Dashboard / Budget Detail Page | 🎯 Tujuan tercapai |

**Visual Flow:**
```
Open App → Landing/Login Page → Login/Register → Dashboard
→ Klik "+ Tambah Transaksi" → Add Transaction Page/Modal
→ Input Nominal + Kategori + Tanggal → Simpan Transaksi
→ Sistem Update Dashboard & Budget
→ Cek: penggunaan budget ≥ 80%?
    → Tidak → Status Aman → Dashboard
    → Ya (>80%) → Budget Warning/Alert
    → >100% → Budget Exceeded Alert
→ 🎯 User mengetahui pengeluaran & status budget
```

**Daftar Halaman MVP (Sitemap Asumsi):**
1. Landing Page
2. Login Page
3. Register Page
4. Dashboard
5. Add Transaction Page / Modal
6. Transaction History Page
7. Budget Page
8. Budget Detail Page
9. Recurring Transactions Page
10. Monthly Report / Insight Page
11. Export CSV (action, bukan halaman terpisah)
12. Profile / Settings Page

> **Catatan:** Wireframe visual belum dibuat pada sesi sebelumnya — bagian ini masih perlu dikerjakan di tahap berikutnya (IA/Sitemap detail sudah disinggung sebagai langkah lanjutan, tapi belum direalisasikan).

---

## 5. Data Schema (Database)

**Konvensi:** tabel `plural_snake_case`, kolom `snake_case`, PK `id` (uuid), FK `[tabel_singular]_id`, timestamp `created_at`/`updated_at`, nominal `numeric(15,2)`, tanggal transaksi `date`.

### 6 Tabel Utama (Approved)

1. **`users`** — id, name, email, password_hash, image_url, created_at, updated_at
2. **`categories`** — id, user_id (nullable, NULL = preset global), name, type (`income`/`expense`), icon, is_preset, created_at, updated_at
3. **`transactions`** — id, user_id, category_id, transaction_type (`income`/`expense`), amount, description, transaction_date, recurring_transaction_id (nullable FK), created_at, updated_at
4. **`budgets`** — id, user_id, category_id, amount, month, year, created_at, updated_at — **Unique constraint:** `(user_id, category_id, month, year)`
5. **`budget_alerts`** — id, budget_id, alert_type (`warning`/`limit_reached`/`over_budget`), threshold_percentage, triggered_at, is_read
6. **`recurring_transactions`** — id, user_id, category_id, transaction_type, amount, description, frequency (`monthly` untuk MVP; opsional `daily`/`weekly`/`yearly`), start_date, next_transaction_date, is_active, created_at, updated_at

### Keputusan Desain Schema (Approved)
- Kategori bisa **preset** (global, `user_id = NULL`) maupun **custom** milik user.
- `budget_alerts` dibuat sebagai tabel terpisah untuk menyimpan riwayat alert (bukan hanya real-time check).
- **Tidak** ada kolom `payment_method` — sengaja disederhanakan untuk MVP.
- **Recurring transaction otomatis membuat record baru di `transactions`** sesuai jadwal, agar tetap masuk ke Dashboard, Budget, Trends, dan Export CSV.
- **Tidak ada tabel khusus untuk Export CSV** — fitur ini langsung memfilter dan generate dari tabel `transactions`.

### Relasi
```
users ──< transactions >── categories
users ──< budgets >── categories
budgets ──< budget_alerts
users ──< recurring_transactions >── categories
users ──< categories (custom)
```

---

## 6. Style & Mood Visual (Approved)

**Mood yang diinginkan:** Canggih, sangat modern (2026), tidak membosankan, terlihat seperti dibuat oleh engineer profesional. Tools desain: **Antigravity**.

**Arah Visual:** Modern Product Engineering + Premium Fintech + Clean Data Interface.

### 🎨 Warna Utama

| Peran | Hex | Nama |
|---|---|---|
| Primary Background | `#0B1020` | Deep Navy |
| Primary/Action | `#3B82F6` | Electric Blue |
| Accent/Positive | `#2DD4BF` | Mint Cyan |

### ⚠️ Warna Status (Budget Alarm)

| Status | Hex | Nama |
|---|---|---|
| Budget Aman | `#22C55E` | Emerald |
| Hampir Habis | `#F59E0B` | Amber |
| Melebihi Budget | `#EF4444` | Red |

> Warna status hanya untuk feedback data, bukan warna dominan desain.

### 🔤 Typography

- **Font utama: Inter** (fallback: `ui-sans-serif`, `system-ui`, `sans-serif`)
- Alternatif yang dipertimbangkan: **Geist** (lebih futuristic/engineering, tapi Inter dipilih karena lebih nyaman untuk data-heavy/angka)

### 🧠 Referensi Mood (Approved)

- [Linear](https://linear.app/) — clean layout, information hierarchy kuat, professional product interface
- [Raycast](https://www.raycast.com/) — futuristic, fast, keyboard-first, relevan untuk Quick Add Transaction
- [Vercel](https://vercel.com/) — engineering product, premium SaaS, dashboard & data visualization

### Keyword Desain

```
Modern SaaS · Engineering-grade UI · Premium fintech · Data-driven
Command center · Clean hierarchy · High information density
Minimal but not empty · Subtle depth · Glass only when useful
Sharp typography · Smooth micro-interactions · 2026 product design
```

### Prinsip Non-negotiable

- Platform: **responsive web app**
- Target UX: Quick Add transaksi **≤5 detik**
- Warna dan visual **tidak boleh mengorbankan keterbacaan data** (nominal rupiah, budget, persentase, chart)

---

## 7. Status Approval

✅ PRD, User Persona, User Flow — **approved & fully implemented**
✅ Database Schema (6 tabel) — **approved & DDL created (`supabase_schema.sql`)**
✅ Color palette, font, mood reference — **approved & applied via Tailwind CSS**
✅ Tech Stack (Next.js 14, TypeScript, Tailwind CSS, PostgreSQL via Supabase) — **approved & operational**
✅ Frontend & Backend Features — **100% built & fully functional**
✅ Mobile Responsive UI — **implemented with Mobile BottomNav + Desktop Sidebar**
✅ Quick Add Transaction (≤5s) — **implemented with Hotkey `N`, Quick Chips, Instant Submit & Budget Check**
✅ Budget Alarm System (<80% Aman, 80-100% Warning, >100% Over Budget) — **implemented with real-time feedback & log history**
✅ Indonesian Format (Rupiah Rp, Tanggal DD/MM/YYYY, Waktu WIB) — **applied across all views**

---

## 8. Tech Stack & Arsitektur (Final)

- **Frontend & Backend Framework:** Next.js 14 (App Router, Server Components & Client Components)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS (Custom palette `#0B1020` Deep Navy, `#3B82F6` Electric Blue, `#2DD4BF` Mint Cyan, `#22C55E` Emerald, `#F59E0B` Amber, `#EF4444` Red)
- **UI & Icons:** Lucide React + Tailwind CSS + Canvas Confetti (celebration effects on income)
- **Data Visualization / Charts:** Recharts (Interactive Category Distribution Bar Chart & Donut Chart)
- **Database & Auth:** PostgreSQL (Supabase Project `yyiqiihnozvbrwnljiqg`)
  - **Status:** File `src/lib/services/supabaseService.ts` terhubung penuh dengan operasi CRUD riil (Create, Read, Update, Delete).
  - **Mock Data Elimination:** File mock hardcoded (`mockData.ts`) telah dihapus secara menyeluruh dari kode sumber; seluruh data diambil dan disimpan secara dinamis dari tabel database Supabase.
  - **File Migrasi DDL:** `supabase_schema.sql` (6 tabel: `users`, `categories`, `transactions`, `budgets`, `budget_alerts`, `recurring_transactions`)
  - **Authentication:** Supabase Auth (`@supabase/supabase-js`) + Seamless Demo Login Mahasiswa
  - **Security:** Row-Level Security (RLS) pada seluruh tabel publik
- **Utility / Parsing:** `date-fns` & custom Indonesian formatters (`formatRupiah`, `formatDateIndo`, `formatDateTimeWIB`, `exportTransactionsToCSV`)

---

## 9. Struktur Halaman & Fitur Aplikasi

1. **`/` (Landing Page)**: Showcase Financial Command Center untuk mahasiswa, ringkasan fitur unggulan, live preview state, dan call-to-action masuk ke dashboard.
2. **`/dashboard` (Command Center)**:
   - Header greeting personal untuk mahasiswa + tombol Quick Add.
   - 4 Metric Summary Cards: Sisa Saldo Kas, Total Pemasukan, Total Pengeluaran, Sisa & Status Budget Alarm (dihitung langsung dari data Supabase).
   - Grafik Distribusi Pengeluaran (Toggle Bar Chart & Donut Chart).
   - Widget Budget Alarm per Kategori (progress bar dinamis dengan badge persentase & peringatan).
   - Daftar Transaksi Terkini dengan icon kategori dan nominal Rupiah.
   - Card Transaksi Rutin dengan tombol aksi instan *"Proses Transaksi Rutin Sekarang"*.
   - Banner status database Supabase interaktif.
3. **`/transactions` (Riwayat Transaksi)**:
   - Pencarian real-time berdasarkan catatan atau nama kategori.
   - Filter jenis transaksi (Semua, Pengeluaran, Pemasukan), filter kategori, dan filter periode (Bulan Ini / Semua Waktu).
   - Tombol **Export CSV** untuk mengunduh seluruh transaksi terfilter dalam format CSV Excel.
   - Hapus transaksi langsung dengan sinkronisasi ke tabel `transactions` Supabase.
4. **`/budgets` (Budget & Alarm Batas)**:
   - Ringkasan total alokasi budget, total terpakai, dan sisa kuota aman dari database.
   - Indikator level alarm: Hijau (<80% Aman), Kuning (80%–100% Peringatan), Merah (>100% Jebol/Over Budget).
   - Form modal untuk set budget dan ubah batas budget per kategori (disimpan ke tabel `budgets`).
   - Riwayat Log Alarm (`budget_alerts`) lengkap dengan tanggal/jam WIB.
5. **`/recurring` (Transaksi Rutin)**:
   - Manajemen tagihan bulanan mahasiswa (Sewa kos, Spotify student, uang bulanan ortu) yang disimpan ke tabel `recurring_transactions`.
   - Toggle aktif/nonaktif dan tombol *"Proses Semua Sekarang"* untuk mencatat transaksi rutin ke database seketika.
6. **`/insights` (Insight & Laporan Bulanan)**:
   - Analisis kesehatan finansial mahasiswa (Tingkat Tabungan/Savings Rate, Rata-rata Pengeluaran Harian, Pos Pengeluaran Terbesar).
   - Rekomendasi hemat terarah untuk mahasiswa (tips nongkrong, bayar kos awal bulan, promo transport).
   - Rincian persentase share seluruh kategori pengeluaran.
7. **`/settings` (Pengaturan & Database)**:
   - Edit profil mahasiswa (nama, email kampus).
   - Status koneksi Supabase & tombol *"Sinkronkan Data Awal Mahasiswa"* (seeder).
   - Manajemen kategori kustom (tambah kategori baru ke tabel `categories` Supabase).
8. **`/login` & `/register`**:
   - Autentikasi Supabase + Tombol Instant Demo Login.
9. **Modal Global Quick Add (`≤5 Detik`)**:
   - Shortcut keyboard `N` atau `Cmd+K`.
   - Chip nominal cepat (`+10rb`, `+20rb`, `+50rb`, `+100rb`, `+500rb`, `+1 Jt`).
   - Grid icon kategori sekali klik, input autofocus, dan auto-close.
   - Menyimpan transaksi langsung ke Supabase `transactions` dan mengevaluasi alarm batas budget secara otomatis.

---

## 10. Panduan Menjalankan Skema SQL di Supabase

Untuk memastikan seluruh 6 tabel aktif di Supabase:
1. Buka dashboard Supabase di [https://supabase.com/dashboard/project/yyiqiihnozvbrwnljiqg/sql](https://supabase.com/dashboard/project/yyiqiihnozvbrwnljiqg/sql).
2. Buka menu **SQL Editor** -> **New Query**.
3. Buka file [`supabase_schema.sql`](file:///c:/xampp/htdocs/DompetKu/supabase_schema.sql) di workspace, salin seluruh kodenya dan klik **Run**.
4. Setelah dijalankan, seluruh tabel (`users`, `categories`, `transactions`, `budgets`, `budget_alerts`, `recurring_transactions`), Row Level Security, dan triggers evaluasi budget akan aktif seketika.
5. Di aplikasi DompetKu, klik tombol *"Sinkronkan Data Awal Mahasiswa"* di Settings atau Dashboard jika ingin mengisi data preset awal.



