/**
 * Utility functions for Rupiah (IDR) currency formatting
 */

export function formatRupiah(
  amount: number | null | undefined,
  options: {
    withSymbol?: boolean;
    withDecimals?: boolean;
    signDisplay?: boolean;
  } = {}
): string {
  const { withSymbol = true, withDecimals = false, signDisplay = false } = options;
  const num = amount ?? 0;
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  }).format(absNum);

  const prefix = withSymbol ? 'Rp ' : '';
  const sign = isNegative ? '- ' : signDisplay && num > 0 ? '+ ' : '';

  return `${sign}${prefix}${formatted}`;
}

export function formatRupiahCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000).toFixed(1).replace('.0', '')} M`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp ${(abs / 1_000_000).toFixed(1).replace('.0', '')} Jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp ${(abs / 1_000).toFixed(0)} Rb`;
  }
  return `${sign}Rp ${abs}`;
}

export function parseRupiahInput(input: string): number {
  const sanitized = input.replace(/[^0-9]/g, '');
  return sanitized ? parseInt(sanitized, 10) : 0;
}
