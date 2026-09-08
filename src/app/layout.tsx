import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/context/AppContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DompetKu — Financial Command Center & Budget Alarm',
  description:
    'Aplikasi pencatat pengeluaran & alarm budget modern untuk mahasiswa. Input transaksi kilat ≤5 detik, pantau batas keuangan per kategori, dan analisis pengeluaran.',
  keywords: [
    'expense tracker',
    'budget alarm',
    'fintech mahasiswa',
    'dompetku',
    'pengatur keuangan mahasiswa',
    'catat pengeluaran',
  ],
};

export const viewport: Viewport = {
  themeColor: '#0B1020',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} dark`}>
      <body className="bg-background text-foreground antialiased min-h-screen">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
