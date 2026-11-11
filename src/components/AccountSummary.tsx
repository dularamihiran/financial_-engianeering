import { Wallet, Landmark, TrendingUp, ShieldCheck } from 'lucide-react';
import type { SimulationState } from '../types/simulation';
import { currentStatus } from '../utils/calculations';
import { formatLKR, formatSignedLKR, pnlClass } from '../utils/formatting';
import StatusBadge from './StatusBadge';

export default function AccountSummary({ sim }: { sim: SimulationState }) {
  const status = currentStatus(sim);
  const last = sim.transactions[sim.transactions.length - 1];
  const lastSettlement = [...sim.transactions].reverse().find((t) => t.type === 'Daily Settlement');
  const pnl = lastSettlement?.pnl ?? 0;
  void last;
  const pct = Math.max(0, Math.min(100, (sim.balance / sim.config.initialMargin) * 100));
  const barColor = status === 'Healthy' ? 'bg-success' : 'bg-danger';
  const statusColor = status === 'Healthy' ? 'text-success' : 'text-danger';

  const Card = ({ icon, title, tip, children }: { icon: React.ReactNode; title: string; tip: string; children: React.ReactNode }) => (
    <div className="card p-4" title={tip}>
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted">{icon}{title}</div>
      {children}
    </div>
  );

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Account Summary</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card icon={<Landmark size={16} />} title="Initial Margin" tip="Original margin deposited by the trader.">
          <p className="text-2xl font-bold">{formatLKR(sim.config.initialMargin)}</p>
          <p className="text-xs text-muted">{sim.config.position} · {sim.config.numContracts} × {sim.config.contractSize}</p>
        </Card>
        <Card icon={<Wallet size={16} />} title="Current Margin Balance" tip="Latest balance in the margin account.">
          <p className={`text-2xl font-bold ${status === 'Healthy' ? '' : 'text-danger'}`}>{formatLKR(sim.balance)}</p>
          <p className="text-xs text-muted">Maintenance: {formatLKR(sim.config.maintenanceMargin)}</p>
        </Card>
        <Card icon={<TrendingUp size={16} />} title="Daily Profit / Loss" tip="Gain or loss from the most recent trading day.">
          <p className={`text-2xl font-bold ${pnlClass(pnl)}`}>{formatSignedLKR(pnl)}</p>
          <p className="text-xs text-muted">{lastSettlement ? `Day ${lastSettlement.day}` : 'No trading days yet'}</p>
        </Card>
        <Card icon={<ShieldCheck size={16} />} title="Margin Account Status" tip="Healthy, Margin Call, or Insufficient Balance.">
          <p className={`text-2xl font-bold ${statusColor}`}>{status}</p>
          <div className="mt-1"><StatusBadge status={status} /></div>
        </Card>
      </div>
      <div className="card mt-4 p-4">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium">Balance relative to initial margin</span>
          <span className="font-semibold">{((sim.balance / sim.config.initialMargin) * 100).toFixed(1)}%</span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
          <div className="absolute top-0 h-full w-0.5 bg-warning" style={{ left: `${Math.min(100, (sim.config.maintenanceMargin / sim.config.initialMargin) * 100)}%` }} title="Maintenance margin" />
        </div>
        <p className="mt-1 text-xs text-muted">Orange marker = maintenance margin level.</p>
      </div>
    </section>
  );
}
