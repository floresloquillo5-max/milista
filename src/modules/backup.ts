import { AppState } from '../state';
import { saveAllBackupData, loadLists, loadFinanceData } from '../utils/storage';
import { showToast, downloadFile } from '../utils/dom';
import type { BackupData } from '../types';

export function backupAllData(): void {
  const data: BackupData = {
    version: '3.0',
    marketLists: AppState.state.marketLists,
    currentListId: AppState.state.currentListId,
    transactions: AppState.state.transactions,
    savingsGoal: AppState.state.savingsGoalData,
    dollarRate: AppState.state.settings.dollarRate,
    theme: AppState.state.settings.theme,
    notificationPrefs: null,
    debts: AppState.state.debts,
  };

  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `backup_listamigo_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  showToast('💾 Backup descargado');
}

export function restoreAllData(): void {
  const input = document.getElementById('restoreFileInput') as HTMLInputElement | null;
  if (input) input.click();
}

export function handleRestoreFile(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  input.value = '';

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string) as BackupData;
      const validation = validateBackupData(data);
      if (!validation.valid) {
        showToast(`❌ Backup inválido: ${validation.error}`);
        return;
      }
      applyBackupData(data);
      showToast('✅ Datos restaurados correctamente');
      window.location.reload();
    } catch {
      showToast('❌ Error al leer el archivo');
    }
  };
  reader.readAsText(file);
}

function validateBackupData(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') return { valid: false, error: 'No es un objeto' };
  const d = data as Record<string, unknown>;

  if (typeof d.marketLists !== 'object' || d.marketLists === null) return { valid: false, error: 'marketLists inválido' };
  if (typeof d.currentListId !== 'string') return { valid: false, error: 'currentListId inválido' };
  if (!Array.isArray(d.transactions)) return { valid: false, error: 'transactions inválido' };
  if (d.savingsGoal !== null && typeof d.savingsGoal !== 'object') return { valid: false, error: 'savingsGoal inválido' };
  if (typeof d.dollarRate !== 'number') return { valid: false, error: 'dollarRate inválido' };
  if (!Array.isArray(d.debts)) return { valid: false, error: 'debts inválido' };

  for (const list of Object.values(d.marketLists as Record<string, unknown>)) {
    const l = list as Record<string, unknown>;
    if (typeof l.id !== 'string' || typeof l.name !== 'string' || !Array.isArray(l.products)) {
      return { valid: false, error: 'Estructura de lista inválida' };
    }
  }

  for (const tx of d.transactions as unknown[]) {
    const t = tx as Record<string, unknown>;
    if (typeof t.id !== 'number' || typeof t.date !== 'string' || typeof t.amountUSD !== 'number') {
      return { valid: false, error: 'Estructura de transacción inválida' };
    }
  }

  return { valid: true };
}

function applyBackupData(data: BackupData): void {
  AppState.state.marketLists = data.marketLists;
  AppState.state.currentListId = data.currentListId;
  AppState.state.transactions = data.transactions;
  AppState.state.savingsGoalData = data.savingsGoal;
  AppState.state.debts = data.debts || [];
  AppState.state.settings.dollarRate = data.dollarRate;
  AppState.state.settings.theme = data.theme || 'dark';
  AppState.state.debts = data.debts || [];

  saveAllBackupData(data);
}
