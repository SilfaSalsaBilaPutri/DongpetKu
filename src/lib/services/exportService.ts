import { Transaction } from '@/types/database';
import { formatDateIndo } from '@/lib/utils/date';
import { formatRupiah } from '@/lib/utils/currency';

/**
 * Export transactions array to CSV and trigger browser download
 */
export function exportTransactionsToCSV(
  transactions: Transaction[],
  fileNamePrefix: string = 'DompetKu_Laporan_Transaksi'
) {
  if (!transactions || transactions.length === 0) {
    alert('Tidak ada data transaksi untuk diekspor.');
    return;
  }

  const headers = [
    'No',
    'ID Transaksi',
    'Tanggal (DD/MM/YYYY)',
    'Jenis Transaksi',
    'Kategori',
    'Nominal Angka',
    'Format Rupiah',
    'Deskripsi / Catatan'
  ];

  const rows = transactions.map((tx, index) => {
    const typeLabel = tx.transaction_type === 'income' ? 'Pemasukan' : 'Pengeluaran';
    const categoryName = tx.category?.name || 'Lainnya';
    const dateFormatted = formatDateIndo(tx.transaction_date);
    const amountNum = Number(tx.amount);
    const rupiahFormatted = formatRupiah(amountNum);
    const description = `"${(tx.description || '').replace(/"/g, '""')}"`;

    return [
      index + 1,
      tx.id,
      dateFormatted,
      typeLabel,
      `"${categoryName}"`,
      amountNum,
      `"${rupiahFormatted}"`,
      description,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const fileName = `${fileNamePrefix}_${dateStr}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
