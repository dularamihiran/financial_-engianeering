import { CandlestickChart, RotateCcw } from 'lucide-react';

interface Props { onReset: () => void }

export default function Header({ onReset }: Props) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary p-2.5 text-white"><CandlestickChart size={24} /></div>
          <div>
            <h1 className="text-xl font-bold text-navy sm:text-2xl">Futures Margin Simulator</h1>
            <p className="text-sm text-muted">Interactive Futures Contract Risk &amp; Margin Management</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" /> Simulation Mode
          </span>
          <button className="btn-secondary" onClick={onReset}><RotateCcw size={16} /> Reset Simulation</button>
        </div>
      </div>
    </header>
  );
}
