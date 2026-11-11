import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CONFIG, addTradingDay, buildSampleScenario, calculateDailyPnL, createInitialState,
  currentStatus, depositRequiredMargin, getAccountStatus, isMarginCall, validateConfig,
} from './calculations';

describe('financial engine', () => {
  it('T1 long rising -> profit', () => {
    const s = addTradingDay(createInitialState(DEFAULT_CONFIG), 510);
    expect(s.transactions[1].pnl).toBe(1000);
    expect(s.balance).toBe(51000);
  });
  it('T2 long falling -> loss', () => {
    const s = addTradingDay(createInitialState(DEFAULT_CONFIG), 480);
    expect(s.transactions[1].pnl).toBe(-2000);
    expect(s.balance).toBe(48000);
  });
  it('T3 short falling -> profit', () => {
    const s = addTradingDay(createInitialState({ ...DEFAULT_CONFIG, position: 'Short' }), 480);
    expect(s.balance).toBe(52000);
  });
  it('T4 short rising -> loss', () => {
    expect(calculateDailyPnL('Short', 500, 520, 100, 1)).toBe(-2000);
    const s = addTradingDay(createInitialState({ ...DEFAULT_CONFIG, position: 'Short' }), 520);
    expect(s.balance).toBe(48000);
  });
  it('T5 equal to maintenance -> no margin call', () => {
    expect(isMarginCall(35000, 35000)).toBe(false);
    const s = addTradingDay(createInitialState(DEFAULT_CONFIG), 350);
    expect(s.balance).toBe(35000);
    expect(currentStatus(s)).toBe('Healthy');
  });
  it('T6 below maintenance -> margin call', () => {
    expect(currentStatus(buildSampleScenario())).toBe('Margin Call');
    expect(getAccountStatus(-5, 35000)).toBe('Insufficient Balance');
  });
  it('T7 deposit restores initial margin', () => {
    const s = depositRequiredMargin(buildSampleScenario());
    expect(s.balance).toBe(50000);
    expect(currentStatus(s)).toBe('Healthy');
    const last = s.transactions[s.transactions.length - 1];
    expect(last.type).toBe('Margin Deposit');
    expect(last.depositAmount).toBe(16000);
  });
  it('T8 multiple days cumulative', () => {
    const s = buildSampleScenario();
    expect(s.transactions.map((t) => t.balance)).toEqual([50000, 48000, 42000, 34000]);
    expect(s.transactions.map((t) => t.status)).toEqual(['Healthy', 'Healthy', 'Healthy', 'Margin Call']);
  });
  it('validation', () => {
    expect(validateConfig(DEFAULT_CONFIG)).toEqual({});
    expect(validateConfig({ ...DEFAULT_CONFIG, maintenanceMargin: 60000 }).maintenanceMargin).toBeDefined();
    expect(validateConfig({ ...DEFAULT_CONFIG, contractSize: 0 }).contractSize).toBeDefined();
  });
});
