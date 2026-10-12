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
  cash: 'bg-gray-100 text-gray-600',
  debit: 'bg-blue-100 text-blue-700',
  credit: 'bg-purple-100 text-purple-700',
  promise: 'bg-orange-100 text-orange-700',
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

// ── Utilitarios de fecha ───────────────────────────────────────────────────

const DAYS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function parseLocalDate(dateStr: string): Date {
  // "YYYY-MM-DD" → interpreta en hora local, sin desfase UTC
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
    // Fecha futura
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
  // Mismo año → solo mes; otro año → mes + año
  if (date.getFullYear() === now.getFullYear()) {
    return capitalize(MONTHS_ES[date.getMonth()]);
  }
  return `${capitalize(MONTHS_ES[date.getMonth()])} ${date.getFullYear()}`;
}

// Abbreviated version for mobile table cells
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
        className={`w-full flex items-center justify-between border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-colors ${
          value ? 'border-gray-200 text-gray-900' : 'border-gray-200 text-gray-400'
        }`}
      >
        {value ? (
          <span className="flex items-center gap-1.5">
            <Tag size={12} className="text-gray-400" />
            {value}
          </span>
        ) : (
          'Seleccionar categoría…'
        )}
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-48 overflow-y-auto py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleSelect(cat)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                  value === cat ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Tag size={11} className="flex-shrink-0 opacity-50" />
                {cat}
                {value === cat && <Check size={12} className="ml-auto" />}
              </button>
            ))}
          </div>
          <div className="border-t border-gray-100">
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
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!newCat.trim()}
                  className="p-1 rounded-lg bg-black text-white disabled:opacity-30 hover:bg-gray-800 transition-colors"
                >
                  <Check size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => { setAddingNew(false); setNewCat(''); }}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAddingNew(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Gestionar categorías</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 mb-4">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center gap-2 py-2">
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
                    className="flex-1 text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <button
                    type="button"
                    onClick={confirmEdit}
                    disabled={!editValue.trim() || editValue.trim() === cat}
                    className="p-1 rounded-lg bg-black text-white disabled:opacity-30 hover:bg-gray-800 transition-colors"
                  >
                    <Check size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-gray-800 flex items-center gap-1.5">
                    <Tag size={11} className="text-gray-400 flex-shrink-0" />
                    {cat}
                  </span>
                  <button
                    type="button"
                    onClick={() => startEdit(cat)}
                    className="p-1 rounded text-gray-400 hover:text-gray-700 transition-colors"
                    aria-label={`Renombrar ${cat}`}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(cat)}
                    className="p-1 rounded text-gray-400 hover:text-red-600 transition-colors"
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
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Nueva categoría</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ej: Viajes"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="px-3 py-2 text-sm bg-black text-white rounded-lg disabled:opacity-30 hover:bg-gray-800 transition-colors"
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
      <span className="text-gray-500 hidden md:inline">{formatRelativeDate(dateStr)}</span>
      <span className="text-gray-500 md:hidden">{formatShortDate(dateStr)}</span>
      <span
        className={`pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30
          bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg
          transition-all duration-200 origin-bottom
          ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        {formatFullDate(dateStr)}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </span>
    </span>
  );
}

// ── Transactions ───────────────────────────────────────────────────────────
// ── Rangos de tiempo ──────────────────────────────────────────────────────
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

  // Open add modal when navigated with state.openAdd (from mobile "+" button)
  useEffect(() => {
    if ((location.state as { openAdd?: boolean } | null)?.openAdd) {
      setEditingId(null);
      setForm(EMPTY_FORM);
      setModalOpen(true);
      // Clear the state so re-renders don't reopen
      window.history.replaceState({}, '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Table scroll shadow tracking
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

  // Cerrar dropdown de rango al click fuera
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

  // Conteos por tipo respetando búsqueda y rango
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

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <ArrowLeftRight size={22} className="text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 page-title">Ingresos y Gastos</h1>
        </div>
        <p className="text-sm text-gray-400 ml-8">Registro y seguimiento de todas tus transacciones.</p>
      </div>

      {/* Filters — Row 1: search + dateRange dropdown (both mobile & desktop) */}
      <div className="flex flex-col gap-3 mb-3">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          {/* Dropdown de rango de tiempo — always beside search */}
          <div ref={rangeRef} className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setRangeOpen((o) => !o)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <Calendar size={14} className="text-gray-400" />
              <span className="hidden sm:inline">{DATE_RANGE_LABELS[dateRange]}</span>
              <span className="sm:hidden">{DATE_RANGE_LABELS[dateRange].split(' ').slice(-1)[0]}</span>
              <ChevronDown size={13} className={`text-gray-400 transition-transform duration-150 ${rangeOpen ? 'rotate-180' : ''}`} />
            </button>
            {rangeOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden py-1 min-w-[180px]">
                {(Object.keys(DATE_RANGE_LABELS) as DateRange[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setDateRange(key); setRangeOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                      dateRange === key ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
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
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 gap-0.5">
            {filterBtns.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                  filter === key ? 'bg-black text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {label}
                <span className={`text-xs tabular-nums ${filter === key ? 'text-gray-300' : 'text-gray-400'}`}>
                  ({counts[key]})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table — scroll shadows reactive to horizontal position */}
      <div
        className="relative rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        style={{
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
        className="overflow-x-auto md:overflow-visible bg-white rounded-xl"
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
            <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3 hidden md:table-cell">Fecha</th>
              <th className="px-5 py-3 md:hidden" />
              <th className="px-5 py-3">Concepto</th>
              <th className="px-5 py-3">
                <span className="flex items-center gap-1.5">
                  Categoría
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCatManagerOpen(true); }}
                    className="text-gray-500 hover:text-gray-800 transition-colors rounded p-0.5 hover:bg-gray-100"
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
                <td colSpan={6} className="text-center py-10 text-gray-400">
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
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3">
                      <DateCell dateStr={t.date} />
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">{t.concept}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-gray-500">
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
                        t.type === 'income' ? 'text-green-600' : 'text-red-600'
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
      </div>{/* end shadow wrapper */}

      {/* Below table: Categorías */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => setCatManagerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-white border border-transparent hover:border-gray-200 rounded-lg transition-colors"
        >
          <Settings2 size={14} />
          Editar categorías
        </button>
      </div>

      {/* Botón flotante "+" — only on desktop (mobile uses Layout's button) */}
      <button
        onClick={openAdd}
        className="hidden md:flex fixed top-3 right-3 z-40 w-12 h-12 rounded-full bg-black text-white items-center justify-center shadow-lg hover:bg-gray-700 hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-200"
        aria-label="Añadir transacción"
      >
        <Plus size={20} />
      </button>

      {/* Modal de transacción */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            {/* Header row: close button */}
            <div className="flex items-start justify-between mb-4">
              {/* Concept as editable italic title */}
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
                    className="w-full border-b-2 border-gray-400 pb-1 text-2xl font-bold text-gray-900 focus:outline-none focus:border-gray-900 bg-transparent"
                    style={{ fontFamily: '"Times New Roman", Times, serif', fontStyle: 'italic' }}
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => { setConceptEditing(true); setTimeout(() => conceptInputRef.current?.focus(), 0); }}
                    className="group flex items-center gap-2 text-left w-full"
                  >
                    <span
                      className="text-2xl font-bold text-gray-900 leading-snug break-words"
                      style={{ fontFamily: '"Times New Roman", Times, serif', fontStyle: 'italic' }}
                    >
                      {form.concept || (
                        <span className="text-gray-300 font-normal">{editingId ? 'Sin concepto' : 'Concepto…'}</span>
                      )}
                    </span>
                    <Pen size={15} className="text-gray-300 group-hover:text-gray-600 flex-shrink-0 transition-colors" />
                  </button>
                )}
                <p className="text-xs text-gray-400 mt-1">{editingId ? 'Editar Transacción' : 'Nueva Transacción'}</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors mt-0.5">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Fecha */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              {/* Concepto (hidden field — editing via title above) */}
              <div className="hidden">
                <input
                  type="text"
                  value={form.concept}
                  readOnly
                  tabIndex={-1}
                />
              </div>
              {/* Categoría */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
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
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as TransactionType })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="income">Ingreso</option>
                    <option value="expense">Gasto</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Monto (MXN)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 transition-colors ${
                      form.type === 'income'
                        ? 'border-green-300 bg-green-50 text-green-700 focus:ring-green-400'
                        : 'border-red-300 bg-red-50 text-red-700 focus:ring-red-400'
                    }`}
                  />
                </div>
              </div>
              {/* Medio */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Medio de pago</label>
                <select
                  value={form.medio}
                  onChange={(e) => handleMedioChange(e.target.value as PaymentMedio)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tarjeta</label>
                  <select
                    value={form.cardId ?? ''}
                    onChange={(e) => setForm({ ...form, cardId: e.target.value || null })}
                    disabled={creditCards.length === 0}
                    className="w-full border border-blue-300 bg-blue-50 text-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200"
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
              {/* Botón eliminar — solo en modo edición */}
              {editingId ? (
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
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
