import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Plus, X, Check, ChevronDown, Tag, Settings2, Pencil, Trash2, ArrowLeftRight, Calendar, Pen } from 'lucide-react';
import { Transaction, TransactionType, PaymentMedio } from '../mocks/mockData';
import { useStore } from '../context/StoreContext';

type Filter = 'all' | 'income' | 'expense';

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

const MEDIO_LABELS: Record<PaymentMedio, string> = {
  cash: 'Efectivo',
  debit: 'Débito',
  credit: 'Crédito',
  promise: 'Promesa',
};

const MEDIO_STYLES: Record<PaymentMedio, string> = {
  cash: 'bg-gray-100 text-gray-600 dark:bg-gray-700/40 dark:text-gray-300',
  debit: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  credit: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  promise: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

const EMPTY_FORM = {
  date: new Date().toISOString().slice(0, 10),
  concept: '',
  category: '',
  type: 'expense' as TransactionType,
  amount: '',
  medio: 'cash' as PaymentMedio,
  cardId: null as string | null,
};

// Shared input style for modal
const inputStyle = {
  border: '1px solid var(--c-border)',
  backgroundColor: 'var(--c-bg-page)',
  color: 'var(--c-text-primary)',
};
const inputCls = 'w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 transition-colors duration-200';

// ── Utilitarios de fecha ───────────────────────────────────────────────────

const DAYS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatRelativeDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const now = new Date();
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  const diffMs = nowMidnight.getTime() - date.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    if (diffDays === -1) return 'Mañana';
    return `En ${Math.abs(diffDays)} días`;
  }
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return capitalize(DAYS_ES[date.getDay()]);
  if (diffDays < 14) return 'Hace 1 semana';
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Hace ${weeks} semanas`;
  }
  if (date.getFullYear() === now.getFullYear()) {
    return capitalize(MONTHS_ES[date.getMonth()]);
  }
  return `${capitalize(MONTHS_ES[date.getMonth()])} ${date.getFullYear()}`;
}

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function formatShortDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const now = new Date();
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  const diffMs = nowMidnight.getTime() - date.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Mañana';
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `${diffDays}d`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`;
  if (diffDays < 365 && date.getFullYear() === now.getFullYear()) {
    return MONTHS_SHORT[date.getMonth()];
  }
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

function formatFullDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const day = DAYS_ES[date.getDay()];
  const num = date.getDate();
  const month = MONTHS_ES[date.getMonth()];
  const year = date.getFullYear();
  return `${capitalize(day)}, ${num} de ${month} de ${year}`;
}

// ── CategoryPicker ─────────────────────────────────────────────────────────
interface CategoryPickerProps {
  value: string;
  onChange: (val: string) => void;
  categories: string[];
  onAddCategory: (name: string) => void;
}

function CategoryPicker({ value, onChange, categories, onAddCategory }: CategoryPickerProps) {
  const [open, setOpen] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setAddingNew(false);
        setNewCat('');
      }
    }
    if (open) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  function handleSelect(cat: string) {
    onChange(cat);
    setOpen(false);
    setAddingNew(false);
  }

  function handleCreate() {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    onAddCategory(trimmed);
    onChange(trimmed);
    setNewCat('');
    setAddingNew(false);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 transition-colors"
        style={{
          border: '1px solid var(--c-border)',
          backgroundColor: 'var(--c-bg-page)',
          color: value ? 'var(--c-text-primary)' : 'var(--c-text-faint)',
        }}
      >
        {value ? (
          <span className="flex items-center gap-1.5">
            <Tag size={12} style={{ color: 'var(--c-text-faint)' }} />
            {value}
          </span>
        ) : (
          'Seleccionar categoría…'
        )}
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ color: 'var(--c-text-faint)' }}
        />
      </button>

      {open && (
        <div
          className="absolute z-20 mt-1 w-full rounded-xl shadow-lg overflow-hidden"
          style={{
            backgroundColor: 'var(--c-bg-surface)',
            border: '1px solid var(--c-border)',
          }}
        >
          <div className="max-h-48 overflow-y-auto py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleSelect(cat)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                  value === cat
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'hover:bg-[var(--c-bg-surface-alt)]'
                }`}
                style={value !== cat ? { color: 'var(--c-text-secondary)' } : undefined}
              >
                <Tag size={11} className="flex-shrink-0 opacity-50" />
                {cat}
                {value === cat && <Check size={12} className="ml-auto" />}
              </button>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--c-border-subtle)' }}>
            {addingNew ? (
              <div className="flex items-center gap-2 px-3 py-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="Nombre de categoría"
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                    if (e.key === 'Escape') { setAddingNew(false); setNewCat(''); }
                  }}
                  className="flex-1 text-sm rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!newCat.trim()}
                  className="p-1 rounded-lg bg-black text-white disabled:opacity-30 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
                >
                  <Check size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => { setAddingNew(false); setNewCat(''); }}
                  className="p-1 rounded-lg transition-colors hover:opacity-70"
                  style={{ color: 'var(--c-text-faint)' }}
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAddingNew(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[var(--c-bg-surface-alt)]"
                style={{ color: 'var(--c-text-muted)' }}
              >
                <Plus size={13} />
                Nueva categoría…
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── CategoryManagerModal ───────────────────────────────────────────────────
interface CategoryManagerProps {
  categories: string[];
  onAdd: (name: string) => void;
  onDelete: (name: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onClose: () => void;
}

function CategoryManagerModal({ categories, onAdd, onDelete, onRename, onClose }: CategoryManagerProps) {
  const [newName, setNewName] = useState('');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setNewName('');
  }

  function startEdit(cat: string) {
    setEditingCat(cat);
    setEditValue(cat);
  }

  function confirmEdit() {
    if (editingCat) {
      onRename(editingCat, editValue);
    }
    setEditingCat(null);
    setEditValue('');
  }

  function cancelEdit() {
    setEditingCat(null);
    setEditValue('');
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="rounded-2xl shadow-xl w-full max-w-sm p-6 max-h-[80vh] flex flex-col transition-colors duration-300"
        style={{
          backgroundColor: 'var(--c-bg-surface)',
          border: '1px solid var(--c-border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ color: 'var(--c-text-primary)' }}>
            Gestionar categorías
          </h2>
          <button
            onClick={onClose}
            className="transition-colors hover:opacity-70"
            style={{ color: 'var(--c-text-faint)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Lista */}
        <div
          className="flex-1 overflow-y-auto mb-4"
          style={{ borderBottom: '1px solid var(--c-border-subtle)' }}
        >
          {categories.map((cat) => (
            <div
              key={cat}
              className="flex items-center gap-2 py-2"
              style={{ borderBottom: '1px solid var(--c-border-subtle)' }}
            >
              {editingCat === cat ? (
                <>
                  <input
                    autoFocus
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="flex-1 text-sm rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={confirmEdit}
                    disabled={!editValue.trim() || editValue.trim() === cat}
                    className="p-1 rounded-lg bg-black text-white disabled:opacity-30 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
                  >
                    <Check size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="p-1 rounded-lg transition-colors hover:opacity-70"
                    style={{ color: 'var(--c-text-faint)' }}
                  >
                    <X size={13} />
                  </button>
                </>
              ) : (
                <>
                  <span
                    className="flex-1 text-sm flex items-center gap-1.5"
                    style={{ color: 'var(--c-text-secondary)' }}
                  >
                    <Tag size={11} style={{ color: 'var(--c-text-faint)' }} className="flex-shrink-0" />
                    {cat}
                  </span>
                  <button
                    type="button"
                    onClick={() => startEdit(cat)}
                    className="p-1 rounded transition-colors hover:opacity-70"
                    style={{ color: 'var(--c-text-faint)' }}
                    aria-label={`Renombrar ${cat}`}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(cat)}
                    className="p-1 rounded text-red-400 hover:text-red-600 transition-colors"
                    aria-label={`Eliminar ${cat}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Agregar nueva */}
        <div className="pt-4">
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--c-text-muted)' }}>
            Nueva categoría
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ej: Viajes"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
              className={inputCls}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="px-3 py-2 text-sm bg-black text-white rounded-lg disabled:opacity-30 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DateCell ───────────────────────────────────────────────────────────────
function DateCell({ dateStr }: { dateStr: string }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showTip() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(true);
  }
  function hideTip() {
    timerRef.current = setTimeout(() => setVisible(false), 100);
  }

  return (
    <span
      className="relative inline-flex items-center whitespace-nowrap cursor-default"
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
    >
      <span className="hidden md:inline" style={{ color: 'var(--c-text-muted)' }}>
        {formatRelativeDate(dateStr)}
      </span>
      <span className="md:hidden" style={{ color: 'var(--c-text-muted)' }}>
        {formatShortDate(dateStr)}
      </span>
      <span
        className={`pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30
          bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg
          transition-all duration-200 origin-bottom
          ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        {formatFullDate(dateStr)}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
      </span>
    </span>
  );
}

// ── Date Ranges ────────────────────────────────────────────────────────────
type DateRange = 'current_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'last_year' | 'past_year';

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  current_month: 'Este mes',
  last_month: 'Mes pasado',
  last_3_months: 'Últimos 3 meses',
  last_6_months: 'Últimos 6 meses',
  last_year: 'Último año',
  past_year: 'Año pasado',
};

function getDateRangeBounds(range: DateRange): { from: Date; to: Date } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  switch (range) {
    case 'current_month':
      return { from: new Date(y, m, 1), to: new Date(y, m + 1, 0) };
    case 'last_month':
      return { from: new Date(y, m - 1, 1), to: new Date(y, m, 0) };
    case 'last_3_months':
      return { from: new Date(y, m - 2, 1), to: new Date(y, m + 1, 0) };
    case 'last_6_months':
      return { from: new Date(y, m - 5, 1), to: new Date(y, m + 1, 0) };
    case 'last_year':
      return { from: new Date(y - 1, m + 1, 1), to: new Date(y, m + 1, 0) };
    case 'past_year':
      return { from: new Date(y - 1, 0, 1), to: new Date(y - 1, 11, 31) };
  }
}

export default function Transactions() {
  const {
    transactions, addTransaction, editTransaction, deleteTransaction,
    creditCards, categories, addCategory, deleteCategory, renameCategory,
  } = useStore();
  const location = useLocation();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [searchFocused, setSearchFocused] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('current_month');
  const [rangeOpen, setRangeOpen] = useState(false);
  const rangeRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [scrollShadow, setScrollShadow] = useState<'right' | 'left' | 'both' | 'none'>('right');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [conceptEditing, setConceptEditing] = useState(false);
  const conceptInputRef = useRef<HTMLInputElement>(null);

  const [catManagerOpen, setCatManagerOpen] = useState(false);

  useEffect(() => {
    if ((location.state as { openAdd?: boolean } | null)?.openAdd) {
      setEditingId(null);
      setForm(EMPTY_FORM);
      setModalOpen(true);
      window.history.replaceState({}, '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return;
    function update() {
      if (!el) return;
      const atLeft = el.scrollLeft <= 0;
      const atRight = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      if (atLeft && atRight) setScrollShadow('none');
      else if (atLeft) setScrollShadow('right');
      else if (atRight) setScrollShadow('left');
      else setScrollShadow('both');
    }
    update();
    el.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (rangeRef.current && !rangeRef.current.contains(e.target as Node)) {
        setRangeOpen(false);
      }
    }
    if (rangeOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [rangeOpen]);

  const { from: rangeFrom, to: rangeTo } = getDateRangeBounds(dateRange);

  const matchesRange = (t: Transaction) => {
    const d = parseLocalDate(t.date);
    return d >= rangeFrom && d <= rangeTo;
  };

  const q = search.toLowerCase();
  const matchesSearch = (t: Transaction) =>
    t.concept.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q) ||
    formatRelativeDate(t.date).toLowerCase().includes(q) ||
    formatFullDate(t.date).toLowerCase().includes(q);

  const filtered = transactions
    .filter((t) => (filter === 'all' || t.type === filter) && matchesSearch(t) && matchesRange(t))
    .sort((a, b) => b.date.localeCompare(a.date));

  const counts = {
    all: transactions.filter((t) => matchesSearch(t) && matchesRange(t)).length,
    income: transactions.filter((t) => t.type === 'income' && matchesSearch(t) && matchesRange(t)).length,
    expense: transactions.filter((t) => t.type === 'expense' && matchesSearch(t) && matchesRange(t)).length,
  };

  const filterBtns: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Todo' },
    { key: 'income', label: 'Ingresos' },
    { key: 'expense', label: 'Gastos' },
  ];

  const needsCard = form.medio === 'credit' || form.medio === 'debit';

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setConceptEditing(false);
    setModalOpen(true);
  }

  function openEdit(t: Transaction) {
    setEditingId(t.id);
    setForm({
      date: t.date,
      concept: t.concept,
      category: t.category,
      type: t.type,
      amount: String(t.amount),
      medio: t.medio,
      cardId: t.cardId,
    });
    setConceptEditing(false);
    setModalOpen(true);
  }

  function handleMedioChange(medio: PaymentMedio) {
    const stillNeedsCard = medio === 'credit' || medio === 'debit';
    setForm({ ...form, medio, cardId: stillNeedsCard ? form.cardId : null });
  }

  function handleSubmit() {
    if (!form.concept.trim() || !form.category.trim() || !form.amount) return;
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) return;

    const payload = {
      ...form,
      amount,
      cardId: needsCard ? form.cardId : null,
    };

    if (editingId) {
      editTransaction(editingId, payload);
    } else {
      addTransaction(payload);
    }
    setModalOpen(false);
  }

  function handleDelete() {
    if (!editingId) return;
    deleteTransaction(editingId);
    setModalOpen(false);
  }

  function getCardName(cardId: string | null): string | null {
    if (!cardId) return null;
    const card = creditCards.find((c) => c.id === cardId);
    return card ? card.name : null;
  }

  // suppress unused var warning for searchFocused
  void searchFocused;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <ArrowLeftRight size={22} style={{ color: 'var(--c-text-faint)' }} />
          <h1 className="text-2xl font-bold page-title" style={{ color: 'var(--c-text-primary)' }}>
            Ingresos y Gastos
          </h1>
        </div>
        <p className="text-sm ml-8" style={{ color: 'var(--c-text-faint)' }}>
          Registro y seguimiento de todas tus transacciones.
        </p>
      </div>

      {/* Filters — Row 1: search + dateRange dropdown */}
      <div className="flex flex-col gap-3 mb-3">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--c-text-faint)' }}
            />
            <input
              type="text"
              placeholder="Buscar…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`${inputCls} pl-9 pr-4 py-2`}
              style={inputStyle}
            />
          </div>
          {/* Date range dropdown */}
          <div ref={rangeRef} className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setRangeOpen((o) => !o)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap hover:bg-[var(--c-bg-surface-alt)]"
              style={{
                backgroundColor: 'var(--c-bg-surface)',
                border: '1px solid var(--c-border)',
                color: 'var(--c-text-muted)',
              }}
            >
              <Calendar size={14} style={{ color: 'var(--c-text-faint)' }} />
              <span className="hidden sm:inline">{DATE_RANGE_LABELS[dateRange]}</span>
              <span className="sm:hidden">{DATE_RANGE_LABELS[dateRange].split(' ').slice(-1)[0]}</span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-150 ${rangeOpen ? 'rotate-180' : ''}`}
                style={{ color: 'var(--c-text-faint)' }}
              />
            </button>
            {rangeOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-20 rounded-xl shadow-lg overflow-hidden py-1 min-w-[180px]"
                style={{
                  backgroundColor: 'var(--c-bg-surface)',
                  border: '1px solid var(--c-border)',
                }}
              >
                {(Object.keys(DATE_RANGE_LABELS) as DateRange[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setDateRange(key); setRangeOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                      dateRange === key
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'hover:bg-[var(--c-bg-surface-alt)]'
                    }`}
                    style={dateRange !== key ? { color: 'var(--c-text-secondary)' } : undefined}
                  >
                    {DATE_RANGE_LABELS[key]}
                    {dateRange === key && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: filter switch */}
        <div className="flex items-center">
          <div
            className="flex items-center rounded-lg p-0.5 gap-0.5"
            style={{
              backgroundColor: 'var(--c-bg-surface)',
              border: '1px solid var(--c-border)',
            }}
          >
            {filterBtns.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                  filter === key
                    ? 'bg-black text-white shadow-sm dark:bg-white dark:text-black'
                    : 'hover:bg-[var(--c-bg-surface-alt)]'
                }`}
                style={filter !== key ? { color: 'var(--c-text-muted)' } : undefined}
              >
                {label}
                <span
                  className="text-xs tabular-nums"
                  style={{ color: filter === key ? 'rgba(255,255,255,0.6)' : 'var(--c-text-faint)' }}
                >
                  ({counts[key]})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="relative rounded-xl shadow-sm overflow-hidden"
        style={{
          border: '1px solid var(--c-border)',
          boxShadow: [
            scrollShadow === 'right' || scrollShadow === 'both'
              ? 'inset -18px 0 16px -12px rgba(0,0,0,0.10)'
              : '',
            scrollShadow === 'left' || scrollShadow === 'both'
              ? 'inset 18px 0 16px -12px rgba(0,0,0,0.10)'
              : '',
          ].filter(Boolean).join(', ') || 'none',
        }}
      >
        <div
          ref={tableScrollRef}
          className="overflow-x-auto md:overflow-visible rounded-xl transition-colors duration-300"
          style={{ backgroundColor: 'var(--c-bg-surface)' }}
        >
          <table className="w-full text-sm table-fixed min-w-[520px]">
            <colgroup>
              <col className="w-[14%]" />
              <col className="w-[28%]" />
              <col className="w-[20%]" />
              <col className="w-[18%]" />
              <col className="w-[16%]" />
              <col className="w-[4%]" />
            </colgroup>
            <thead>
              <tr
                className="text-left text-xs uppercase tracking-wide"
                style={{
                  borderBottom: '1px solid var(--c-border)',
                  color: 'var(--c-text-muted)',
                }}
              >
                <th className="px-5 py-3 hidden md:table-cell">Fecha</th>
                <th className="px-5 py-3 md:hidden" />
                <th className="px-5 py-3">Concepto</th>
                <th className="px-5 py-3">
                  <span className="flex items-center gap-1.5">
                    Categoría
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setCatManagerOpen(true); }}
                      className="transition-colors rounded p-0.5 hover:bg-[var(--c-bg-surface-alt)]"
                      style={{ color: 'var(--c-text-muted)' }}
                      aria-label="Gestionar categorías"
                    >
                      <Settings2 size={12} />
                    </button>
                  </span>
                </th>
                <th className="px-5 py-3">Medio</th>
                <th className="px-5 py-3 text-right hidden md:table-cell">Monto</th>
                <th className="px-5 py-3 text-right md:hidden" />
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10" style={{ color: 'var(--c-text-faint)' }}>
                    No se encontraron registros.
                  </td>
                </tr>
              ) : (
                filtered.map((t: Transaction) => {
                  const cardName = getCardName(t.cardId);
                  return (
                    <tr
                      key={t.id}
                      onClick={() => openEdit(t)}
                      className="last:border-0 transition-colors cursor-pointer hover:bg-[var(--c-bg-surface-alt)]"
                      style={{ borderBottom: '1px solid var(--c-border-subtle)' }}
                    >
                      <td className="px-5 py-3">
                        <DateCell dateStr={t.date} />
                      </td>
                      <td className="px-5 py-3 font-medium" style={{ color: 'var(--c-text-primary)' }}>
                        {t.concept}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex items-center gap-1"
                          style={{ color: 'var(--c-text-muted)' }}
                        >
                          <Tag size={11} className="opacity-40" />
                          {t.category}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${MEDIO_STYLES[t.medio]}`}
                        >
                          {MEDIO_LABELS[t.medio]}
                          {cardName && (
                            <span className="opacity-70 hidden md:inline">· {cardName}</span>
                          )}
                        </span>
                      </td>
                      <td
                        className={`px-5 py-3 text-right font-semibold ${
                          t.type === 'income'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {t.type === 'income' ? '+' : '-'}
                        {fmt(t.amount)}
                      </td>
                      <td className="px-5 py-3 w-4" />
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Below table: Categorías */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => setCatManagerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors border border-transparent hover:border-[var(--c-border)] hover:bg-[var(--c-bg-surface)]"
          style={{ color: 'var(--c-text-muted)' }}
        >
          <Settings2 size={14} />
          Editar categorías
        </button>
      </div>

      {/* Botón flotante "+" — desktop */}
      <button
        onClick={openAdd}
        className="hidden md:flex fixed top-3 right-3 z-40 w-12 h-12 rounded-full bg-black text-white items-center justify-center shadow-lg hover:bg-gray-700 hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-200 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        aria-label="Añadir transacción"
      >
        <Plus size={20} />
      </button>

      {/* Modal de transacción */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div
            className="rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto transition-colors duration-300"
            style={{
              backgroundColor: 'var(--c-bg-surface)',
              border: '1px solid var(--c-border)',
            }}
          >
            {/* Header row */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 mr-3">
                {conceptEditing ? (
                  <input
                    ref={conceptInputRef}
                    type="text"
                    placeholder="Concepto…"
                    value={form.concept}
                    onChange={(e) => setForm({ ...form, concept: e.target.value })}
                    onBlur={() => setConceptEditing(false)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setConceptEditing(false); }}
                    className="w-full pb-1 text-2xl font-bold focus:outline-none bg-transparent"
                    style={{
                      borderBottom: '2px solid var(--c-text-muted)',
                      color: 'var(--c-text-primary)',
                      fontFamily: '"Times New Roman", Times, serif',
                      fontStyle: 'italic',
                    }}
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => { setConceptEditing(true); setTimeout(() => conceptInputRef.current?.focus(), 0); }}
                    className="group flex items-center gap-2 text-left w-full"
                  >
                    <span
                      className="text-2xl font-bold leading-snug break-words"
                      style={{
                        color: 'var(--c-text-primary)',
                        fontFamily: '"Times New Roman", Times, serif',
                        fontStyle: 'italic',
                      }}
                    >
                      {form.concept || (
                        <span style={{ color: 'var(--c-text-faint)', fontWeight: 'normal' }}>
                          {editingId ? 'Sin concepto' : 'Concepto…'}
                        </span>
                      )}
                    </span>
                    <Pen
                      size={15}
                      className="flex-shrink-0 transition-colors group-hover:opacity-100 opacity-30"
                      style={{ color: 'var(--c-text-muted)' }}
                    />
                  </button>
                )}
                <p className="text-xs mt-1" style={{ color: 'var(--c-text-faint)' }}>
                  {editingId ? 'Editar Transacción' : 'Nueva Transacción'}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="transition-colors hover:opacity-70 mt-0.5"
                style={{ color: 'var(--c-text-faint)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Fecha */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--c-text-muted)' }}>
                  Fecha
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              {/* Concepto hidden */}
              <div className="hidden">
                <input type="text" value={form.concept} readOnly tabIndex={-1} />
              </div>
              {/* Categoría */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--c-text-muted)' }}>
                  Categoría
                </label>
                <CategoryPicker
                  value={form.category}
                  onChange={(val) => setForm({ ...form, category: val })}
                  categories={categories}
                  onAddCategory={(name) => addCategory(name)}
                />
              </div>
              {/* Tipo + Monto */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--c-text-muted)' }}>
                    Tipo
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as TransactionType })}
                    className={inputCls}
                    style={inputStyle}
                  >
                    <option value="income">Ingreso</option>
                    <option value="expense">Gasto</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--c-text-muted)' }}>
                    Monto (MXN)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 transition-colors ${
                      form.type === 'income'
                        ? 'border-green-300 bg-green-50 text-green-700 focus:ring-green-400 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700/50'
                        : 'border-red-300 bg-red-50 text-red-700 focus:ring-red-400 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700/50'
                    }`}
                    style={{ border: undefined }}
                  />
                </div>
              </div>
              {/* Medio */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--c-text-muted)' }}>
                  Medio de pago
                </label>
                <select
                  value={form.medio}
                  onChange={(e) => handleMedioChange(e.target.value as PaymentMedio)}
                  className={inputCls}
                  style={inputStyle}
                >
                  <option value="cash">Efectivo</option>
                  <option value="debit">Débito</option>
                  <option value="credit">Crédito</option>
                  <option value="promise">Promesa</option>
                </select>
              </div>
              {/* Tarjeta */}
              {needsCard && (
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--c-text-muted)' }}>
                    Tarjeta
                  </label>
                  <select
                    value={form.cardId ?? ''}
                    onChange={(e) => setForm({ ...form, cardId: e.target.value || null })}
                    disabled={creditCards.length === 0}
                    className="w-full border border-blue-300 bg-blue-50 text-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700/50"
                  >
                    {creditCards.length === 0 ? (
                      <option value="">Sin tarjetas registradas</option>
                    ) : (
                      <>
                        <option value="">— Seleccionar tarjeta —</option>
                        {creditCards.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} (···{c.lastFour})
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="flex items-center justify-between mt-6">
              {editingId ? (
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  aria-label="Eliminar transacción"
                >
                  <Trash2 size={16} />
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm rounded-lg transition-colors hover:bg-[var(--c-bg-surface-alt)]"
                  style={{
                    border: '1px solid var(--c-border)',
                    color: 'var(--c-text-muted)',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
                >
                  <Check size={15} />
                  {editingId ? 'Guardar' : 'Añadir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de gestión de categorías */}
      {catManagerOpen && (
        <CategoryManagerModal
          categories={categories}
          onAdd={addCategory}
          onDelete={deleteCategory}
          onRename={renameCategory}
          onClose={() => setCatManagerOpen(false)}
        />
      )}
    </div>
  );
}
