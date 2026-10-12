import { useState, useEffect, useMemo } from 'react';
import {
  Transaction,
  SavingsGoal,
  Debt,
  CreditCard,
  transactions as seedTransactions,
  savingsGoals as seedSavings,
  debts as seedDebts,
  creditCards as seedCreditCards,
} from '../mocks/mockData';
import { KEYS, storageGet, storageSet, storageClear } from '../services/storage';

export const DEFAULT_CATEGORIES: string[] = [
  'Alimentación',
  'Transporte',
  'Hogar',
  'Salud',
  'Entretenimiento',
  'Trabajo',
  'Servicios',
  'Ropa',
  'Educación',
  'Personal',
  'Ahorros',
  'Extra',
];

function uid(): string {
  return crypto.randomUUID();
}

export function useStoreState() {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    storageGet(KEYS.TRANSACTIONS, seedTransactions),
  );
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() =>
    storageGet(KEYS.SAVINGS, seedSavings),
  );
  const [debts, setDebts] = useState<Debt[]>(() =>
    storageGet(KEYS.DEBTS, seedDebts),
  );
  const [creditCards, setCreditCards] = useState<CreditCard[]>(() =>
    storageGet(KEYS.CREDIT_CARDS, seedCreditCards),
  );
  const [categories, setCategories] = useState<string[]>(() =>
    storageGet(KEYS.CATEGORIES, DEFAULT_CATEGORIES),
  );

  // Persistencia automática
  useEffect(() => { storageSet(KEYS.TRANSACTIONS, transactions); }, [transactions]);
  useEffect(() => { storageSet(KEYS.SAVINGS, savingsGoals); }, [savingsGoals]);
  useEffect(() => { storageSet(KEYS.DEBTS, debts); }, [debts]);
  useEffect(() => { storageSet(KEYS.CREDIT_CARDS, creditCards); }, [creditCards]);
  useEffect(() => { storageSet(KEYS.CATEGORIES, categories); }, [categories]);

  // Totales reactivos
  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [transactions],
  );
  const totalExpenses = useMemo(
    () => transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [transactions],
  );
  const balance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);

  // ── Transactions ───────────────────────────────────────────────
  function addTransaction(data: Omit<Transaction, 'id'>) {
    setTransactions((prev) => [{ ...data, id: uid() }, ...prev]);
  }
  function editTransaction(id: string, changes: Partial<Transaction>) {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...changes } : t)),
    );
  }
  function deleteTransaction(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  // ── Savings ────────────────────────────────────────────────────
  function addSavingsGoal(data: Omit<SavingsGoal, 'id'>) {
    setSavingsGoals((prev) => [...prev, { ...data, id: uid() }]);
  }
  function editSavingsGoal(id: string, changes: Partial<SavingsGoal>) {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...changes } : g)),
    );
  }
  function deleteSavingsGoal(id: string) {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  }

  // ── Debts ──────────────────────────────────────────────────────
  function addDebt(data: Omit<Debt, 'id'>) {
    setDebts((prev) => [...prev, { ...data, id: uid() }]);
  }
  function editDebt(id: string, changes: Partial<Debt>) {
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, ...changes } : d)));
  }
  function deleteDebt(id: string) {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  }

  // ── Credit Cards ───────────────────────────────────────────────
  function addCreditCard(data: Omit<CreditCard, 'id'>) {
    setCreditCards((prev) => [...prev, { ...data, id: uid() }]);
  }
  function editCreditCard(id: string, changes: Partial<CreditCard>) {
    setCreditCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...changes } : c)),
    );
  }
  function deleteCreditCard(id: string) {
    setCreditCards((prev) => prev.filter((c) => c.id !== id));
  }

  // ── Categories ─────────────────────────────────────────────────
  function addCategory(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCategories((prev) =>
      prev.includes(trimmed) ? prev : [...prev, trimmed],
    );
  }
  function deleteCategory(name: string) {
    setCategories((prev) => prev.filter((c) => c !== name));
  }
  function renameCategory(oldName: string, newName: string) {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    setCategories((prev) =>
      prev.map((c) => (c === oldName ? trimmed : c)),
    );
    setTransactions((prev) =>
      prev.map((t) => (t.category === oldName ? { ...t, category: trimmed } : t)),
    );
  }

  // ── Utilidades ─────────────────────────────────────────────────
  function resetToDefaults() {
    storageClear();
    setTransactions(seedTransactions);
    setSavingsGoals(seedSavings);
    setDebts(seedDebts);
    setCreditCards(seedCreditCards);
    setCategories(DEFAULT_CATEGORIES);
  }

  function exportData(): string {
    return JSON.stringify({ transactions, savingsGoals, debts, creditCards }, null, 2);
  }

  function importData(json: string) {
    try {
      const parsed = JSON.parse(json);
      if (parsed.transactions) setTransactions(parsed.transactions);
      if (parsed.savingsGoals) setSavingsGoals(parsed.savingsGoals);
      if (parsed.debts) setDebts(parsed.debts);
      if (parsed.creditCards) setCreditCards(parsed.creditCards);
    } catch {
      console.error('[store] JSON de importación inválido');
    }
  }

  return {
    // Estado
    transactions,
    savingsGoals,
    debts,
    creditCards,
    categories,
    // Derivados
    totalIncome,
    totalExpenses,
    balance,
    // Transactions
    addTransaction,
    editTransaction,
    deleteTransaction,
    // Savings
    addSavingsGoal,
    editSavingsGoal,
    deleteSavingsGoal,
    // Debts
    addDebt,
    editDebt,
    deleteDebt,
    // Credit Cards
    addCreditCard,
    editCreditCard,
    deleteCreditCard,
    // Categories
    addCategory,
    deleteCategory,
    renameCategory,
    // Utilidades
    resetToDefaults,
    exportData,
    importData,
  };
}
