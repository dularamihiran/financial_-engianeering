import type { Transaction } from '../types/simulation';

export function transactionsToCSV(transactions: Transaction[]): string {
  const header = ['Trading Day', 'Previous Closing Price', 'Current Closing Price', 'Daily Profit/Loss', 'Margin Balance', 'Transaction Type', 'Account Status'];
  const cell = (v: number | null | undefined) => (v === null || v === undefined ? '-' : String(v));
  const rows = transactions.map((t) => [
    t.type === 'Initial Deposit' ? 'Initial' : `Day ${t.day}`,
    cell(t.type === 'Margin Deposit' ? null : t.previousPrice),
    cell(t.type === 'Margin Deposit' ? null : t.currentPrice),
    cell(t.type === 'Margin Deposit' ? t.depositAmount : t.pnl),
    String(t.balance), t.type, t.status,
  ]);
  return [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\r\n');
}

export function downloadCSV(transactions: Transaction[]): void {
  const blob = new Blob([transactionsToCSV(transactions)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'futures-margin-history.csv';
  a.click();
  URL.revokeObjectURL(url);
}
