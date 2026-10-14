import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { storageGet } from '../services/storage';

// ── Keys (kept in sync with Settings.tsx) ────────────────────────────────────
export const PREF_KEYS = {
  CURRENCY:     'cashivars_pref_currency',
  COMPACT_NUMS: 'cashivars_pref_compact_nums',
  SHOW_BALANCE: 'cashivars_pref_show_balance',
  START_PAGE:   'cashivars_pref_start_page',
  HAPTICS:      'cashivars_pref_haptics',
  BUDGET_ALERT: 'cashivars_pref_budget_alert',
  BUDGET_LIMIT: 'cashivars_pref_budget_limit',
  SHOW_CENTS:   'cashivars_pref_show_cents',
  DATE_FORMAT:  'cashivars_pref_date_format',
} as const;

/** Dispatch this event after writing any pref so PrefsContext re-reads. */
export const PREFS_CHANGED_EVENT = 'cashivars-prefs-changed';

export interface Prefs {
  currency:    string;
  compactNums: boolean;
  showBalance: boolean;
  startPage:   string;
  budgetAlert: boolean;
  budgetLimit: string;
  showCents:   boolean;
  dateFormat:  string;
  // Formatting helpers
  fmt:         (n: number) => string;
  fmtShort:    (n: number) => string;
  formatDate:  (dateStr: string) => string; // YYYY-MM-DD → user's chosen format
}

const PrefsContext = createContext<Prefs | null>(null);

// ── Currency → locale map ─────────────────────────────────────────────────────
const CURRENCY_LOCALES: Record<string, string> = {
  MXN: 'es-MX',
  USD: 'en-US',
  EUR: 'de-DE',
  COP: 'es-CO',
  ARS: 'es-AR',
  CLP: 'es-CL',
  PEN: 'es-PE',
};

function getCurrencySymbol(currency: string): string {
  const locale = CURRENCY_LOCALES[currency] ?? 'es-MX';
  return (0)
    .toLocaleString(locale, { style: 'currency', currency, maximumFractionDigits: 0 })
    .replace(/[\d,.\s\u00A0]/g, '')
    .trim();
}

function buildFmt(currency: string, compactNums: boolean, showCents: boolean) {
  const locale = CURRENCY_LOCALES[currency] ?? 'es-MX';
  const fractions = showCents ? 2 : 0;
  const sym = getCurrencySymbol(currency);

  return (n: number): string => {
    const abs = Math.abs(n);
    const sign = n < 0 ? '-' : '';

    if (compactNums && abs >= 1_000) {
      const [val, suffix] =
        abs >= 1_000_000 ? [abs / 1_000_000, 'M'] :
                           [abs / 1_000,     'k'];
      const numStr = showCents ? val.toFixed(1) : Math.round(val).toString();
      return `${sign}${sym}${numStr}${suffix}`;
    }

    return n.toLocaleString(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: fractions,
      maximumFractionDigits: fractions,
    });
  };
}

function buildFmtShort(currency: string, showCents: boolean) {
  const sym = getCurrencySymbol(currency);
  return (n: number): string => {
    if (Math.abs(n) >= 1_000) {
      const v = n / 1_000;
      return `${sym}${showCents ? v.toFixed(1) : Math.round(v)}k`;
    }
    return `${sym}${showCents ? n.toFixed(2) : Math.round(n)}`;
  };
}

function buildFormatDate(dateFormat: string) {
  return (dateStr: string): string => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    switch (dateFormat) {
      case 'MM/DD/YYYY': return `${m}/${d}/${y}`;
      case 'YYYY-MM-DD': return `${y}-${m}-${d}`;
      case 'DD/MM/YYYY':
      default:           return `${d}/${m}/${y}`;
    }
  };
}

function readAll() {
  return {
    currency:    storageGet(PREF_KEYS.CURRENCY,     'MXN'),
    compactNums: storageGet(PREF_KEYS.COMPACT_NUMS, false),
    showBalance: storageGet(PREF_KEYS.SHOW_BALANCE, true),
    startPage:   storageGet(PREF_KEYS.START_PAGE,   '/dashboard'),
    budgetAlert: storageGet(PREF_KEYS.BUDGET_ALERT, true),
    budgetLimit: storageGet(PREF_KEYS.BUDGET_LIMIT, ''),
    showCents:   storageGet(PREF_KEYS.SHOW_CENTS,   false),
    dateFormat:  storageGet(PREF_KEYS.DATE_FORMAT,  'DD/MM/YYYY'),
  };
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState(readAll);

  const reload = useCallback(() => setPrefs(readAll()), []);

  useEffect(() => {
    // Same-tab: Settings dispatches PREFS_CHANGED_EVENT after every write
    window.addEventListener(PREFS_CHANGED_EVENT, reload);
    // Cross-tab: standard storage event
    window.addEventListener('storage', reload);
    return () => {
      window.removeEventListener(PREFS_CHANGED_EVENT, reload);
      window.removeEventListener('storage', reload);
    };
  }, [reload]);

  const { currency, compactNums, showBalance, startPage,
          budgetAlert, budgetLimit, showCents, dateFormat } = prefs;

  const fmt        = buildFmt(currency, compactNums, showCents);
  const fmtShort   = buildFmtShort(currency, showCents);
  const formatDate = buildFormatDate(dateFormat);

  return (
    <PrefsContext.Provider value={{
      currency, compactNums, showBalance, startPage,
      budgetAlert, budgetLimit, showCents, dateFormat,
      fmt, fmtShort, formatDate,
    }}>
      {children}
    </PrefsContext.Provider>
  );
}

export function usePrefs(): Prefs {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePrefs debe usarse dentro de <PrefsProvider>');
  return ctx;
}
