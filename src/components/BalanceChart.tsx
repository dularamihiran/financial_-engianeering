import { useMemo } from 'react';
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import type { SimulationState } from '../types/simulation';
import { formatLKR, formatNumber } from '../utils/formatting';

export default function BalanceChart({ sim }: { sim: SimulationState }) {
  const data = useMemo(
    () => sim.transactions.map((t, i) => ({
      label: t.type === 'Initial Deposit' ? 'Initial' : t.type === 'Margin Deposit' ? `Day ${t.day} (Deposit)` : `Day ${t.day}`,
      step: i,
      balance: t.balance,
      initial: sim.config.initialMargin,
      maintenance: sim.config.maintenanceMargin,
    })),
    [sim],
  );
  return (
    <section className="card p-5">
      <h2 className="text-lg font-semibold">Margin Account Balance History</h2>
      <p className="mb-3 text-sm text-muted">Balance after each settlement or deposit, compared with the initial and maintenance margin levels.</p>
      <div className="h-72 w-full sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748B' }} />
            <YAxis tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(v: number) => formatNumber(v)} width={70} domain={['auto', 'auto']} />
            <Tooltip formatter={(v: number, n: string) => [formatLKR(v), n]} />
            <Legend />
            <Line type="monotone" dataKey="balance" name="Margin Balance" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="initial" name="Initial Margin" stroke="#16A34A" strokeDasharray="6 4" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="maintenance" name="Maintenance Margin" stroke="#DC2626" strokeDasharray="6 4" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
