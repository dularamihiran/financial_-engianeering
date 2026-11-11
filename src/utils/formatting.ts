export const formatNumber = (n: number): string =>
  n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export const formatLKR = (n: number): string => `${n < 0 ? '-' : ''}LKR ${formatNumber(Math.abs(n))}`;

export const formatSignedLKR = (n: number): string =>
  n > 0 ? `+LKR ${formatNumber(n)}` : formatLKR(n);

export const pnlClass = (n: number | null): string =>
  n === null || n === 0 ? 'text-muted' : n > 0 ? 'text-success' : 'text-danger';
