import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { usePrefs } from '../context/PrefsContext';
import IonIcon from '../components/IonIcon';

function Widget({
  title,
  to,
  icon,
  children,
}: {
  title: string;
  to: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="block rounded-xl p-6 transition-all duration-200 hover:scale-[1.015] hover:shadow-md"
      style={{
        backgroundColor: 'var(--c-bg-surface)',
        border: '1px solid var(--c-border)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IonIcon name={icon} size={16} style={{ color: 'var(--c-text-faint)' }} />
          <h2
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: 'var(--c-text-muted)' }}
          >
            {title}
          </h2>
        </div>
        <IonIcon name="chevron-forward-outline" size={14} style={{ color: 'var(--c-text-faint)' }} />
      </div>
      {children}
    </Link>
  );
}

const MASK = '••••••';

export default function Dashboard() {
  const { transactions, totalIncome, totalExpenses, balance, creditCards, savingsGoals, debts } = useStore();
  const { fmt, showBalance, budgetAlert, budgetLimit } = usePrefs();

  const budgetLimitNum = parseFloat(budgetLimit);
  const overBudget = budgetAlert && budgetLimit !== '' && !isNaN(budgetLimitNum) && totalExpenses > budgetLimitNum;

  // ── Widget 1: Transacciones — balance real ─────────────────────────────────
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

  // ── Widget 2: Tarjetas ─────────────────────────────────────────────────────
  const totalCardBalance = creditCards.reduce((s, c) => s + c.balance, 0);
  const debitCards = creditCards.filter((c) => c.type === 'debit');
  const creditCreditCards = creditCards.filter((c) => c.type === 'credit');

  // ── Widget 3: Analíticas — categoría con más gasto ─────────────────────────
  const categoryMap = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] ?? 0) + t.amount;
      });
    return map;
  }, [transactions]);

  const topCategories = useMemo(
    () =>
      Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
    [categoryMap],
  );

  // ── Widget 4: Deudas & Ahorros ─────────────────────────────────────────────
  const totalDebt = debts.reduce((s, d) => s + d.amount, 0);
  const priorityDebts = debts.filter((d) => d.priority).length;
  const totalSaved = savingsGoals.reduce((s, g) => s + g.current, 0);
  const totalSavingsTarget = savingsGoals.reduce((s, g) => s + g.target, 0);
  const savingsProgress = totalSavingsTarget > 0 ? Math.round((totalSaved / totalSavingsTarget) * 100) : 0;

  return (
    <div>
      {overBudget && (
        <div
          className="mb-4 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium"
          style={{
            backgroundColor: 'rgba(239,68,68,0.10)',
            border: '1px solid rgba(239,68,68,0.30)',
            color: '#ef4444',
          }}
        >
          <IonIcon name="alert-circle-outline" size={16} />
          Superaste tu límite mensual de {fmt(budgetLimitNum)}. Gastos actuales: {fmt(totalExpenses)}.
        </div>
      )}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <IonIcon name="grid-outline" size={22} style={{ color: 'var(--c-text-faint)' }} />
          <h1 className="text-2xl font-bold page-title" style={{ color: 'var(--c-text-primary)' }}>
            Resumen General
          </h1>
        </div>
        <p className="text-sm ml-8" style={{ color: 'var(--c-text-faint)' }}>
          Vista rápida de tu situación financiera. Toca un módulo para ir a la sección.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* ── 1. Transacciones ──────────────────────────────────────────────── */}
        <Widget title="Transacciones" to="/transactions" icon="receipt-outline">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'var(--c-text-faint)' }}>Ingresos totales</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{showBalance ? fmt(totalIncome) : MASK}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'var(--c-text-faint)' }}>Gastos totales</span>
              <span className="font-semibold text-red-500 dark:text-red-400">{showBalance ? fmt(totalExpenses) : MASK}</span>
            </div>
            <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid var(--c-border-subtle)' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--c-text-secondary)' }}>Saldo neto</span>
              <span className="text-lg font-bold" style={{ color: balance >= 0 ? 'var(--c-text-primary)' : '#ef4444' }}>
                {showBalance ? fmt(balance) : MASK}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--c-text-faint)' }}>
              Tasa de ahorro: <strong style={{ color: savingsRate >= 20 ? '#22c55e' : savingsRate >= 10 ? '#f59e0b' : '#ef4444' }}>{savingsRate}%</strong>
              {' '}· {transactions.length} movimiento{transactions.length !== 1 ? 's' : ''} registrado{transactions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </Widget>

        {/* ── 2. Tarjetas ───────────────────────────────────────────────────── */}
        <Widget title="Tarjetas" to="/cards" icon="card-outline">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'var(--c-text-faint)' }}>Saldo disponible</span>
              <span className="font-bold text-lg" style={{ color: 'var(--c-text-primary)' }}>{showBalance ? fmt(totalCardBalance) : MASK}</span>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 rounded-lg p-2.5 text-center" style={{ backgroundColor: 'var(--c-bg-surface-alt)', border: '1px solid var(--c-border-subtle)' }}>
                <p className="text-lg font-bold" style={{ color: 'var(--c-text-primary)' }}>{debitCards.length}</p>
                <p className="text-xs" style={{ color: 'var(--c-text-faint)' }}>Débito</p>
              </div>
              <div className="flex-1 rounded-lg p-2.5 text-center" style={{ backgroundColor: 'var(--c-bg-surface-alt)', border: '1px solid var(--c-border-subtle)' }}>
                <p className="text-lg font-bold" style={{ color: 'var(--c-text-primary)' }}>{creditCreditCards.length}</p>
                <p className="text-xs" style={{ color: 'var(--c-text-faint)' }}>Crédito</p>
              </div>
              <div className="flex-1 rounded-lg p-2.5 text-center" style={{ backgroundColor: 'var(--c-bg-surface-alt)', border: '1px solid var(--c-border-subtle)' }}>
                <p className="text-lg font-bold" style={{ color: 'var(--c-text-primary)' }}>{creditCards.length}</p>
                <p className="text-xs" style={{ color: 'var(--c-text-faint)' }}>Total</p>
              </div>
            </div>
            {creditCards[0] && (
              <p className="text-xs" style={{ color: 'var(--c-text-faint)' }}>
                Última: <strong style={{ color: 'var(--c-text-secondary)' }}>{creditCards[0].name}</strong> •••• {creditCards[0].lastFour}
              </p>
            )}
          </div>
        </Widget>

        {/* ── 3. Analíticas ─────────────────────────────────────────────────── */}
        <Widget title="Analíticas" to="/analytics" icon="pie-chart-outline">
          <div className="space-y-2">
            <p className="text-xs mb-3" style={{ color: 'var(--c-text-faint)' }}>Top categorías de gasto</p>
            {topCategories.map(([cat, amount], i) => {
              const maxAmount = topCategories[0]?.[1] ?? 1;
              const pct = Math.round((amount / maxAmount) * 100);
              const colors = ['#ef4444', '#f97316', '#eab308'];
              return (
                <div key={cat}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium" style={{ color: 'var(--c-text-secondary)' }}>
                      {i + 1}. {cat}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--c-text-primary)' }}>{showBalance ? fmt(amount) : MASK}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--c-border)' }}>
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: colors[i] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Widget>

        {/* ── 4. Deudas & Ahorros ───────────────────────────────────────────── */}
        <Widget title="Deudas & Ahorros" to="/settings" icon="wallet-outline">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'var(--c-text-faint)' }}>Deuda total</span>
              <span className="font-semibold text-red-500 dark:text-red-400">{showBalance ? fmt(totalDebt) : MASK}</span>
            </div>
            {priorityDebts > 0 && (
              <p className="text-xs px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700/40">
                ⚠ {priorityDebts} deuda{priorityDebts > 1 ? 's' : ''} marcada{priorityDebts > 1 ? 's' : ''} como prioritaria{priorityDebts > 1 ? 's' : ''}
              </p>
            )}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm" style={{ color: 'var(--c-text-faint)' }}>Progreso de ahorros</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--c-text-secondary)' }}>{savingsProgress}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--c-border)' }}>
                <div className="h-2 rounded-full transition-all" style={{ width: `${savingsProgress}%`, backgroundColor: '#22c55e' }} />
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--c-text-faint)' }}>
                {showBalance ? `${fmt(totalSaved)} de ${fmt(totalSavingsTarget)}` : MASK} · {savingsGoals.length} meta{savingsGoals.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </Widget>

      </div>
    </div>
  );
}
