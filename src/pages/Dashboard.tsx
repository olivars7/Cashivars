import { Link } from 'react-router-dom';
import { ArrowUpRight, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

function Widget({
  title,
  to,
  children,
}: {
  title: string;
  to: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl shadow-sm p-6 relative transition-colors duration-300"
      style={{
        backgroundColor: 'var(--c-bg-surface)',
        border: '1px solid var(--c-border)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-sm font-semibold uppercase tracking-wide"
          style={{ color: 'var(--c-text-muted)' }}
        >
          {title}
        </h2>
        <Link
          to={to}
          className="p-1.5 rounded-lg transition-colors hover:bg-[var(--c-bg-surface-alt)]"
          style={{ color: 'var(--c-text-faint)' }}
          title="Ver más"
        >
          <ArrowUpRight size={16} />
        </Link>
      </div>
      {children}
    </div>
  );
}

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

export default function Dashboard() {
  const { transactions, totalIncome, totalExpenses, balance, savingsGoals } = useStore();
  const lastFive = transactions.slice(0, 5);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign size={22} style={{ color: 'var(--c-text-faint)' }} />
          <h1 className="text-2xl font-bold page-title" style={{ color: 'var(--c-text-primary)' }}>
            Resumen General
          </h1>
        </div>
        <p className="text-sm ml-8" style={{ color: 'var(--c-text-faint)' }}>
          Vista rápida de tu balance, ingresos y gastos recientes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Widget 1 — Balance */}
        <Widget title="Balance General" to="/transactions">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <TrendingUp size={16} />
                <span className="text-sm font-medium">Ingresos</span>
              </div>
              <span className="font-semibold text-green-600 dark:text-green-400">{fmt(totalIncome)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <TrendingDown size={16} />
                <span className="text-sm font-medium">Gastos</span>
              </div>
              <span className="font-semibold text-red-600 dark:text-red-400">{fmt(totalExpenses)}</span>
            </div>
            <div
              className="pt-3 flex items-center justify-between"
              style={{ borderTop: '1px solid var(--c-border-subtle)' }}
            >
              <div className="flex items-center gap-2" style={{ color: 'var(--c-text-secondary)' }}>
                <DollarSign size={16} />
                <span className="text-sm font-semibold">Saldo Total</span>
              </div>
              <span className="text-lg font-bold" style={{ color: 'var(--c-text-primary)' }}>
                {fmt(balance)}
              </span>
            </div>
          </div>
        </Widget>

        {/* Widget 2 — Last 5 movements */}
        <Widget title="Últimos Movimientos" to="/transactions">
          <ul className="space-y-2">
            {lastFive.map((t) => (
              <li key={t.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium truncate max-w-[160px]" style={{ color: 'var(--c-text-secondary)' }}>
                    {t.concept}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--c-text-faint)' }}>
                    {t.category}
                  </p>
                </div>
                <span
                  className={`font-semibold ${
                    t.type === 'income'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {t.type === 'income' ? '+' : '-'}
                  {fmt(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        </Widget>

        {/* Widget 3 — Savings goals */}
        <Widget title="Metas de Ahorro" to="/savings">
          <div className="space-y-4">
            {savingsGoals.slice(0, 2).map((g) => {
              const pct = Math.round((g.current / g.target) * 100);
              return (
                <div key={g.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium" style={{ color: 'var(--c-text-secondary)' }}>
                      {g.title}
                    </span>
                    <span style={{ color: 'var(--c-text-muted)' }}>
                      {fmt(g.current)} / {fmt(g.target)}
                    </span>
                  </div>
                  <div
                    className="w-full rounded-full h-2.5"
                    style={{ backgroundColor: 'var(--c-border)' }}
                  >
                    <div
                      className="bg-purple-600 h-2.5 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--c-text-faint)' }}>
                    {pct}% alcanzado
                  </p>
                </div>
              );
            })}
          </div>
        </Widget>

        {/* Widget 4 — Algorithmic alerts */}
        <Widget title="Alertas Algorítmicas" to="/analytics">
          <div className="space-y-3">
            {/* Advertencia — naranja */}
            <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-300 rounded-lg dark:bg-orange-900/20 dark:border-orange-700/50">
              <AlertTriangle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-orange-700 dark:text-orange-300">
                <strong>Advertencia:</strong> Estás al 80% de tu presupuesto semanal en{' '}
                <strong>Entretenimiento</strong>.
              </p>
            </div>
            {/* Estrategia — morado */}
            <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg dark:bg-purple-900/20 dark:border-purple-700/50">
              <AlertTriangle size={16} className="text-purple-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-purple-700 dark:text-purple-300">
                <strong>Estrategia:</strong> Reducir gastos en Alimentación podría ahorrarte{' '}
                <strong>$800/mes</strong>.
              </p>
            </div>
          </div>
        </Widget>
      </div>
    </div>
  );
}
