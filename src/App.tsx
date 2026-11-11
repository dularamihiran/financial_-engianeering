import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, X, AlertTriangle } from 'lucide-react';
import Header from './components/Header';
import ContractConfiguration from './components/ContractConfiguration';
import AccountSummary from './components/AccountSummary';
import DailyPriceSimulator from './components/DailyPriceSimulator';
import MarginCallAlert from './components/MarginCallAlert';
import BalanceChart from './components/BalanceChart';
import TransactionHistory from './components/TransactionHistory';
import type { ConfigErrors, ContractConfig, PositionType, SimulationState } from './types/simulation';
import {
  DEFAULT_CONFIG, addTradingDay, buildSampleScenario, createInitialState, currentStatus,
  depositRequiredMargin, validateConfig,
} from './utils/calculations';
import { downloadCSV } from './utils/csv';
import { formatLKR } from './utils/formatting';

const SIM_KEY = 'futures-margin-sim:state';
const DRAFT_KEY = 'futures-margin-sim:draft';

type Draft = Record<keyof Omit<ContractConfig, 'position'>, string> & { position: PositionType };

const toDraft = (c: ContractConfig): Draft => ({
  initialMargin: String(c.initialMargin), maintenanceMargin: String(c.maintenanceMargin),
  startingPrice: String(c.startingPrice), contractSize: String(c.contractSize),
  numContracts: String(c.numContracts), position: c.position,
});

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}

interface Toast { kind: 'success' | 'error' | 'warning'; text: string }
type Confirm = null | 'reset' | 'clear';

export default function App() {
  const [sim, setSim] = useState<SimulationState | null>(() => {
    const s = load<SimulationState>(SIM_KEY);
    return s && s.config && Array.isArray(s.transactions) ? s : null;
  });
  const [draft, setDraft] = useState<Draft>(() => load<Draft>(DRAFT_KEY) ?? toDraft(DEFAULT_CONFIG));
  const [errors, setErrors] = useState<ConfigErrors>({});
  const [toast, setToast] = useState<Toast | null>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);

  useEffect(() => {
    if (sim) localStorage.setItem(SIM_KEY, JSON.stringify(sim)); else localStorage.removeItem(SIM_KEY);
  }, [sim]);
  useEffect(() => { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); }, [draft]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const parseDraft = (): ContractConfig => ({
    initialMargin: draft.initialMargin.trim() === '' ? NaN : Number(draft.initialMargin),
    maintenanceMargin: draft.maintenanceMargin.trim() === '' ? NaN : Number(draft.maintenanceMargin),
    startingPrice: draft.startingPrice.trim() === '' ? NaN : Number(draft.startingPrice),
    contractSize: draft.contractSize.trim() === '' ? NaN : Number(draft.contractSize),
    numContracts: draft.numContracts.trim() === '' ? NaN : Number(draft.numContracts),
    position: draft.position,
  });

  const start = () => {
    const cfg = parseDraft();
    const errs = validateConfig(cfg);
    setErrors(errs);
    if (Object.keys(errs).length) { setToast({ kind: 'error', text: 'Please fix the highlighted inputs.' }); return; }
    setSim(createInitialState(cfg));
    setToast({ kind: 'success', text: 'Simulation started. Enter the first closing price below.' });
  };

  const loadSample = () => {
    const s = buildSampleScenario();
    setSim(s); setDraft(toDraft(s.config)); setErrors({});
    setToast({ kind: 'warning', text: 'Sample scenario loaded: a margin call occurs on Day 3.' });
  };

  const addDay = (price: number) => {
    if (!sim) return;
    const next = addTradingDay(sim, price);
    setSim(next);
    if (currentStatus(next) === 'Margin Call') setToast({ kind: 'error', text: `Margin call triggered on Day ${next.currentDay}!` });
    else if (currentStatus(next) === 'Insufficient Balance') setToast({ kind: 'error', text: 'Margin balance is depleted (insufficient balance).' });
    else setToast({ kind: 'success', text: `Day ${next.currentDay} recorded.` });
  };

  const deposit = () => {
    if (!sim) return;
    const before = sim.balance;
    const next = depositRequiredMargin(sim);
    setSim(next);
    setToast({ kind: 'success', text: `Deposited ${formatLKR(next.balance - before)}. Balance restored to ${formatLKR(next.balance)}.` });
  };

  const doReset = () => {
    setSim(null); setDraft(toDraft(DEFAULT_CONFIG)); setErrors({}); setConfirm(null);
    setToast({ kind: 'success', text: 'Simulation reset.' });
  };

  const doClear = () => {
    if (sim) setSim(createInitialState(sim.config));
    setConfirm(null);
    setToast({ kind: 'success', text: 'Transaction history cleared. Account restarted at the initial margin.' });
  };

  const toastStyle = { success: 'border-green-200 bg-green-50 text-success', error: 'border-red-200 bg-red-50 text-danger', warning: 'border-orange-200 bg-orange-50 text-warning' };
  const ToastIcon = toast?.kind === 'success' ? CheckCircle2 : toast?.kind === 'error' ? XCircle : AlertTriangle;

  return (
    <div className="min-h-screen">
      <Header onReset={() => setConfirm('reset')} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <p className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-xs text-navy">
          Educational simulation only — not a real trading platform. Futures are marked to market daily: gains are added to, and losses deducted from, the margin account.
        </p>
        <ContractConfiguration
          draft={draft} errors={errors} running={!!sim}
          onChange={(k, v) => { setDraft((d) => ({ ...d, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); }}
          onStart={start} onLoadSample={loadSample}
        />
        {sim ? (
          <>
            <AccountSummary sim={sim} />
            <DailyPriceSimulator sim={sim} onAddDay={addDay} />
            <MarginCallAlert sim={sim} onDeposit={deposit} />
            <BalanceChart sim={sim} />
            <TransactionHistory transactions={sim.transactions} onExport={() => downloadCSV(sim.transactions)} onClear={() => setConfirm('clear')} />
          </>
        ) : (
          <div className="card p-8 text-center text-muted">
            Configure a contract and click <b>Start Simulation</b>, or load the sample scenario to see the dashboard.
          </div>
        )}
      </main>
      <footer className="pb-8 text-center text-xs text-muted">IS4350 – Finance Engineering · Group 2 – Futures Contracts</footer>

      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${toastStyle[toast.kind]}`}>
          <ToastIcon size={18} className="mt-0.5 shrink-0" /><span>{toast.text}</span>
          <button onClick={() => setToast(null)} aria-label="Dismiss"><X size={16} /></button>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="card w-full max-w-sm p-5">
            <h3 className="text-lg font-semibold">{confirm === 'reset' ? 'Reset simulation?' : 'Clear history?'}</h3>
            <p className="mt-1 text-sm text-muted">
              {confirm === 'reset'
                ? 'This clears the current simulation and restores the default configuration.'
                : 'All trading days and deposits will be removed and the account restarts at the initial margin.'}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={confirm === 'reset' ? doReset : doClear}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
