import { useStore } from '../context/StoreContext';
import { Target, PiggyBank } from 'lucide-react';

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

export default function Savings() {
  const { savingsGoals } = useStore();

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <PiggyBank size={22} style={{ color: 'var(--c-text-faint)' }} />
          <h1 className="text-2xl font-bold page-title" style={{ color: 'var(--c-text-primary)' }}>
            Planes de Ahorro
          </h1>
        </div>
        <p className="text-sm ml-8" style={{ color: 'var(--c-text-faint)' }}>
          Tus metas de ahorro y el progreso hacia cada una.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {savingsGoals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
          return (
            <div
              key={goal.id}
              className="rounded-xl shadow-sm p-6 flex flex-col gap-4 transition-colors duration-300"
              style={{
                backgroundColor: 'var(--c-bg-surface)',
                border: '1px solid var(--c-border)',
              }}
            >
              {/* Icon + Title */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg dark:bg-purple-900/30">
                  <Target size={18} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="font-semibold" style={{ color: 'var(--c-text-primary)' }}>
                  {goal.title}
                </h2>
              </div>

              {/* Amounts */}
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--c-text-muted)' }}>Acumulado</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  {fmt(goal.current)}
                </span>
              </div>
              <div className="flex justify-between text-sm -mt-2">
                <span style={{ color: 'var(--c-text-muted)' }}>Objetivo</span>
                <span className="font-semibold" style={{ color: 'var(--c-text-secondary)' }}>
                  {fmt(goal.target)}
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--c-text-faint)' }}>
                  <span>Progreso</span>
                  <span>{pct}%</span>
                </div>
                <div
                  className="w-full rounded-full h-3"
                  style={{ backgroundColor: 'var(--c-border)' }}
                >
                  <div
                    className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Suggestion */}
              <p className="text-xs text-purple-800 bg-purple-50 rounded-lg p-3 border border-purple-100 dark:text-purple-300 dark:bg-purple-900/20 dark:border-purple-700/40">
                💡 <strong>Estrategia:</strong> Aporta{' '}
                <strong>{fmt(goal.weeklyContribution)} semanales</strong> para llegar en{' '}
                <strong>{goal.weeksLeft} semanas</strong>.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
