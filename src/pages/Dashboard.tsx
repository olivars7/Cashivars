import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import IonIcon from '../components/IonIcon';

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
          <IonIcon name="arrow-up-outline" size={16} />
        </Link>
      </div>
      {children}
    </div>
  );
}

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

export default function Dashboard() {
  const { transactions, totalIncome, totalExpenses, balance } = useStore();
  const lastFive = transactions.slice(0, 5);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <IonIcon name="cash-outline" size={22} style={{ color: 'var(--c-text-faint)' }} />
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
                <IonIcon name="trending-up-outline" size={16} />
                <span className="text-sm font-medium">Ingresos</span>
              </div>
              <span className="font-semibold text-green-600 dark:text-green-400">{fmt(totalIncome)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <IonIcon name="trending-down-outline" size={16} />
                <span className="text-sm font-medium">Gastos</span>
              </div>
              <span className="font-semibold text-red-600 dark:text-red-400">{fmt(totalExpenses)}</span>
            </div>
            <div
              className="pt-3 flex items-center justify-between"
              style={{ borderTop: '1px solid var(--c-border-subtle)' }}
            >
              <div className="flex items-center gap-2" style={{ color: 'var(--c-text-secondary)' }}>
                <IonIcon name="cash-outline" size={16} />
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

        {/* Widget 3 — Algorithmic alerts */}
        <Widget title="Alertas Algorítmicas" to="/analytics">
          <div className="space-y-3">
            {/* Advertencia — naranja */}
            <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-300 rounded-lg dark:bg-orange-900/20 dark:border-orange-700/50">
              <IonIcon name="warning-outline" size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-orange-700 dark:text-orange-300">
                <strong>Advertencia:</strong> Estás al 80% de tu presupuesto semanal en{' '}
                <strong>Entretenimiento</strong>.
              </p>
            </div>
            {/* Estrategia — morado */}
            <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg dark:bg-purple-900/20 dark:border-purple-700/50">
              <IonIcon name="warning-outline" size={16} className="text-purple-500 mt-0.5 flex-shrink-0" />
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
