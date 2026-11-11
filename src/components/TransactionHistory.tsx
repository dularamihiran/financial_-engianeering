import { Download, Trash2 } from 'lucide-react';
import type { Transaction } from '../types/simulation';
import { formatNumber, formatSignedLKR, pnlClass } from '../utils/formatting';
import StatusBadge from './StatusBadge';

interface Props { transactions: Transaction[]; onExport: () => void; onClear: () => void }

export const dayLabel = (t: Transaction) => (t.type === 'Initial Deposit' ? 'Initial' : `Day ${t.day}`);

export default function TransactionHistory({ transactions, onExport, onClear }: Props) {
  const rows = [...transactions].reverse();
  const num = (n: number | null) => (n === null ? '-' : formatNumber(n));
  return (
    <section className="card p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Daily Trading Transaction History</h2>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={onExport}><Download size={16} /> Export CSV</button>
          <button className="btn-secondary text-danger" onClick={onClear}><Trash2 size={16} /> Clear History</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase text-muted">
              {['Trading Day', 'Previous Closing Price', 'Current Closing Price', 'Daily Profit/Loss', 'Margin Balance', 'Transaction Type', 'Account Status'].map((h, i) => (
                <th key={h} className={`px-3 py-2 font-semibold ${i >= 1 && i <= 4 ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => {
              const amount = t.type === 'Margin Deposit' ? t.depositAmount ?? 0 : t.pnl;
              return (
                <tr key={t.id} className={`border-b border-slate-100 ${t.type === 'Margin Deposit' ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-3 py-2 font-medium">{dayLabel(t)}</td>
                  <td className="px-3 py-2 text-right">{num(t.type === 'Margin Deposit' ? null : t.previousPrice)}</td>
                  <td className="px-3 py-2 text-right">{num(t.type === 'Margin Deposit' ? null : t.currentPrice)}</td>
                  <td className={`px-3 py-2 text-right font-semibold ${t.type === 'Margin Deposit' ? 'text-primary' : pnlClass(t.pnl)}`}>
                    {amount === null ? '-' : t.type === 'Margin Deposit' ? `+${formatNumber(amount)} (deposit)` : formatSignedLKR(amount).replace('LKR ', '')}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold">{formatNumber(t.balance)}</td>
                  <td className="px-3 py-2">{t.type}</td>
                  <td className="px-3 py-2"><StatusBadge status={t.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
