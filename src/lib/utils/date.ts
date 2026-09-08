/**
 * Utility functions for Indonesian date formatting and WIB timezone
 */

const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const INDONESIAN_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

const INDONESIAN_DAYS = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

/**
 * Format date to DD/MM/YYYY
 */
export function formatDateIndo(dateInput: string | Date | number | null | undefined): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Format date with time and WIB: DD/MM/YYYY, HH:mm WIB
 */
export function formatDateTimeWIB(dateInput: string | Date | number | null | undefined): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year}, ${hours}:${minutes} WIB`;
}

/**
 * Format date in full Indonesian: e.g. "8 September 2026"
 */
export function formatDateFull(dateInput: string | Date | number | null | undefined): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';

  const day = date.getDate();
  const month = INDONESIAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Format month and year: e.g. "September 2026"
 */
export function formatMonthYear(month: number, year: number): string {
  const monthName = INDONESIAN_MONTHS[month - 1] || 'Bulan';
  return `${monthName} ${year}`;
}

/**
 * Relative date in Indonesian: "Hari ini", "Kemarin", or "DD/MM/YYYY"
 */
export function formatRelativeDate(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) return 'Hari ini';
  if (isYesterday) return 'Kemarin';

  return formatDateIndo(date);
}

/**
 * Get current date string in YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export { INDONESIAN_MONTHS, INDONESIAN_MONTHS_SHORT, INDONESIAN_DAYS };
