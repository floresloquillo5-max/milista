import { AppState } from '../state';
import { LOCAL_STORAGE_KEYS } from '../config/constants';
import { loadLists, saveLists, loadFinanceData, saveFinanceData, clearAllData } from '../utils/storage';

beforeEach(() => {
  localStorage.clear();
  AppState.state.marketLists = {};
  AppState.state.currentListId = 'default';
  AppState.state.transactions = [];
  AppState.state.debts = [];
  AppState.state.savingsGoalData = null;
});

describe('loadLists', () => {
  it('creates a default list when no data is saved', () => {
    loadLists();
    expect(AppState.state.marketLists['default']).toBeDefined();
    expect(AppState.state.marketLists['default'].name).toBe('Mi Lista');
    expect(AppState.state.currentListId).toBe('default');
  });

  it('restores saved lists from localStorage', () => {
    const saved = {
      default: { id: 'default', name: 'Mi Lista', products: [{ id: 1, name: 'Test', qty: 1, unit: '', price: 10, checked: true }], createdAt: '2024-01-01' },
      extra: { id: 'extra', name: 'Extra', products: [], createdAt: '2024-01-01' },
    };
    localStorage.setItem(LOCAL_STORAGE_KEYS.marketLists, JSON.stringify(saved));
    localStorage.setItem(LOCAL_STORAGE_KEYS.currentListId, '"extra"');
    loadLists();
    expect(AppState.state.marketLists['extra']).toBeDefined();
    expect(AppState.state.marketLists['extra'].name).toBe('Extra');
    expect(AppState.state.currentListId).toBe('extra');
  });

  it('preserves old-format products by migrating to default list', () => {
    const oldProducts = [{ id: 1, name: 'Legacy', qty: 2, unit: '', price: 5, checked: false }];
    localStorage.setItem(LOCAL_STORAGE_KEYS.oldMarketProducts, JSON.stringify(oldProducts));
    loadLists();
    expect(AppState.state.marketLists['default']).toBeDefined();
    expect(AppState.state.marketLists['default'].products).toEqual(oldProducts);
  });
});

describe('saveLists', () => {
  it('persists market lists to localStorage', () => {
    AppState.state.marketLists = {
      default: { id: 'default', name: 'Mi Lista', products: [], createdAt: '2024-01-01' },
    };
    saveLists();
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.marketLists);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.default.name).toBe('Mi Lista');
  });
});

describe('loadFinanceData', () => {
  it('restores transactions, savings goal, and debts', () => {
    const tx = [{ id: 1, date: '2024-01-01', type: 'income', category: 'salario', amountUSD: 100, amountBS: 0, currency: 'USD', description: 'Pay' }];
    const goal = { amountUSD: 500, description: 'Viaje', currency: 'USD' as const, originalAmount: 500, contributions: [] };
    const debts = [{ id: 1, description: 'Loan', totalAmount: 200, currency: 'USD' as const, category: 'deudas', installments: 2, paidAmount: 0, date: '2024-01-01', payments: [] }];
    localStorage.setItem(LOCAL_STORAGE_KEYS.transactions, JSON.stringify(tx));
    localStorage.setItem(LOCAL_STORAGE_KEYS.savingsGoal, JSON.stringify(goal));
    localStorage.setItem(LOCAL_STORAGE_KEYS.debts, JSON.stringify(debts));
    loadFinanceData();
    expect(AppState.state.transactions).toHaveLength(1);
    expect(AppState.state.savingsGoalData?.amountUSD).toBe(500);
    expect(AppState.state.debts).toHaveLength(1);
  });

  it('handles legacy numeric savings goal', () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.savingsGoal, '300');
    loadFinanceData();
    expect(AppState.state.savingsGoalData?.amountUSD).toBe(300);
    expect(AppState.state.savingsGoalData?.contributions).toEqual([]);
  });
});

describe('saveFinanceData', () => {
  it('persists finance data to localStorage', () => {
    AppState.state.transactions = [{ id: 1, date: '2024-06-01', type: 'expense', category: 'comida', amountUSD: 50, amountBS: 0, currency: 'USD', description: 'Cena' }];
    AppState.state.savingsGoalData = { amountUSD: 1000, description: 'Fondo', currency: 'USD', originalAmount: 1000, contributions: [] };
    AppState.state.debts = [];
    saveFinanceData();
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.transactions);
    expect(raw).not.toBeNull();
    const txs = JSON.parse(raw!);
    expect(txs).toHaveLength(1);
    expect(txs[0].description).toBe('Cena');
  });
});

describe('clearAllData', () => {
  it('removes all app data from localStorage', () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.marketLists, '{}');
    localStorage.setItem(LOCAL_STORAGE_KEYS.transactions, '[]');
    clearAllData();
    Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
      expect(localStorage.getItem(key)).toBeNull();
    });
  });
});
