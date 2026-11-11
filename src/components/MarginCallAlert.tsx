import { AlertTriangle, Banknote } from 'lucide-react';
import type { SimulationState } from '../types/simulation';
import { calculateRequiredDeposit, isMarginCall } from '../utils/calculations';
import { formatLKR } from '../utils/formatting';

interface Props { sim: SimulationState; onDeposit: () => void }

export default function MarginCallAlert({ sim, onDeposit }: Props) {
  if (!isMarginCall(sim.balance, sim.config.maintenanceMargin)) return null;
  const required = calculateRequiredDeposit(sim.config.initialMargin, sim.balance);
  const rows = [
    ['Current Margin Balance', formatLKR(sim.balance)],
    ['Maintenance Margin', formatLKR(sim.config.maintenanceMargin)],
    ['Initial Margin', formatLKR(sim.config.initialMargin)],
    ['Required Additional Deposit', formatLKR(required)],
  ];
  return (
    <section className="rounded-2xl border-2 border-danger bg-red-50 p-5 shadow-sm" role="alert">
      <div className="flex items-center gap-2 text-danger">
        <AlertTriangle size={26} />
        <h2 className="text-xl font-bold">Margin Call Triggered!</h2>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map(([k, v], i) => (
          <div key={k} className={`rounded-xl bg-white p-3 ${i === 3 ? 'ring-2 ring-danger' : ''}`}>
            <p className="text-xs text-muted">{k}</p>
            <p className="text-lg font-bold text-danger">{v}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-red-900">
        Your margin account balance has fallen below the maintenance margin requirement. Please deposit additional funds to restore your account to the initial margin level.
      </p>
      <button className="btn-danger mt-4" onClick={onDeposit}><Banknote size={16} /> Deposit Required Margin</button>
    </section>
  );
}
