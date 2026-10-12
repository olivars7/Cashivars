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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</h2>
        <Link
          to={to}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
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
          <DollarSign size={22} className="text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 page-title">Resumen General</h1>
        </div>
        <p className="text-sm text-gray-400 ml-8">Vista rápida de tu balance, ingresos y gastos recientes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Widget 1 — Balance */}
        <Widget title="Balance General" to="/transactions">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-600">
                <TrendingUp size={16} />
                <span className="text-sm font-medium">Ingresos</span>
              </div>
              <span className="font-semibold text-green-600">{fmt(totalIncome)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600">
                <TrendingDown size={16} />
                <span className="text-sm font-medium">Gastos</span>
              </div>
              <span className="font-semibold text-red-600">{fmt(totalExpenses)}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700">
                <DollarSign size={16} />
                <span className="text-sm font-semibold">Saldo Total</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{fmt(balance)}</span>
            </div>
          </div>
        </Widget>

        {/* Widget 2 — Last 5 movements */}
        <Widget title="Últimos Movimientos" to="/transactions">
          <ul className="space-y-2">
            {lastFive.map((t) => (
              <li key={t.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-700 truncate max-w-[160px]">{t.concept}</p>
                  <p className="text-xs text-gray-400">{t.category}</p>
                </div>
                <span
                  className={`font-semibold ${
                    t.type === 'income' ? 'text-green-600' : 'text-red-600'
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
                    <span className="font-medium text-gray-700">{g.title}</span>
                    <span className="text-gray-500">
                      {fmt(g.current)} / {fmt(g.target)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{pct}% alcanzado</p>
                </div>
              );
            })}
          </div>
        </Widget>

        {/* Widget 4 — Algorithmic alerts */}
        <Widget title="Alertas Algorítmicas" to="/analytics">
          <div className="space-y-3">
            {/* Advertencia — naranja */}
            <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-300 rounded-lg">
              <AlertTriangle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-orange-700">
                <strong>Advertencia:</strong> Estás al 80% de tu presupuesto semanal en{' '}
                <strong>Entretenimiento</strong>.
              </p>
            </div>
            {/* Estrategia — morado */}
            <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <AlertTriangle size={16} className="text-purple-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-purple-700">
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
