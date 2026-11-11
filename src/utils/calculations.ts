import type {
  AccountStatus, ConfigErrors, ContractConfig, SimulationState, Transaction,
} from '../types/simulation';

/** Round to 2 decimal places (avoids floating point drift). */
export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

export const DEFAULT_CONFIG: ContractConfig = {
  initialMargin: 50000,
  maintenanceMargin: 35000,
  startingPrice: 500,
  contractSize: 100,
  numContracts: 1,
  position: 'Long',
};

export const SAMPLE_PRICES = [480, 420, 340];

/** Daily P/L: Long = (cur - prev) x size x n ; Short = (prev - cur) x size x n */
export function calculateDailyPnL(
  position: ContractConfig['position'], previousPrice: number, currentPrice: number,
  contractSize: number, numContracts: number,
): number {
  const diff = position === 'Long' ? currentPrice - previousPrice : previousPrice - currentPrice;
  return round2(diff * contractSize * numContracts);
}

/** New Balance = Previous Balance + Daily P/L */
export const calculateNewBalance = (previous: number, pnl: number): number => round2(previous + pnl);

/** Margin call only when balance is STRICTLY below maintenance margin. */
export const isMarginCall = (balance: number, maintenance: number): boolean => balance < maintenance;

/** Required Deposit = Initial Margin - Current Balance (never negative). */
export const calculateRequiredDeposit = (initial: number, balance: number): number =>
  round2(Math.max(0, initial - balance));

export function getAccountStatus(balance: number, maintenance: number): AccountStatus {
  if (balance <= 0) return 'Insufficient Balance';
  if (isMarginCall(balance, maintenance)) return 'Margin Call';
  return 'Healthy';
}

export function validateConfig(c: ContractConfig): ConfigErrors {
  const e: ConfigErrors = {};
  const bad = (v: number) => typeof v !== 'number' || !Number.isFinite(v);
  if (bad(c.initialMargin) || c.initialMargin <= 0) e.initialMargin = 'Initial margin must be a positive number.';
  if (bad(c.maintenanceMargin) || c.maintenanceMargin <= 0) e.maintenanceMargin = 'Maintenance margin must be a positive number.';
  else if (!bad(c.initialMargin) && c.maintenanceMargin > c.initialMargin)
    e.maintenanceMargin = 'Maintenance margin must not exceed initial margin.';
  if (bad(c.startingPrice) || c.startingPrice <= 0) e.startingPrice = 'Starting futures price must be positive.';
  if (bad(c.contractSize) || c.contractSize <= 0) e.contractSize = 'Contract size must be greater than zero.';
  if (bad(c.numContracts) || c.numContracts <= 0) e.numContracts = 'Number of contracts must be greater than zero.';
  else if (!Number.isInteger(c.numContracts)) e.numContracts = 'Number of contracts must be a whole number.';
  return e;
}

let counter = 0;
const newId = () => `${Date.now()}-${counter++}`;

export function createInitialState(config: ContractConfig): SimulationState {
  const tx: Transaction = {
    id: newId(), day: 0, previousPrice: config.startingPrice, currentPrice: null, pnl: null,
    balance: config.initialMargin, type: 'Initial Deposit',
    status: getAccountStatus(config.initialMargin, config.maintenanceMargin),
  };
  return {
    config, currentDay: 0, currentPrice: config.startingPrice,
    balance: config.initialMargin, transactions: [tx],
  };
}

export function validatePrice(price: number): string | null {
  if (!Number.isFinite(price)) return 'Please enter a valid closing price.';
  if (price <= 0) return 'Closing price must be greater than zero.';
  return null;
}

/** Settle a new trading day using previous price and previous ending balance. */
export function addTradingDay(state: SimulationState, price: number): SimulationState {
  const { config } = state;
  const pnl = calculateDailyPnL(config.position, state.currentPrice, price, config.contractSize, config.numContracts);
  const balance = calculateNewBalance(state.balance, pnl);
  const day = state.currentDay + 1;
  const tx: Transaction = {
    id: newId(), day, previousPrice: state.currentPrice, currentPrice: price, pnl, balance,
    type: 'Daily Settlement', status: getAccountStatus(balance, config.maintenanceMargin),
  };
  return { ...state, currentDay: day, currentPrice: price, balance, transactions: [...state.transactions, tx] };
}

/** Deposit the required amount to restore the account to the initial margin. */
export function depositRequiredMargin(state: SimulationState): SimulationState {
  const amount = calculateRequiredDeposit(state.config.initialMargin, state.balance);
  if (amount <= 0) return state;
  const balance = calculateNewBalance(state.balance, amount);
  const tx: Transaction = {
    id: newId(), day: state.currentDay, previousPrice: state.currentPrice, currentPrice: state.currentPrice,
    pnl: null, depositAmount: amount, balance, type: 'Margin Deposit',
    status: getAccountStatus(balance, state.config.maintenanceMargin),
  };
  return { ...state, balance, transactions: [...state.transactions, tx] };
}

export function buildSampleScenario(): SimulationState {
  return SAMPLE_PRICES.reduce(addTradingDay, createInitialState({ ...DEFAULT_CONFIG }));
}

export const currentStatus = (s: SimulationState): AccountStatus =>
  getAccountStatus(s.balance, s.config.maintenanceMargin);
