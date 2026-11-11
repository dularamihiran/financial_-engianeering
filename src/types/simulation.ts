export type PositionType = 'Long' | 'Short';
export type AccountStatus = 'Healthy' | 'Margin Call' | 'Insufficient Balance';
export type TransactionType = 'Initial Deposit' | 'Daily Settlement' | 'Margin Deposit';

export interface ContractConfig {
  initialMargin: number;
  maintenanceMargin: number;
  startingPrice: number;
  contractSize: number;
  numContracts: number;
  position: PositionType;
}

export interface Transaction {
  id: string;
  day: number;
  previousPrice: number | null;
  currentPrice: number | null;
  pnl: number | null;
  /** For margin deposits: amount deposited */
  depositAmount?: number;
  balance: number;
  type: TransactionType;
  status: AccountStatus;
}

export interface SimulationState {
  config: ContractConfig;
  currentDay: number;
  currentPrice: number;
  balance: number;
  transactions: Transaction[];
}

export type ConfigErrors = Partial<Record<keyof ContractConfig, string>>;
