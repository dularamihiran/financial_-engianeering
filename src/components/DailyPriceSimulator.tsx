import { useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import type { SimulationState } from '../types/simulation';
import { calculateDailyPnL, calculateNewBalance, validatePrice } from '../utils/calculations';
import { formatLKR, formatSignedLKR, formatNumber, pnlClass } from '../utils/formatting';

interface Props { sim: SimulationState; onAddDay: (price: number) => void }

export default function DailyPriceSimulator({ sim, onAddDay }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { config } = sim;

  const parsed = value.trim() === '' ? NaN : Number(value);
  const valid = validatePrice(parsed) === null;
  const previewPnl = valid ? calculateDailyPnL(config.position, sim.currentPrice, parsed, config.contractSize, config.numContracts) : null;
  const previewBalance = previewPnl !== null ? calculateNewBalance(sim.balance, previewPnl) : null;

  const submit = () => {
    const err = validatePrice(parsed);
    if (err) { setError(value.trim() === '' ? 'Please enter today\'s closing price.' : err); return; }
    setError(null);
    onAddDay(parsed);
    setValue('');
  };

  return (
    <section className="card p-5">
      <h2 className="text-lg font-semibold">Daily Market Price Simulation</h2>
      <p className="mb-4 text-sm text-muted">Enter each day's closing price. Profit/loss is settled against the previous close and added to the running balance.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-muted">Current Trading Day</p>
          <p className="text-xl font-bold">Day {sim.currentDay + 1}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-muted">Previous Closing Price</p>
          <p className="text-xl font-bold">LKR {formatNumber(sim.currentPrice)}</p>
        </div>
        <div>
          <label htmlFor="closing" className="text-xs text-muted">Today's Closing Price (LKR)</label>
          <input
            id="closing" type="number" min="0" step="any" placeholder="e.g. 480"
            className={`input mt-1 ${error ? 'input-error' : ''}`} value={value}
            onChange={(e) => { setValue(e.target.value); setError(null); }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-muted">Calculated Daily P/L</p>
          <p className={`text-xl font-bold ${pnlClass(previewPnl)}`}>{previewPnl === null ? '—' : formatSignedLKR(previewPnl)}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-muted">Updated Margin Balance</p>
          <p className="text-xl font-bold">{previewBalance === null ? formatLKR(sim.balance) : formatLKR(previewBalance)}</p>
        </div>
      </div>
      {error && <p className="mt-2 text-sm font-medium text-danger" role="alert">{error}</p>}
      <button className="btn-primary mt-4" onClick={submit}><CalendarPlus size={16} /> Add Trading Day</button>
    </section>
  );
}
