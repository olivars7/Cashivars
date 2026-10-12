export const KEYS = {
  TRANSACTIONS: 'cashivars_transactions_v2',
  SAVINGS: 'cashivars_savings',
  DEBTS: 'cashivars_debts',
  CREDIT_CARDS: 'cashivars_credit_cards',
  CATEGORIES: 'cashivars_categories',
} as const;

export function storageGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function storageSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`[storage] No se pudo guardar la clave "${key}"`);
  }
}

export function storageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // silencioso
  }
}

export function storageClear(): void {
  try {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    // limpiar keys de versiones anteriores
    localStorage.removeItem('cashivars_transactions');
  } catch {
    // silencioso
  }
}
