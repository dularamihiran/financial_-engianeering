import type { AccountStatus } from '../types/simulation';

const STYLES: Record<AccountStatus, string> = {
  Healthy: 'bg-green-50 text-success border-green-200',
  'Margin Call': 'bg-red-50 text-danger border-red-200',
  'Insufficient Balance': 'bg-orange-50 text-warning border-orange-200',
};

export default function StatusBadge({ status }: { status: AccountStatus }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}>
      {status}
    </span>
  );
}
