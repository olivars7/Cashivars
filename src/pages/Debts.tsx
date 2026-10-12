import { useStore } from '../context/StoreContext';
import { Snowflake } from 'lucide-react';

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

export default function Debts() {
  const { debts } = useStore();
  const sortedDebts = [...debts].sort((a, b) => a.amount - b.amount);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Snowflake size={22} className="text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 page-title">Deudas</h1>
        </div>
        <p className="text-sm text-gray-400 ml-8">Gestiona y liquida tus deudas con la estrategia bola de nieve.</p>
      </div>

      {/* Snowball method — estrategia: morado */}
      <div className="flex items-center gap-2 mb-4">
        <Snowflake size={18} className="text-purple-500" />
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Método Bola de Nieve
        </h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Paga primero la deuda más pequeña para ganar impulso. Orden recomendado:
      </p>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <ol>
          {sortedDebts.map((debt, idx) => (
            <li
              key={debt.id}
              className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
            >
              {/* Número orden — morado: estrategia */}
              <span className="w-7 h-7 rounded-full bg-purple-50 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{debt.creditor}</p>
                <p className="text-xs text-gray-400">Vence: {debt.dueDate}</p>
              </div>
              {/* Monto — rojo: negativo/deuda */}
              <span className="font-bold text-red-600">{fmt(debt.amount)}</span>
              {debt.priority && (
                /* Badge pagar primero — rojo grave */
                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                  Pagar Primero
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
