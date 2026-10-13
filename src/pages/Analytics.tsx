import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useStore } from '../context/StoreContext';
import IonIcon from '../components/IonIcon';

// Paleta semántica: verde (positivo), rojo (negativo), morado (estrategia), naranja (advertencia), negro (neutro)
const DONUT_COLORS = ['#9333ea', '#dc2626', '#16a34a', '#ea580c', '#111827', '#0ea5e9', '#f59e0b', '#10b981'];

const MONTH_LABELS: Record<string, string> = {
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
};

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

function MetricCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl shadow-sm p-5 flex items-center gap-4 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--c-bg-surface)',
        border: '1px solid var(--c-border)',
      }}
    >
      <div className={`p-3 rounded-lg ${color}`}>
        <IonIcon name={icon} size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide font-medium" style={{ color: 'var(--c-text-muted)' }}>
          {label}
        </p>
        <p className="text-xl font-bold" style={{ color: 'var(--c-text-primary)' }}>{value}</p>
        <p className="text-xs" style={{ color: 'var(--c-text-faint)' }}>{sub}</p>
      </div>
    </div>
  );
}

export default function Analytics() {
  const { transactions } = useStore();

  // ── Gastos por Categoría (todos los gastos del histórico) ─────────────────
  const categoryExpenses = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] ?? 0) + t.amount;
      });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // ── Comparación mensual — últimos 6 meses con datos ──────────────────────
  const monthlyComparison = useMemo(() => {
    const map: Record<string, { income: number; expenses: number }> = {};
    transactions.forEach((t) => {
      const [year, month] = t.date.split('-');
      const key = `${year}-${month}`;
      if (!map[key]) map[key] = { income: 0, expenses: 0 };
      if (t.type === 'income') map[key].income += t.amount;
      else map[key].expenses += t.amount;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, vals]) => {
        const [, month] = key.split('-');
        return { month: MONTH_LABELS[month] ?? month, ...vals };
      });
  }, [transactions]);

  // ── Métrica: Gasto Hormiga (gastos < $300 del mes actual) ────────────────
  const gastoHormiga = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return transactions
      .filter((t) => t.type === 'expense' && t.amount < 300 && t.date.startsWith(ym))
      .reduce((s, t) => s + t.amount, 0);
  }, [transactions]);

  // ── Métrica: Presupuesto Consumido (gastos / ingresos mes actual) ─────────
  const { presupuestoPorc, proyeccionSobrante } = useMemo(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthTxs = transactions.filter((t) => t.date.startsWith(ym));
    const inc = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const exp = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const porc = inc > 0 ? Math.round((exp / inc) * 100) : 0;
    return { presupuestoPorc: porc, proyeccionSobrante: inc - exp };
  }, [transactions]);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <IonIcon name="trending-up-outline" size={22} style={{ color: 'var(--c-text-faint)' }} />
          <h1 className="text-2xl font-bold page-title" style={{ color: 'var(--c-text-primary)' }}>
            Análisis y Algoritmos
          </h1>
        </div>
        <p className="text-sm ml-8" style={{ color: 'var(--c-text-faint)' }}>
          Métricas inteligentes y patrones de tus finanzas.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <MetricCard
          icon="bug-outline"
          label="Gasto Hormiga (mes actual)"
          value={fmt(gastoHormiga)}
          sub="Gastos pequeños acumulados < $300"
          color="bg-orange-500"
        />
        <MetricCard
          icon="stats-chart-outline"
          label="Presupuesto Consumido"
          value={`${presupuestoPorc}%`}
          sub="Gastos / ingresos mes actual"
          color="bg-red-600"
        />
        <MetricCard
          icon="trending-up-outline"
          label="Balance Mes Actual"
          value={fmt(proyeccionSobrante)}
          sub="Ingresos − Gastos del mes"
          color="bg-green-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut — expenses by category */}
        <div
          className="rounded-xl shadow-sm p-6 transition-colors duration-300"
          style={{
            backgroundColor: 'var(--c-bg-surface)',
            border: '1px solid var(--c-border)',
          }}
        >
          <h2
            className="text-sm font-semibold uppercase tracking-wide mb-4"
            style={{ color: 'var(--c-text-muted)' }}
          >
            Gastos por Categoría
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={categoryExpenses}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {categoryExpenses.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => fmt(Number(val))} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar — income vs expenses last 6 months */}
        <div
          className="rounded-xl shadow-sm p-6 transition-colors duration-300"
          style={{
            backgroundColor: 'var(--c-bg-surface)',
            border: '1px solid var(--c-border)',
          }}
        >
          <h2
            className="text-sm font-semibold uppercase tracking-wide mb-4"
            style={{ color: 'var(--c-text-muted)' }}
          >
            Ingresos vs Gastos (últimos 6 meses)
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyComparison} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--c-text-faint)' }} />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--c-text-faint)' }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(val) => fmt(Number(val))}
                contentStyle={{
                  backgroundColor: 'var(--c-bg-surface)',
                  border: '1px solid var(--c-border)',
                  color: 'var(--c-text-primary)',
                }}
              />
              <Legend />
              <Bar dataKey="income" name="Ingresos" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Gastos" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
