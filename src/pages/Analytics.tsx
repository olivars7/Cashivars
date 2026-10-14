import { useMemo } from 'react';
import { usePrefs } from '../context/PrefsContext';
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
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { useStore } from '../context/StoreContext';
import IonIcon from '../components/IonIcon';

// ── Paleta: azules + verde + negro/blanco, sin rojo ───────────────────────────
const BLUE_SHADES = ['#1e3a5f', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];
const CATEGORY_COLORS = ['#1d4ed8', '#2563eb', '#3b82f6', '#0ea5e9', '#0891b2', '#0e7490', '#134e4a', '#15803d'];

const MONTH_LABELS: Record<string, string> = {
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
};

const MEDIO_LABELS: Record<string, string> = {
  debit: 'Débito', cash: 'Efectivo', credit: 'Crédito', promise: 'Promesa',
};

// ── Componentes ───────────────────────────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      className="rounded-xl p-4 flex items-center gap-3"
      style={{ backgroundColor: 'var(--c-bg-surface)', border: '1px solid var(--c-border)' }}
    >
      <div
        className="p-2.5 rounded-lg flex-shrink-0"
        style={{ backgroundColor: accent ?? '#1d4ed8' }}
      >
        <IonIcon name={icon} size={16} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide font-medium truncate leading-tight" style={{ color: 'var(--c-text-muted)' }}>
          {label}
        </p>
        <p className="text-base font-bold leading-tight" style={{ color: 'var(--c-text-primary)' }}>
          {value}
        </p>
        {sub && (
          <p className="text-[10px] mt-0.5 truncate leading-tight" style={{ color: 'var(--c-text-faint)' }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ChartCard con scroll horizontal opcional para mobile
function ChartCard({
  title,
  children,
  scrollable = false,
}: {
  title: string;
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-4 sm:p-6"
      style={{ backgroundColor: 'var(--c-bg-surface)', border: '1px solid var(--c-border)' }}
    >
      <h2
        className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-4"
        style={{ color: 'var(--c-text-muted)' }}
      >
        {title}
      </h2>
      {scrollable ? (
        <div className="overflow-x-auto -mx-1 px-1">
          <div style={{ minWidth: 320 }}>
            {children}
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: 'var(--c-bg-surface)',
  border: '1px solid var(--c-border)',
  color: 'var(--c-text-primary)',
  borderRadius: 8,
  fontSize: 12,
};

// ── Página principal ──────────────────────────────────────────────────────────

export default function Analytics() {
  const { transactions, savingsGoals } = useStore();
  const { fmt, fmtShort } = usePrefs();

  // ── Gastos por categoría (histórico completo) ─────────────────────────────
  const categoryExpenses = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // ── Ingresos vs Gastos — últimos 12 meses con datos ──────────────────────
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
      .slice(-12)
      .map(([key, vals]) => {
        const [, month] = key.split('-');
        return {
          month: MONTH_LABELS[month] ?? month,
          ...vals,
          balance: vals.income - vals.expenses,
        };
      });
  }, [transactions]);

  // ── Balance acumulado en el tiempo ────────────────────────────────────────
  const cumulativeBalance = useMemo(() => {
    let acc = 0;
    return monthlyComparison.map((m) => {
      acc += m.balance;
      return { month: m.month, acumulado: acc };
    });
  }, [monthlyComparison]);

  // ── Distribución por medio de pago ───────────────────────────────────────
  const medioDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => { map[t.medio] = (map[t.medio] ?? 0) + t.amount; });
    return Object.entries(map).map(([medio, value]) => ({
      name: MEDIO_LABELS[medio] ?? medio,
      value,
    }));
  }, [transactions]);

  // ── Tasa de ahorro mensual ────────────────────────────────────────────────
  const savingsRate = useMemo(() => {
    return monthlyComparison.map((m) => ({
      month: m.month,
      tasa: m.income > 0 ? Math.round(((m.income - m.expenses) / m.income) * 100) : 0,
    }));
  }, [monthlyComparison]);

  // ── Top 5 gastos individuales ─────────────────────────────────────────────
  const topExpenses = useMemo(() => {
    return [...transactions]
      .filter((t) => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  // ── KPIs del mes actual ───────────────────────────────────────────────────
  const { gastoHormiga, presupuestoPorc, balanceMes, promGastoMensual, totalAhorros } =
    useMemo(() => {
      const now = new Date();
      const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const monthTxs = transactions.filter((t) => t.date.startsWith(ym));
      const inc = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const hormiga = monthTxs
        .filter((t) => t.type === 'expense' && t.amount < 300)
        .reduce((s, t) => s + t.amount, 0);

      const allMonths = monthlyComparison.slice(-6);
      const prom = allMonths.length
        ? allMonths.reduce((s, m) => s + m.expenses, 0) / allMonths.length
        : 0;

      const tAhorros = savingsGoals.reduce((s, g) => s + g.current, 0);

      return {
        gastoHormiga: hormiga,
        presupuestoPorc: inc > 0 ? Math.round((exp / inc) * 100) : 0,
        balanceMes: inc - exp,
        promGastoMensual: prom,
        totalAhorros: tAhorros,
      };
    }, [transactions, savingsGoals, monthlyComparison]);

  // ── Progreso ahorros ──────────────────────────────────────────────────────
  const savingsProgress = useMemo(() => {
    return savingsGoals.map((g) => ({
      name: g.title,
      actual: g.current,
      meta: g.target,
      porc: Math.round((g.current / g.target) * 100),
    }));
  }, [savingsGoals]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <IonIcon name="bar-chart-outline" size={22} style={{ color: 'var(--c-text-faint)' }} />
          <h1 className="text-2xl font-bold page-title" style={{ color: 'var(--c-text-primary)' }}>
            Análisis Financiero
          </h1>
        </div>
        <p className="text-sm ml-8" style={{ color: 'var(--c-text-faint)' }}>
          Métricas, patrones y tendencias calculadas desde tus datos.
        </p>
      </div>

      {/* KPI Row — 2 cols en mobile, 3 en sm, 5 en lg */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-6">
        <KpiCard
          icon="leaf-outline"
          label="Gasto Hormiga"
          value={fmt(gastoHormiga)}
          sub="< $300 este mes"
          accent="#15803d"
        />
        <KpiCard
          icon="pie-chart-outline"
          label="Presupuesto"
          value={`${presupuestoPorc}%`}
          sub="gastos / ingresos"
          accent="#1d4ed8"
        />
        <KpiCard
          icon="trending-up-outline"
          label="Balance Mes"
          value={fmt(balanceMes)}
          sub="ingresos − gastos"
          accent="#0891b2"
        />
        <KpiCard
          icon="stats-chart-outline"
          label="Prom. Gasto"
          value={fmt(promGastoMensual)}
          sub="últimos 6 meses"
          accent="#2563eb"
        />
        <KpiCard
          icon="wallet-outline"
          label="Ahorros"
          value={fmt(totalAhorros)}
          sub="en metas activas"
          accent="#0e7490"
        />
      </div>

      {/* Row 1: Ingresos vs Gastos (full width, scrollable en mobile) */}
      <div className="mb-5">
        <ChartCard title="Ingresos vs Gastos — últimos 12 meses" scrollable>
          <ResponsiveContainer width="100%" height={220} minWidth={320}>
            <BarChart data={monthlyComparison} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--c-text-faint)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--c-text-faint)' }} tickFormatter={fmtShort} width={36} />
              <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="income" name="Ingresos" fill="#16a34a" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expenses" name="Gastos" fill="#1d4ed8" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Balance Acumulado + Tasa de Ahorro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ChartCard title="Balance Acumulado" scrollable>
          <ResponsiveContainer width="100%" height={200} minWidth={280}>
            <AreaChart data={cumulativeBalance} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--c-text-faint)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--c-text-faint)' }} tickFormatter={fmtShort} width={36} />
              <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="acumulado"
                name="Acumulado"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#gradBalance)"
                dot={{ r: 3, fill: '#3b82f6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tasa de Ahorro Mensual (%)" scrollable>
          <ResponsiveContainer width="100%" height={200} minWidth={280}>
            <LineChart data={savingsRate} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--c-text-faint)' }} />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--c-text-faint)' }}
                tickFormatter={(v) => `${v}%`}
                width={34}
              />
              <Tooltip formatter={(v) => `${v}%`} contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="tasa"
                name="Ahorro %"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ r: 3, fill: '#0ea5e9' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3: Gastos por Categoría (donut) + Medio de Pago (pie) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ChartCard title="Gastos por Categoría">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={categoryExpenses}
                cx="50%"
                cy="46%"
                innerRadius={50}
                outerRadius={82}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryExpenses.map((_e, i) => (
                  <Cell key={`cat-${i}`} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={tooltipStyle} />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Gastos por Medio de Pago">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={medioDistribution}
                cx="50%"
                cy="46%"
                outerRadius={82}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={{ stroke: 'var(--c-text-faint)', strokeWidth: 1 }}
              >
                {medioDistribution.map((_e, i) => (
                  <Cell key={`med-${i}`} fill={BLUE_SHADES[i % BLUE_SHADES.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 4: Progreso de Ahorros + Top 5 Gastos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Progreso de Metas de Ahorro">
          <div className="space-y-4 pt-1">
            {savingsProgress.map((g, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-xs font-medium truncate"
                    style={{ color: 'var(--c-text-secondary)', maxWidth: '70%' }}
                  >
                    {g.name}
                  </span>
                  <span className="text-xs font-semibold ml-2 flex-shrink-0" style={{ color: 'var(--c-text-primary)' }}>
                    {g.porc}%
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--c-border)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(g.porc, 100)}%`,
                      backgroundColor: BLUE_SHADES[i % BLUE_SHADES.length],
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px]" style={{ color: 'var(--c-text-faint)' }}>{fmt(g.actual)}</span>
                  <span className="text-[10px]" style={{ color: 'var(--c-text-faint)' }}>{fmt(g.meta)}</span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Top 5 Gastos Individuales">
          <div className="space-y-3 pt-1">
            {topExpenses.map((t, i) => (
              <div key={t.id} className="flex items-center gap-3">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
                  style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length], fontSize: 10 }}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--c-text-secondary)' }}>
                    {t.concept}
                  </p>
                  <p className="text-[10px] leading-tight" style={{ color: 'var(--c-text-faint)' }}>
                    {t.category} · {t.date}
                  </p>
                </div>
                <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--c-text-primary)' }}>
                  {fmt(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
