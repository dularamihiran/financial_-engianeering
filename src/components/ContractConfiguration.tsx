import { Play, FlaskConical } from 'lucide-react';
import type { ConfigErrors, ContractConfig, PositionType } from '../types/simulation';

interface Props {
  draft: Record<keyof Omit<ContractConfig, 'position'>, string> & { position: PositionType };
  errors: ConfigErrors;
  running: boolean;
  onChange: (key: keyof ContractConfig, value: string) => void;
  onStart: () => void;
  onLoadSample: () => void;
}

const FIELDS: { key: Exclude<keyof ContractConfig, 'position'>; label: string; desc: string; step?: string }[] = [
  { key: 'initialMargin', label: 'Initial Margin (LKR)', desc: 'Funds the trader deposits to open the position.' },
  { key: 'maintenanceMargin', label: 'Maintenance Margin (LKR)', desc: 'Minimum balance allowed before a margin call is issued.' },
  { key: 'startingPrice', label: 'Starting Futures Price (LKR)', desc: 'Futures price at which the position is opened.' },
  { key: 'contractSize', label: 'Contract Size', desc: 'Units of the underlying asset in one contract.' },
  { key: 'numContracts', label: 'Number of Contracts', desc: 'How many contracts the trader holds (whole number).', step: '1' },
];

export default function ContractConfiguration({ draft, errors, running, onChange, onStart, onLoadSample }: Props) {
  return (
    <section className="card p-5">
      <h2 className="text-lg font-semibold">Futures Contract Configuration</h2>
      <p className="mb-4 text-sm text-muted">Enter contract details, then start a new simulation.{running && ' Starting again replaces the current simulation.'}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={f.key} className="mb-1 block text-sm font-medium">{f.label}</label>
            <input
              id={f.key} type="number" inputMode="decimal" min="0" step={f.step ?? 'any'}
              className={`input ${errors[f.key] ? 'input-error' : ''}`}
              value={draft[f.key]} onChange={(e) => onChange(f.key, e.target.value)}
            />
            {errors[f.key]
              ? <p className="mt-1 text-xs font-medium text-danger" role="alert">{errors[f.key]}</p>
              : <p className="mt-1 text-xs text-muted">{f.desc}</p>}
          </div>
        ))}
        <div>
          <span className="mb-1 block text-sm font-medium">Position Type</span>
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-300 bg-slate-100 p-1">
            {(['Long', 'Short'] as PositionType[]).map((p) => (
              <button
                key={p} type="button" onClick={() => onChange('position', p)}
                className={`rounded-lg py-1.5 text-sm font-semibold transition-colors ${draft.position === p ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-ink'}`}
              >{p}</button>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted">Long profits when price rises; Short profits when price falls.</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button className="btn-primary" onClick={onStart}><Play size={16} /> Start Simulation</button>
        <button className="btn-secondary" onClick={onLoadSample}><FlaskConical size={16} /> Load Sample Scenario</button>
      </div>
    </section>
  );
}
