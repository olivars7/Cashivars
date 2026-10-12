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
          <Snowflake size={22} style={{ color: 'var(--c-text-faint)' }} />
          <h1 className="text-2xl font-bold page-title" style={{ color: 'var(--c-text-primary)' }}>
            Deudas
          </h1>
        </div>
        <p className="text-sm ml-8" style={{ color: 'var(--c-text-faint)' }}>
          Gestiona y liquida tus deudas con la estrategia bola de nieve.
        </p>
      </div>

      {/* Snowball method */}
      <div className="flex items-center gap-2 mb-4">
        <Snowflake size={18} className="text-purple-500" />
        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--c-text-muted)' }}>
          Método Bola de Nieve
        </h2>
      </div>
      <p className="text-sm mb-4" style={{ color: 'var(--c-text-muted)' }}>
        Paga primero la deuda más pequeña para ganar impulso. Orden recomendado:
      </p>

      <div
        className="rounded-xl shadow-sm overflow-hidden transition-colors duration-300"
        style={{
          backgroundColor: 'var(--c-bg-surface)',
          border: '1px solid var(--c-border)',
        }}
      >
        <ol>
          {sortedDebts.map((debt, idx) => (
            <li
              key={debt.id}
              className="flex items-center gap-4 px-5 py-4 last:border-0 transition-colors cursor-default"
              style={{
                borderBottom: '1px solid var(--c-border-subtle)',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = 'var(--c-bg-surface-alt)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = 'transparent')
              }
            >
              {/* Número orden — morado */}
              <span className="w-7 h-7 rounded-full bg-purple-50 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0 dark:bg-purple-900/30 dark:text-purple-400">
                {idx + 1}
              </span>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: 'var(--c-text-primary)' }}>
                  {debt.creditor}
                </p>
                <p className="text-xs" style={{ color: 'var(--c-text-faint)' }}>
                  Vence: {debt.dueDate}
                </p>
              </div>
              {/* Monto — rojo */}
              <span className="font-bold text-red-600 dark:text-red-400">{fmt(debt.amount)}</span>
              {debt.priority && (
                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold dark:bg-red-900/30 dark:text-red-400">
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
