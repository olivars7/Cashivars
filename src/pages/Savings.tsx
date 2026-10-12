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
          <PiggyBank size={22} className="text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 page-title">Planes de Ahorro</h1>
        </div>
        <p className="text-sm text-gray-400 ml-8">Tus metas de ahorro y el progreso hacia cada una.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {savingsGoals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
          return (
            <div
              key={goal.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4"
            >
              {/* Icon + Title — estrategia: morado */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Target size={18} className="text-purple-600" />
                </div>
                <h2 className="font-semibold text-gray-900">{goal.title}</h2>
              </div>

              {/* Amounts */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Acumulado</span>
                {/* Morado = estrategia (avance activo) */}
                <span className="font-semibold text-purple-600">{fmt(goal.current)}</span>
              </div>
              <div className="flex justify-between text-sm -mt-2">
                <span className="text-gray-500">Objetivo</span>
                <span className="font-semibold text-gray-800">{fmt(goal.target)}</span>
              </div>

              {/* Progress bar — morado estrategia */}
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progreso</span>
                  <span>{pct}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Suggestion — fondo morado suave: estrategia */}
              <p className="text-xs text-purple-800 bg-purple-50 rounded-lg p-3 border border-purple-100">
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
