import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import type { Debt } from '../mocks/mockData';
import IonIcon from '../components/IonIcon';

// ─── Formatters ──────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** "2026-08-01" → "1 de agosto de 2026" */
function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return `${d} de ${MONTHS_ES[m - 1]} de ${y}`;
}

/** Days until due date (negative = overdue) */
function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return null;
  const due = new Date(y, m - 1, d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / 86_400_000);
}

function urgencyLabel(days: number | null): { label: string; cls: string } | null {
  if (days === null) return null;
  if (days < 0) return { label: 'Vencida', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  if (days === 0) return { label: 'Hoy', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  if (days <= 7) return { label: `${days}d`, cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' };
  if (days <= 30) return { label: `${days}d`, cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
  return null;
}

// ─── Inline DatePicker ────────────────────────────────────────────────────────

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

const MONTH_NAMES_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (v: string) => void;
}

function DatePicker({ value, onChange }: DatePickerProps) {
  const today = new Date();
  const initYear = value ? parseInt(value.slice(0, 4)) : today.getFullYear();
  const initMonth = value ? parseInt(value.slice(5, 7)) : today.getMonth() + 1;
  const initDay = value ? parseInt(value.slice(8, 10)) : today.getDate();

  const [year, setYear] = useState(initYear);
  const [month, setMonth] = useState(initMonth);
  const [day, setDay] = useState(initDay);

  function update(y: number, m: number, d: number) {
    const maxD = daysInMonth(y, m);
    const safeD = Math.min(d, maxD);
    setYear(y); setMonth(m); setDay(safeD);
    onChange(`${y}-${String(m).padStart(2, '0')}-${String(safeD).padStart(2, '0')}`);
  }

  const inputCls =
    'rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors';
  const inputStyle = {
    background: 'var(--c-bg-surface-alt)',
    border: '1px solid var(--c-border)',
    color: 'var(--c-text-primary)',
  };

  return (
    <div className="flex items-center gap-1">
      <select
        value={day}
        onChange={(e) => update(year, month, +e.target.value)}
        className={inputCls}
        style={{ ...inputStyle, width: 54 }}
      >
        {Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <select
        value={month}
        onChange={(e) => update(year, +e.target.value, day)}
        className={inputCls}
        style={{ ...inputStyle, width: 72 }}
      >
        {MONTH_NAMES_SHORT.map((name, i) => (
          <option key={i + 1} value={i + 1}>{name}</option>
        ))}
      </select>
      <input
        type="number"
        value={year}
        onChange={(e) => update(+e.target.value, month, day)}
        className={inputCls}
        style={{ ...inputStyle, width: 68 }}
        min={2020}
        max={2040}
      />
    </div>
  );
}

// ─── Empty form ───────────────────────────────────────────────────────────────

const today = new Date();
const EMPTY: Omit<Debt, 'id'> = {
  creditor: '',
  amount: 0,
  dueDate: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
  priority: false,
};

// ─── DebtRow ─────────────────────────────────────────────────────────────────

interface DebtRowProps {
  debt: Debt;
  order: number;
  onEdit: (id: string, changes: Partial<Debt>) => void;
  onDelete: (id: string) => void;
}

function DebtRow({ debt, order, onEdit, onDelete }: DebtRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Omit<Debt, 'id'>>({
    creditor: debt.creditor,
    amount: debt.amount,
    dueDate: debt.dueDate,
    priority: debt.priority,
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const days = daysUntil(debt.dueDate);
  const badge = urgencyLabel(days);

  const inputCls =
    'rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors w-full';
  const inputStyle = {
    background: 'var(--c-bg-surface-alt)',
    border: '1px solid var(--c-border)',
    color: 'var(--c-text-primary)',
  };

  function save() {
    onEdit(debt.id, draft);
    setEditing(false);
  }

  function cancel() {
    setDraft({ creditor: debt.creditor, amount: debt.amount, dueDate: debt.dueDate, priority: debt.priority });
    setEditing(false);
    setConfirmDelete(false);
  }

  if (editing) {
    return (
      <li
        className="px-4 py-4 last:border-0"
        style={{
          borderBottom: '1px solid var(--c-border-subtle)',
          background: 'var(--c-bg-surface-alt)',
        }}
      >
        {/* Header fila edición */}
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0 dark:bg-purple-900/30 dark:text-purple-400">
            {order}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--c-text-muted)' }}>
            Editando deuda
          </span>
          <div className="ml-auto flex gap-2">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <IonIcon name="trash-outline" size={14} />
                Eliminar
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-xs text-red-600 dark:text-red-400 font-medium">¿Confirmar?</span>
                <button
                  onClick={() => onDelete(debt.id)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Sí
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  style={{ color: 'var(--c-text-muted)' }}
                >
                  No
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Campos */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--c-text-muted)' }}>Acreedor</label>
            <input
              className={inputCls}
              style={inputStyle}
              value={draft.creditor}
              onChange={(e) => setDraft({ ...draft, creditor: e.target.value })}
              placeholder="Nombre del acreedor"
            />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--c-text-muted)' }}>Monto ($)</label>
            <input
              className={inputCls}
              style={inputStyle}
              type="number"
              min={0}
              value={draft.amount || ''}
              onChange={(e) => setDraft({ ...draft, amount: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs mb-1" style={{ color: 'var(--c-text-muted)' }}>Fecha de vencimiento</label>
            <DatePicker value={draft.dueDate} onChange={(v) => setDraft({ ...draft, dueDate: v })} />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDraft({ ...draft, priority: !draft.priority })}
              className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${draft.priority ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${draft.priority ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
            <span className="text-sm" style={{ color: 'var(--c-text-secondary)' }}>Prioridad alta (pagar primero)</span>
          </div>
        </div>

        {/* Botones guardar / cancelar */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={save}
            disabled={!draft.creditor.trim() || !draft.amount}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <IonIcon name="checkmark-outline" size={16} />
            Guardar
          </button>
          <button
            onClick={cancel}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ background: 'var(--c-bg-surface)', border: '1px solid var(--c-border)', color: 'var(--c-text-secondary)' }}
          >
            <IonIcon name="close-outline" size={16} />
            Cancelar
          </button>
        </div>
      </li>
    );
  }

  // Vista normal
  return (
    <li
      className="flex items-center gap-3 px-4 py-4 last:border-0 group transition-colors"
      style={{ borderBottom: '1px solid var(--c-border-subtle)' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-bg-surface-alt)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Orden */}
      <span className="w-6 h-6 rounded-full bg-purple-50 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0 dark:bg-purple-900/30 dark:text-purple-400">
        {order}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold truncate" style={{ color: 'var(--c-text-primary)' }}>
            {debt.creditor}
          </p>
          {debt.priority && (
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold dark:bg-red-900/30 dark:text-red-400 flex-shrink-0">
              Pagar primero
            </span>
          )}
          {badge && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${badge.cls}`}>
              {badge.label}
            </span>
          )}
        </div>
        <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-faint)' }}>
          Vence: {formatDate(debt.dueDate)}
        </p>
      </div>

      {/* Monto */}
      <span className="font-bold text-red-600 dark:text-red-400 flex-shrink-0 text-sm">
        {fmt(debt.amount)}
      </span>

      {/* Botón editar */}
      <button
        onClick={() => setEditing(true)}
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-purple-50 dark:hover:bg-purple-900/20"
        style={{ color: 'var(--c-text-muted)' }}
        title="Editar deuda"
      >
        <IonIcon name="create-outline" size={16} />
      </button>
    </li>
  );
}

// ─── AddDebtRow ───────────────────────────────────────────────────────────────

interface AddDebtRowProps {
  onAdd: (data: Omit<Debt, 'id'>) => void;
}

function AddDebtRow({ onAdd }: AddDebtRowProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Debt, 'id'>>(EMPTY);

  const inputCls =
    'rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors w-full';
  const inputStyle = {
    background: 'var(--c-bg-surface-alt)',
    border: '1px solid var(--c-border)',
    color: 'var(--c-text-primary)',
  };

  function handleAdd() {
    if (!form.creditor.trim() || !form.amount) return;
    onAdd({ ...form });
    setForm(EMPTY);
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-b-xl transition-colors hover:bg-purple-50 dark:hover:bg-purple-900/10"
        style={{ color: 'var(--c-text-muted)', borderTop: '1px solid var(--c-border-subtle)' }}
      >
        <IonIcon name="add-circle-outline" size={18} className="text-purple-500" />
        Agregar deuda
      </button>
    );
  }

  return (
    <div
      className="px-4 py-4 rounded-b-xl"
      style={{ borderTop: '1px solid var(--c-border-subtle)', background: 'var(--c-bg-surface-alt)' }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--c-text-muted)' }}>
        Nueva deuda
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--c-text-muted)' }}>Acreedor</label>
          <input
            className={inputCls}
            style={inputStyle}
            value={form.creditor}
            onChange={(e) => setForm({ ...form, creditor: e.target.value })}
            placeholder="¿A quién le debes?"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--c-text-muted)' }}>Monto ($)</label>
          <input
            className={inputCls}
            style={inputStyle}
            type="number"
            min={0}
            value={form.amount || ''}
            onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs mb-1" style={{ color: 'var(--c-text-muted)' }}>Fecha de vencimiento</label>
          <DatePicker value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} />
        </div>
        <div className="sm:col-span-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setForm({ ...form, priority: !form.priority })}
            className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${form.priority ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${form.priority ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
          <span className="text-sm" style={{ color: 'var(--c-text-secondary)' }}>Marcar como prioridad</span>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleAdd}
          disabled={!form.creditor.trim() || !form.amount}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <IonIcon name="add-outline" size={16} />
          Agregar
        </button>
        <button
          onClick={() => { setOpen(false); setForm(EMPTY); }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ background: 'var(--c-bg-surface)', border: '1px solid var(--c-border)', color: 'var(--c-text-secondary)' }}
        >
          <IonIcon name="close-outline" size={16} />
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Debts() {
  const { debts, addDebt, editDebt, deleteDebt } = useStore();

  // Snowball: ordenar de menor a mayor
  const sorted = [...debts].sort((a, b) => a.amount - b.amount);
  const totalDebt = debts.reduce((s, d) => s + d.amount, 0);
  const priorityCount = debts.filter((d) => d.priority).length;

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <IonIcon name="snow-outline" size={22} style={{ color: 'var(--c-text-faint)' }} />
          <h1 className="text-2xl font-bold page-title" style={{ color: 'var(--c-text-primary)' }}>
            Deudas
          </h1>
        </div>
        <p className="text-sm ml-8" style={{ color: 'var(--c-text-faint)' }}>
          Gestiona y liquida tus deudas con la estrategia bola de nieve.
        </p>
      </div>

      {/* ── Resumen ── */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-3">
        <div
          className="rounded-xl px-4 py-3 transition-colors"
          style={{ background: 'var(--c-bg-surface)', border: '1px solid var(--c-border)' }}
        >
          <p className="text-xs mb-0.5" style={{ color: 'var(--c-text-faint)' }}>Total adeudado</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">{fmt(totalDebt)}</p>
        </div>
        <div
          className="rounded-xl px-4 py-3 transition-colors"
          style={{ background: 'var(--c-bg-surface)', border: '1px solid var(--c-border)' }}
        >
          <p className="text-xs mb-0.5" style={{ color: 'var(--c-text-faint)' }}>Deudas</p>
          <p className="text-lg font-bold" style={{ color: 'var(--c-text-primary)' }}>{debts.length}</p>
        </div>
        <div
          className="rounded-xl px-4 py-3 col-span-2 sm:col-span-1 transition-colors"
          style={{ background: 'var(--c-bg-surface)', border: '1px solid var(--c-border)' }}
        >
          <p className="text-xs mb-0.5" style={{ color: 'var(--c-text-faint)' }}>Alta prioridad</p>
          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{priorityCount}</p>
        </div>
      </div>

      {/* ── Método bola de nieve ── */}
      <div className="flex items-center gap-2 mb-3">
        <IonIcon name="snow-outline" size={17} className="text-purple-500" />
        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--c-text-muted)' }}>
          Método Bola de Nieve
        </h2>
      </div>
      <p className="text-sm mb-4" style={{ color: 'var(--c-text-muted)' }}>
        Paga primero la deuda más pequeña para ganar impulso. Toca{' '}
        <IonIcon name="create-outline" size={13} style={{ display: 'inline', verticalAlign: 'middle', color: 'var(--c-text-muted)' }} />{' '}
        para editar cualquier deuda.
      </p>

      {debts.length === 0 ? (
        <div
          className="rounded-xl px-6 py-10 flex flex-col items-center gap-3 text-center"
          style={{ background: 'var(--c-bg-surface)', border: '1px solid var(--c-border)' }}
        >
          <IonIcon name="checkmark-circle-outline" size={40} style={{ color: 'var(--c-text-faint)' }} />
          <p className="font-semibold" style={{ color: 'var(--c-text-primary)' }}>¡Sin deudas registradas!</p>
          <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Agrega una deuda para empezar a rastrearla.</p>
          <button
            onClick={() => document.getElementById('add-debt-trigger')?.click()}
            className="mt-1 px-4 py-2 rounded-xl text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Agregar primera deuda
          </button>
        </div>
      ) : (
        <div
          className="rounded-xl shadow-sm overflow-hidden transition-colors"
          style={{ background: 'var(--c-bg-surface)', border: '1px solid var(--c-border)' }}
        >
          <ol>
            {sorted.map((debt, idx) => (
              <DebtRow
                key={debt.id}
                debt={debt}
                order={idx + 1}
                onEdit={editDebt}
                onDelete={deleteDebt}
              />
            ))}
          </ol>
          <AddDebtRow onAdd={addDebt} />
        </div>
      )}

      {/* Botón flotante cuando no hay deudas (estado vacío) */}
      {debts.length === 0 && (
        <div className="mt-4">
          <div
            className="rounded-xl overflow-hidden transition-colors"
            style={{ background: 'var(--c-bg-surface)', border: '1px solid var(--c-border)' }}
          >
            <AddDebtRow onAdd={addDebt} />
          </div>
        </div>
      )}
    </div>
  );
}
