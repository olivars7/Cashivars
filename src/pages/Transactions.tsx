import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import IonIcon from '../components/IonIcon';
import { Transaction, TransactionType, PaymentMedio, CreditCard } from '../mocks/mockData';
import { useStore } from '../context/StoreContext';
import { usePrefs } from '../context/PrefsContext';

type Filter = 'all' | 'income' | 'expense';

const MEDIO_LABELS: Record<PaymentMedio, string> = {
  cash: 'Efectivo',
  debit: 'Débito',
  credit: 'Crédito',
  promise: 'Promesa',
};

// ── Category colours ──────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Trabajo':        { bg: 'rgba(59,130,246,0.12)',  text: '#2563eb', border: 'rgba(59,130,246,0.35)'  },
  'Hogar':          { bg: 'rgba(251,191,36,0.15)',  text: '#b45309', border: 'rgba(251,191,36,0.45)'  },
  'Alimentación':   { bg: 'rgba(34,197,94,0.13)',   text: '#15803d', border: 'rgba(34,197,94,0.38)'   },
  'Extra':          { bg: 'rgba(168,85,247,0.12)',  text: '#7c3aed', border: 'rgba(168,85,247,0.35)'  },
  'Servicios':      { bg: 'rgba(234,179,8,0.13)',   text: '#a16207', border: 'rgba(234,179,8,0.38)'   },
  'Salud':          { bg: 'rgba(239,68,68,0.11)',   text: '#b91c1c', border: 'rgba(239,68,68,0.32)'   },
  'Transporte':     { bg: 'rgba(14,165,233,0.12)',  text: '#0369a1', border: 'rgba(14,165,233,0.35)'  },
  'Educación':      { bg: 'rgba(99,102,241,0.12)',  text: '#4338ca', border: 'rgba(99,102,241,0.35)'  },
  'Entretenimiento':{ bg: 'rgba(236,72,153,0.11)',  text: '#be185d', border: 'rgba(236,72,153,0.32)'  },
  'Ropa':           { bg: 'rgba(20,184,166,0.12)',  text: '#0f766e', border: 'rgba(20,184,166,0.35)'  },
  'Personal':       { bg: 'rgba(249,115,22,0.12)',  text: '#c2410c', border: 'rgba(249,115,22,0.35)'  },
};
const DEFAULT_CAT_COLOR = { bg: 'rgba(107,114,128,0.10)', text: '#4b5563', border: 'rgba(107,114,128,0.28)' };

function getCategoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? DEFAULT_CAT_COLOR;
}

const MEDIO_STYLES: Record<PaymentMedio, string> = {
  cash: 'bg-gray-100 text-gray-600 dark:bg-gray-700/40 dark:text-gray-300',
  debit: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  credit: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  promise: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

const CATEGORY_ICONS: Record<string, string> = {
  'Trabajo': 'briefcase-outline',
  'Hogar': 'home-outline',
  'Alimentación': 'restaurant-outline',
  'Extra': 'star-outline',
  'Servicios': 'flash-outline',
  'Salud': 'medkit-outline',
  'Transporte': 'car-outline',
  'Educación': 'school-outline',
  'Entretenimiento': 'film-outline',
  'Ropa': 'shirt-outline',
  'Personal': 'person-outline',
};

function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] ?? 'pricetag-outline';
}

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

// ── CategoryPicker — styled dropdown ──────────────────────────────────────
interface CategoryPickerProps {
  value: string;
  onChange: (val: string) => void;
  categories: string[];
  onAddCategory: (name: string) => void;
}

function CategoryPicker({ value, onChange, categories, onAddCategory }: CategoryPickerProps) {
  const [open, setOpen] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newCat, setNewCat] = useState('');
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

  const selectedCol = value ? getCategoryColor(value) : null;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400"
        style={{
          border: open
            ? '1.5px solid var(--c-text-muted)'
            : selectedCol
              ? `1.5px solid ${selectedCol.border}`
              : '1.5px solid var(--c-border)',
          backgroundColor: selectedCol ? selectedCol.bg : 'var(--c-bg-page)',
          color: selectedCol ? selectedCol.text : 'var(--c-text-faint)',
        }}
      >
        <span className="flex items-center gap-2 font-medium">
          {value ? (
            <>
              <IonIcon name={getCategoryIcon(value)} size={14} />
              {value}
            </>
          ) : (
            <span style={{ color: 'var(--c-text-faint)', fontWeight: 'normal' }}>Seleccionar categoría…</span>
          )}
        </span>
        <IonIcon
          name="chevron-down-outline"
          size={14}
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          style={{ color: selectedCol ? selectedCol.text : 'var(--c-text-faint)', opacity: 0.7 }}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute z-30 left-0 right-0 mt-1.5 rounded-2xl shadow-xl overflow-hidden"
          style={{ backgroundColor: 'var(--c-bg-surface)', border: '1px solid var(--c-border)' }}
        >
          {/* Category list */}
          <div className="py-1.5 max-h-52 overflow-y-auto">
            {categories.map((cat) => {
              const isSelected = value === cat;
              const col = getCategoryColor(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleSelect(cat)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
                  style={isSelected
                    ? { backgroundColor: col.bg, color: col.text }
                    : { color: 'var(--c-text-secondary)' }
                  }
                  onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--c-bg-surface-alt)'; }}
                  onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = ''; }}
                >
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: col.bg, color: col.text }}
                  >
                    <IonIcon name={getCategoryIcon(cat)} size={14} />
                  </span>
                  <span className="flex-1 font-medium">{cat}</span>
                  {isSelected && <IonIcon name="checkmark-circle" size={16} style={{ color: col.text }} />}
                </button>
              );
            })}
          </div>

          {/* Add new category row */}
          <div style={{ borderTop: '1px solid var(--c-border-subtle)' }} className="p-2">
            {addingNew ? (
              <div className="flex items-center gap-2">
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
                  className="flex-1 text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400"
                  style={inputStyle}
                />
                <button type="button" onClick={handleCreate} disabled={!newCat.trim()}
                  className="p-1.5 rounded-lg bg-black text-white disabled:opacity-30 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors">
                  <IonIcon name="checkmark-outline" size={13} />
                </button>
                <button type="button" onClick={() => { setAddingNew(false); setNewCat(''); }}
                  className="p-1.5 rounded-lg transition-colors hover:opacity-70" style={{ color: 'var(--c-text-faint)' }}>
                  <IonIcon name="close-outline" size={13} />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setAddingNew(true)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-xs transition-colors hover:bg-[var(--c-bg-surface-alt)]"
                style={{ color: 'var(--c-text-muted)' }}>
                <IonIcon name="add-circle-outline" size={15} />
                Nueva categoría…
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── CardPicker — colorful grid ─────────────────────────────────────────────
interface CardPickerProps {
  value: string | null;
  onChange: (id: string | null) => void;
  cards: CreditCard[];
}

// Derive a solid accent colour from a Tailwind gradient string like "from-blue-700 to-blue-950"
function gradientToAccent(gradient: string): { bg: string; text: string; border: string } {
  if (gradient.includes('blue'))   return { bg: 'rgba(37,99,235,0.12)',  text: '#1d4ed8', border: 'rgba(37,99,235,0.35)' };
  if (gradient.includes('purple')) return { bg: 'rgba(126,34,206,0.12)', text: '#7e22ce', border: 'rgba(126,34,206,0.35)' };
  if (gradient.includes('green'))  return { bg: 'rgba(22,163,74,0.12)',  text: '#15803d', border: 'rgba(22,163,74,0.35)'  };
  if (gradient.includes('red'))    return { bg: 'rgba(220,38,38,0.12)',  text: '#b91c1c', border: 'rgba(220,38,38,0.35)'  };
  if (gradient.includes('pink'))   return { bg: 'rgba(219,39,119,0.12)', text: '#be185d', border: 'rgba(219,39,119,0.35)' };
  if (gradient.includes('orange')) return { bg: 'rgba(234,88,12,0.12)',  text: '#c2410c', border: 'rgba(234,88,12,0.35)'  };
  if (gradient.includes('teal'))   return { bg: 'rgba(15,118,110,0.12)', text: '#0f766e', border: 'rgba(15,118,110,0.35)' };
  return                                  { bg: 'rgba(107,114,128,0.10)',text: '#374151', border: 'rgba(107,114,128,0.28)'};
}

function CardPicker({ value, onChange, cards }: CardPickerProps) {
  if (cards.length === 0) {
    return (
      <p className="text-sm py-2" style={{ color: 'var(--c-text-faint)' }}>
        Sin tarjetas registradas
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      {/* "None" option */}
      <button
        type="button"
        onClick={() => onChange(null)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
        style={value === null
          ? { backgroundColor: 'var(--c-text-primary)', color: 'var(--c-bg-surface)', border: '1.5px solid transparent' }
          : { backgroundColor: 'var(--c-bg-page)', color: 'var(--c-text-muted)', border: '1.5px solid var(--c-border)' }
        }
      >
        <IonIcon name="remove-circle-outline" size={16} />
        Sin tarjeta
      </button>

      {cards.map((card) => {
        const isSelected = value === card.id;
        const col = gradientToAccent(card.gradient);
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onChange(card.id)}
            className="flex flex-col items-start px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={isSelected
              ? { backgroundColor: col.bg, color: col.text, border: `1.5px solid ${col.border}`, boxShadow: `0 0 0 2px ${col.border}` }
              : { backgroundColor: 'var(--c-bg-page)', color: 'var(--c-text-muted)', border: '1.5px solid var(--c-border)' }
            }
          >
            <span className="flex items-center gap-1.5 w-full">
              <IonIcon name="card-outline" size={15} />
              <span className="flex-1 truncate font-medium">{card.name}</span>
              {isSelected && <IonIcon name="checkmark-circle" size={14} />}
            </span>
            <span className="text-xs mt-0.5 opacity-70">···{card.lastFour} · {card.network}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── CustomSelect — styled dropdown reusable ───────────────────────────────
interface CustomSelectProps<T extends string | number> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  className?: string;
}

function CustomSelect<T extends string | number>({ value, options, onChange, className }: CustomSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? String(value);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-1 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400"
        style={{
          border: open ? '1.5px solid var(--c-text-muted)' : '1.5px solid var(--c-border)',
          backgroundColor: 'var(--c-bg-page)',
          color: 'var(--c-text-primary)',
        }}
      >
        <span className="flex-1 text-center truncate">{selectedLabel}</span>
        <IonIcon
          name="chevron-down-outline"
          size={13}
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          style={{ color: 'var(--c-text-faint)' }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-30 left-0 right-0 mt-1.5 rounded-2xl shadow-xl overflow-hidden"
          style={{ backgroundColor: 'var(--c-bg-surface)', border: '1px solid var(--c-border)' }}
        >
          <div className="py-1.5 max-h-52 overflow-y-auto">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm transition-colors"
                  style={isSelected
                    ? { backgroundColor: 'var(--c-bg-surface-alt)', color: 'var(--c-text-primary)', fontWeight: 600 }
                    : { color: 'var(--c-text-secondary)' }
                  }
                  onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--c-bg-surface-alt)'; }}
                  onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = ''; }}
                >
                  <span className="flex-1 text-center">{opt.label}</span>
                  {isSelected && <IonIcon name="checkmark-circle" size={15} style={{ color: 'var(--c-text-primary)' }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── DatePicker — three custom selects (día / mes / año) ───────────────────
interface DatePickerProps {
  value: string;           // YYYY-MM-DD
  onChange: (v: string) => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function DatePicker({ value, onChange }: DatePickerProps) {
  const parts = value.split('-').map(Number);
  const selYear  = parts[0] || new Date().getFullYear();
  const selMonth = parts[1] || new Date().getMonth() + 1;
  const selDay   = parts[2] || new Date().getDate();

  const maxDay = daysInMonth(selYear, selMonth);
  const currentYear = new Date().getFullYear();

  function update(y: number, m: number, d: number) {
    const safeDay = Math.min(d, daysInMonth(y, m));
    onChange(`${y}-${String(m).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`);
  }

  const dayOptions    = Array.from({ length: maxDay }, (_, i) => ({ value: i + 1, label: String(i + 1) }));
  const monthOptions  = MONTH_NAMES.map((name, i) => ({ value: i + 1, label: name }));
  const yearOptions   = Array.from({ length: 6 }, (_, i) => ({ value: currentYear - 4 + i, label: String(currentYear - 4 + i) }));

  return (
    <div className="flex gap-2">
      <CustomSelect value={selDay}   options={dayOptions}   onChange={(d) => update(selYear, selMonth, d)} className="flex-1" />
      <CustomSelect value={selMonth} options={monthOptions} onChange={(m) => update(selYear, m, selDay)}  className="flex-[2]" />
      <CustomSelect value={selYear}  options={yearOptions}  onChange={(y) => update(y, selMonth, selDay)} className="flex-[1.2]" />
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
  leaving?: boolean;
}

function CategoryManagerModal({ categories, onAdd, onDelete, onRename, onClose, leaving = false }: CategoryManagerProps) {
  const [newName, setNewName] = useState('');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  function dismiss() {
    onClose();
  }

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
      className={`fixed inset-0 z-[60] modal-overlay ${leaving ? 'overlay-leave' : 'overlay-enter'}
        md:flex md:items-center md:justify-center md:px-4
        flex items-end`}
      onMouseDown={(e) => { if (e.target === overlayRef.current) dismiss(); }}
    >
      {/* ── Desktop panel ── */}
      <div
        className={`hidden md:flex rounded-2xl shadow-xl w-full max-w-sm p-6 max-h-[80vh] flex-col transition-colors duration-300 ${leaving ? 'modal-panel-leave' : 'modal-panel-enter'}`}
        style={{ backgroundColor: 'var(--c-bg-surface)', border: '1px solid var(--c-border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IonIcon name="pricetags-outline" size={17} style={{ color: 'var(--c-text-muted)' }} />
            <h2 className="text-base font-semibold" style={{ color: 'var(--c-text-primary)' }}>
              Gestionar categorías
            </h2>
          </div>
          <button onClick={dismiss} className="transition-colors hover:opacity-70" style={{ color: 'var(--c-text-faint)' }}>
            <IonIcon name="close-outline" size={18} />
          </button>
        </div>
        <CatList categories={categories} editingCat={editingCat} editValue={editValue}
          onStartEdit={startEdit} onConfirmEdit={confirmEdit} onCancelEdit={cancelEdit}
          onDelete={onDelete} setEditValue={setEditValue} />
        <CatAddRow newName={newName} setNewName={setNewName} onAdd={handleAdd} />
      </div>

      {/* ── Mobile bottom-sheet ── */}
      <div
        className={`md:hidden w-full flex flex-col transition-colors duration-300
          rounded-t-3xl shadow-2xl max-h-[88vh] ${leaving ? 'sheet-leave' : 'sheet-enter'}`}
        style={{ backgroundColor: 'var(--c-bg-surface)', borderTop: '1px solid var(--c-border)' }}
      >
        {/* drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--c-border)' }} />
        </div>
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--c-bg-surface-alt)' }}>
              <IonIcon name="pricetags-outline" size={18} style={{ color: 'var(--c-text-muted)' }} />
            </div>
            <div>
              <p className="text-base font-semibold" style={{ color: 'var(--c-text-primary)' }}>Categorías</p>
              <p className="text-xs" style={{ color: 'var(--c-text-faint)' }}>{categories.length} categorías</p>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ backgroundColor: 'var(--c-bg-surface-alt)', color: 'var(--c-text-muted)' }}
          >
            <IonIcon name="close-outline" size={18} />
          </button>
        </div>
        {/* list */}
        <div className="flex-1 overflow-y-auto px-5">
          <CatList categories={categories} editingCat={editingCat} editValue={editValue}
            onStartEdit={startEdit} onConfirmEdit={confirmEdit} onCancelEdit={cancelEdit}
            onDelete={onDelete} setEditValue={setEditValue} mobile />
        </div>
        {/* add row */}
        <div className="px-5 pb-8 pt-4" style={{ borderTop: '1px solid var(--c-border-subtle)' }}>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--c-text-muted)' }}>Nueva categoría</p>
          <CatAddRow newName={newName} setNewName={setNewName} onAdd={handleAdd} />
        </div>
      </div>
    </div>
  );
}

// ── Shared sub-components for CategoryManagerModal ────────────────────────
interface CatListProps {
  categories: string[];
  editingCat: string | null;
  editValue: string;
  onStartEdit: (cat: string) => void;
  onConfirmEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (cat: string) => void;
  setEditValue: (v: string) => void;
  mobile?: boolean;
}
function CatList({ categories, editingCat, editValue, onStartEdit, onConfirmEdit, onCancelEdit, onDelete, setEditValue, mobile }: CatListProps) {
  return (
    <div className={mobile ? '' : 'flex-1 overflow-y-auto mb-4'} style={mobile ? undefined : { borderBottom: '1px solid var(--c-border-subtle)' }}>
      {categories.map((cat) => (
        <div
          key={cat}
          className={`flex items-center gap-2 ${mobile ? 'py-3.5' : 'py-2'}`}
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
                  if (e.key === 'Enter') onConfirmEdit();
                  if (e.key === 'Escape') onCancelEdit();
                }}
                className={`flex-1 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 ${mobile ? 'text-base' : 'text-sm'}`}
                style={inputStyle}
              />
              <button type="button" onClick={onConfirmEdit}
                disabled={!editValue.trim() || editValue.trim() === cat}
                className="p-1.5 rounded-lg bg-black text-white disabled:opacity-30 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors">
                <IonIcon name="checkmark-outline" size={mobile ? 16 : 13} />
              </button>
              <button type="button" onClick={onCancelEdit}
                className="p-1.5 rounded-lg transition-colors hover:opacity-70"
                style={{ color: 'var(--c-text-faint)' }}>
                <IonIcon name="close-outline" size={mobile ? 16 : 13} />
              </button>
            </>
          ) : (
            <>
              <span className={`flex-1 flex items-center gap-2 ${mobile ? 'text-base' : 'text-sm'}`}
                style={{ color: 'var(--c-text-secondary)' }}>
                <IonIcon name={getCategoryIcon(cat)} size={mobile ? 18 : 13}
                  style={{ color: 'var(--c-text-faint)' }} className="flex-shrink-0" />
                {cat}
              </span>
              <button type="button" onClick={() => onStartEdit(cat)}
                className={`${mobile ? 'p-2' : 'p-1'} rounded transition-colors hover:opacity-70`}
                style={{ color: 'var(--c-text-faint)' }} aria-label={`Renombrar ${cat}`}>
                <IonIcon name="pencil-outline" size={mobile ? 16 : 13} />
              </button>
              <button type="button" onClick={() => onDelete(cat)}
                className={`${mobile ? 'p-2' : 'p-1'} rounded text-red-400 hover:text-red-600 transition-colors`}
                aria-label={`Eliminar ${cat}`}>
                <IonIcon name="trash-outline" size={mobile ? 16 : 13} />
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

interface CatAddRowProps {
  newName: string;
  setNewName: (v: string) => void;
  onAdd: () => void;
}
function CatAddRow({ newName, setNewName, onAdd }: CatAddRowProps) {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Ej: Viajes"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onAdd(); }}
        className={inputCls}
        style={inputStyle}
      />
      <button
        type="button"
        onClick={onAdd}
        disabled={!newName.trim()}
        className="px-3 py-2 text-sm bg-black text-white rounded-lg disabled:opacity-30 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
      >
        <IonIcon name="add-outline" size={14} />
      </button>
    </div>
  );
}

// ── DateCell ───────────────────────────────────────────────────────────────
function DateCell({ dateStr, formatDate }: { dateStr: string; formatDate: (d: string) => string }) {
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
        {formatDate(dateStr)}
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
  const { fmt, formatDate } = usePrefs();
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
  const [modalLeaving, setModalLeaving] = useState(false);
  const [catManagerLeaving, setCatManagerLeaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [conceptEditing, setConceptEditing] = useState(false);
  const conceptInputRef = useRef<HTMLInputElement>(null);

  // ── Swipe-to-dismiss (touch) ───────────────────────────────────────────
  const sheetRef = useRef<HTMLDivElement>(null);
  const swipeTouchY = useRef<number | null>(null);
  const [swipeDelta, setSwipeDelta] = useState(0);

  function onSheetTouchStart(e: React.TouchEvent) {
    // Only initiate swipe from the drag-handle zone (first 64px from top of sheet)
    const sheetTop = sheetRef.current?.getBoundingClientRect().top ?? 0;
    if (e.touches[0].clientY - sheetTop > 64) return;
    swipeTouchY.current = e.touches[0].clientY;
  }

  function onSheetTouchMove(e: React.TouchEvent) {
    if (swipeTouchY.current === null) return;
    const delta = Math.max(0, e.touches[0].clientY - swipeTouchY.current);
    setSwipeDelta(delta);
  }

  function onSheetTouchEnd() {
    if (swipeTouchY.current === null) return;
    swipeTouchY.current = null;
    if (swipeDelta > 80) {
      setSwipeDelta(0);
      dismissModal();
    } else {
      setSwipeDelta(0);
    }
  }

  const [catManagerOpen, setCatManagerOpen] = useState(false);

  function openCatManager() {
    setCatManagerLeaving(false);
    setCatManagerOpen(true);
  }

  function closeCatManager() {
    setCatManagerLeaving(true);
    setTimeout(() => { setCatManagerOpen(false); setCatManagerLeaving(false); }, 290);
  }

  useEffect(() => {
    const state = location.state as { openAdd?: boolean; openCatManager?: boolean } | null;
    if (state?.openAdd) {
      openAdd();
      window.history.replaceState({}, '');
    }
    if (state?.openCatManager) {
      openCatManager();
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

  function dismissModal() {
    setModalLeaving(true);
    setTimeout(() => { setModalOpen(false); setModalLeaving(false); }, 290);
  }

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setConceptEditing(false);
    setModalLeaving(false);
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
    setModalLeaving(false);
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
    dismissModal();
  }

  function handleDelete() {
    if (!editingId) return;
    deleteTransaction(editingId);
    dismissModal();
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
          <IonIcon name="swap-horizontal-outline" size={22} style={{ color: 'var(--c-text-faint)' }} />
          <h1 className="text-2xl font-bold page-title" style={{ color: 'var(--c-text-primary)' }}>
            Ingresos y Gastos
          </h1>
        </div>
        <p className="text-sm ml-8" style={{ color: 'var(--c-text-faint)' }}>
          Registro y seguimiento de todas tus transacciones.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 mb-3">

        {/* Row 1: search + date picker — full width, no wrapping */}
        <div className="flex items-center gap-2">
          {/* Search — takes all remaining space */}
          <div className="flex-1 min-w-0 relative">
            <span className="absolute left-2.5 top-0 bottom-0 flex items-center pointer-events-none">
              <IonIcon
                name="search-outline"
                size={15}
                style={{ color: 'var(--c-text-faint)' }}
              />
            </span>
            <input
              type="text"
              placeholder="Buscar…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`${inputCls} pl-8 pr-3 py-2`}
              style={inputStyle}
            />
          </div>

          {/* Date range — fixed width, never shrinks */}
          <div ref={rangeRef} className="relative shrink-0">
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
              <IonIcon name="calendar-outline" size={14} style={{ color: 'var(--c-text-faint)' }} />
              <span>{DATE_RANGE_LABELS[dateRange]}</span>
              <IonIcon
                name="chevron-down-outline"
                size={13}
                className={`transition-transform duration-150 ${rangeOpen ? 'rotate-180' : ''}`}
                style={{ color: 'var(--c-text-faint)' }}
              />
            </button>
            {rangeOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-20 rounded-xl shadow-lg overflow-hidden py-1 min-w-[160px]"
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
                    {dateRange === key && <IonIcon name="checkmark-outline" size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: filter switch — stretches full width on mobile */}
        {(() => {
          const activeIdx = filterBtns.findIndex(({ key }) => key === filter);
          return (
            <div
              className="relative flex items-center rounded-lg p-0.5"
              style={{
                backgroundColor: 'var(--c-bg-surface)',
                border: '1px solid var(--c-border)',
              }}
            >
              {/* sliding pill */}
              <span
                aria-hidden="true"
                className="absolute top-0.5 bottom-0.5 rounded-md shadow-sm bg-black dark:bg-white transition-all duration-200 ease-in-out"
                style={{
                  width: `calc(${100 / filterBtns.length}% - 2px)`,
                  left: `calc(${activeIdx * (100 / filterBtns.length)}% + 2px)`,
                }}
              />
              {filterBtns.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className="relative z-10 flex flex-1 items-center justify-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors duration-150"
                  style={{ color: filter === key ? undefined : 'var(--c-text-muted)' }}
                >
                  <span className={filter === key ? 'text-white dark:text-black' : ''}>
                    {label}
                  </span>
                  <span
                    className={`text-xs tabular-nums ${filter === key ? 'text-white/60 dark:text-black/50' : ''}`}
                    style={filter !== key ? { color: 'var(--c-text-faint)' } : undefined}
                  >
                    ({counts[key]})
                  </span>
                </button>
              ))}
            </div>
          );
        })()}

      </div>

      {/* Table — desktop */}
      <div
        className="relative rounded-xl shadow-sm overflow-hidden hidden md:block"
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
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">Concepto</th>
                <th className="px-5 py-3">
                  <span className="flex items-center gap-1.5">
                    Categoría
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); openCatManager(); }}
                      className="transition-colors rounded p-0.5 hover:bg-[var(--c-bg-surface-alt)]"
                      style={{ color: 'var(--c-text-muted)' }}
                      aria-label="Gestionar categorías"
                    >
                      <IonIcon name="options-outline" size={12} />
                    </button>
                  </span>
                </th>
                <th className="px-5 py-3">Medio</th>
                <th className="px-5 py-3 text-right">Monto</th>
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
                        <DateCell dateStr={t.date} formatDate={formatDate} />
                      </td>
                      <td className="px-5 py-3 font-medium" style={{ color: 'var(--c-text-primary)' }}>
                        {t.concept}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex items-center gap-1"
                          style={{ color: 'var(--c-text-muted)' }}
                        >
                          <IonIcon name="pricetag-outline" size={11} className="opacity-40" />
                          {t.category}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${MEDIO_STYLES[t.medio]}`}
                        >
                          {MEDIO_LABELS[t.medio]}
                          {cardName && (
                            <span className="opacity-70">· {cardName}</span>
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

      {/* List — mobile */}
      <div className="md:hidden">
        {filtered.length === 0 ? (
          <p className="text-center py-10 text-sm" style={{ color: 'var(--c-text-faint)' }}>
            No se encontraron registros.
          </p>
        ) : (
          <ul>
            {filtered.map((t: Transaction) => {
              const cardName = getCardName(t.cardId);
              const isIncome = t.type === 'income';
              return (
                <li
                  key={t.id}
                  onClick={() => openEdit(t)}
                  className="flex items-center gap-4 py-5 cursor-pointer active:bg-[var(--c-bg-surface-alt)] transition-colors"
                  style={{ borderBottom: '1px solid var(--c-border-subtle)' }}
                >
                  {/* Icon */}
                  <div
                    className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                    style={
                      isIncome
                        ? { backgroundColor: 'rgba(22,163,74,0.12)' }
                        : { backgroundColor: 'var(--c-bg-surface)' }
                    }
                  >
                    <IonIcon
                      name={isIncome ? 'add-circle-outline' : getCategoryIcon(t.category)}
                      size={24}
                      style={{ color: isIncome ? '#16a34a' : 'var(--c-text-muted)' }}
                    />
                  </div>

                  {/* Center: concept + type/medio */}
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium truncate" style={{ color: 'var(--c-text-primary)' }}>
                      {t.concept}
                    </p>
                    <p className="text-sm truncate mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
                      {t.category}
                      {' · '}
                      {MEDIO_LABELS[t.medio]}
                      {cardName ? ` · ${cardName}` : ''}
                    </p>
                  </div>

                  {/* Right: amount + date */}
                  <div className="shrink-0 text-right">
                    <p
                      className="text-base font-semibold"
                      style={{ color: isIncome ? '#16a34a' : 'var(--c-text-primary)' }}
                    >
                      {isIncome ? '+' : ''}{fmt(t.amount)}
                    </p>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--c-text-faint)' }}>
                      {formatShortDate(t.date)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* FABs flotantes — desktop (visible en todas las páginas desde Layout, aquí sólo el handler de acción) */}

      {/* Modal de transacción */}
      {modalOpen && (
        <div
          className={`fixed inset-0 z-[60] modal-overlay ${modalLeaving ? 'overlay-leave' : 'overlay-enter'}
            md:flex md:items-center md:justify-center md:px-4
            flex items-end`}
          onMouseDown={(e) => { if (e.target === e.currentTarget) dismissModal(); }}
        >
          {/* ── Desktop panel ── */}
          <div
            className={`hidden md:block rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto transition-colors duration-300 ${modalLeaving ? 'modal-panel-leave' : 'modal-panel-enter'}`}
            style={{ backgroundColor: 'var(--c-bg-surface)', border: '1px solid var(--c-border)' }}
          >
            {/* Desktop header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 mr-3">
                {conceptEditing ? (
                  <input ref={conceptInputRef} type="text" placeholder="Concepto…" value={form.concept}
                    onChange={(e) => setForm({ ...form, concept: e.target.value })}
                    onBlur={() => setConceptEditing(false)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setConceptEditing(false); }}
                    className="w-full pb-1 text-2xl font-bold focus:outline-none bg-transparent"
                    style={{ borderBottom: '2px solid var(--c-text-muted)', color: 'var(--c-text-primary)', fontFamily: '"Times New Roman", Times, serif', fontStyle: 'italic' }}
                    autoFocus />
                ) : (
                  <button type="button"
                    onClick={() => { setConceptEditing(true); setTimeout(() => conceptInputRef.current?.focus(), 0); }}
                    className="group flex items-center gap-2 text-left w-full">
                    <span className="text-2xl font-bold leading-snug break-words"
                      style={{ color: 'var(--c-text-primary)', fontFamily: '"Times New Roman", Times, serif', fontStyle: 'italic' }}>
                      {form.concept || <span style={{ color: 'var(--c-text-faint)', fontWeight: 'normal' }}>{editingId ? 'Sin concepto' : 'Concepto…'}</span>}
                    </span>
                    <IonIcon name="create-outline" size={15} className="flex-shrink-0 transition-colors group-hover:opacity-100 opacity-30" style={{ color: 'var(--c-text-muted)' }} />
                  </button>
                )}
                <p className="text-xs mt-1" style={{ color: 'var(--c-text-faint)' }}>
                  {editingId ? 'Editar Transacción' : 'Nueva Transacción'}
                </p>
              </div>
              <button onClick={dismissModal} className="transition-colors hover:opacity-70 mt-0.5" style={{ color: 'var(--c-text-faint)' }}>
                <IonIcon name="close-outline" size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--c-text-muted)' }}>Fecha</label>
                <DatePicker value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
              </div>
              <div className="hidden"><input type="text" value={form.concept} readOnly tabIndex={-1} /></div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--c-text-muted)' }}>Categoría</label>
                <CategoryPicker value={form.category} onChange={(val) => setForm({ ...form, category: val })} categories={categories} onAddCategory={(name) => addCategory(name)} />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--c-text-muted)' }}>Tipo</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TransactionType })} className={inputCls} style={inputStyle}>
                    <option value="income">Ingreso</option>
                    <option value="expense">Gasto</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--c-text-muted)' }}>Monto (MXN)</label>
                  <input type="number" min="0" placeholder="0" value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 transition-colors ${form.type === 'income' ? 'border-green-300 bg-green-50 text-green-700 focus:ring-green-400 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700/50' : 'border-red-300 bg-red-50 text-red-700 focus:ring-red-400 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700/50'}`}
                    style={{ border: undefined }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--c-text-muted)' }}>Medio de pago</label>
                <select value={form.medio} onChange={(e) => handleMedioChange(e.target.value as PaymentMedio)} className={inputCls} style={inputStyle}>
                  <option value="cash">Efectivo</option>
                  <option value="debit">Débito</option>
                  <option value="credit">Crédito</option>
                  <option value="promise">Promesa</option>
                </select>
              </div>
              {needsCard && (
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--c-text-muted)' }}>Tarjeta</label>
                  <CardPicker value={form.cardId} onChange={(id) => setForm({ ...form, cardId: id })} cards={creditCards} />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-6">
              {editingId ? (
                <button onClick={handleDelete} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" aria-label="Eliminar transacción">
                  <IonIcon name="trash-outline" size={16} />
                </button>
              ) : <span />}
              <div className="flex gap-3">
                <button onClick={dismissModal} className="px-4 py-2 text-sm rounded-lg transition-colors hover:bg-[var(--c-bg-surface-alt)]"
                  style={{ border: '1px solid var(--c-border)', color: 'var(--c-text-muted)' }}>
                  Cancelar
                </button>
                <button onClick={handleSubmit} className="flex items-center gap-2 px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors">
                  <IonIcon name="checkmark-outline" size={15} />
                  {editingId ? 'Guardar' : 'Añadir'}
                </button>
              </div>
            </div>
          </div>

          {/* ── Mobile bottom-sheet ── */}
          <div
            ref={sheetRef}
            className={`md:hidden w-full flex flex-col transition-colors duration-300
              rounded-t-3xl shadow-2xl max-h-[93vh] ${modalLeaving ? 'sheet-leave' : 'sheet-enter'}`}
            style={{
              backgroundColor: 'var(--c-bg-surface)',
              borderTop: '1px solid var(--c-border)',
              transform: swipeDelta > 0 ? `translateY(${swipeDelta}px)` : undefined,
              opacity: swipeDelta > 0 ? Math.max(0.5, 1 - swipeDelta / 300) : undefined,
              transition: swipeDelta > 0 ? 'none' : undefined,
            }}
            onTouchStart={onSheetTouchStart}
            onTouchMove={onSheetTouchMove}
            onTouchEnd={onSheetTouchEnd}
          >
            {/* drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--c-border)' }} />
            </div>

            {/* header */}
            <div className="flex items-center gap-3 px-5 pt-3 pb-4 shrink-0">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: form.type === 'income' ? 'rgba(22,163,74,0.12)' : 'var(--c-bg-surface-alt)',
                }}
              >
                <IonIcon
                  name={form.type === 'income' ? 'trending-up-outline' : 'trending-down-outline'}
                  size={22}
                  style={{ color: form.type === 'income' ? '#16a34a' : 'var(--c-text-muted)' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold truncate" style={{ color: 'var(--c-text-primary)' }}>
                  {editingId ? 'Editar transacción' : 'Nueva transacción'}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--c-text-faint)' }}>
                  {form.type === 'income' ? 'Ingreso' : 'Gasto'}
                  {form.category ? ` · ${form.category}` : ''}
                </p>
              </div>
              <button
                onClick={dismissModal}
                className="w-9 h-9 flex items-center justify-center rounded-full shrink-0 transition-colors"
                style={{ backgroundColor: 'var(--c-bg-surface-alt)', color: 'var(--c-text-muted)' }}
              >
                <IonIcon name="close-outline" size={20} />
              </button>
            </div>

            {/* scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 pb-2">

              {/* Concepto */}
              <div className="mb-4">
                <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-muted)' }}>
                  <IonIcon name="text-outline" size={12} /> Concepto
                </label>
                {conceptEditing ? (
                  <input ref={conceptInputRef} type="text" placeholder="Concepto…" value={form.concept}
                    onChange={(e) => setForm({ ...form, concept: e.target.value })}
                    onBlur={() => setConceptEditing(false)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setConceptEditing(false); }}
                    className={`${inputCls} text-base`} style={inputStyle} autoFocus />
                ) : (
                  <button type="button"
                    onClick={() => { setConceptEditing(true); setTimeout(() => conceptInputRef.current?.focus(), 0); }}
                    className="w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left transition-colors"
                    style={{ border: '1px solid var(--c-border)', backgroundColor: 'var(--c-bg-page)' }}>
                    <span className="text-base truncate" style={{ color: form.concept ? 'var(--c-text-primary)' : 'var(--c-text-faint)' }}>
                      {form.concept || 'Escribe el concepto…'}
                    </span>
                    <IonIcon name="create-outline" size={16} style={{ color: 'var(--c-text-faint)' }} className="shrink-0" />
                  </button>
                )}
              </div>

              {/* Tipo (toggle pills) */}
              <div className="mb-4">
                <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-muted)' }}>
                  <IonIcon name="swap-vertical-outline" size={12} /> Tipo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {([['expense', 'Gasto', 'trending-down-outline'], ['income', 'Ingreso', 'trending-up-outline']] as const).map(([val, label, icon]) => (
                    <button key={val} type="button"
                      onClick={() => setForm({ ...form, type: val })}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={form.type === val
                        ? { backgroundColor: val === 'income' ? 'rgba(22,163,74,0.15)' : 'rgba(239,68,68,0.12)', color: val === 'income' ? '#16a34a' : '#dc2626', border: `1.5px solid ${val === 'income' ? 'rgba(22,163,74,0.4)' : 'rgba(239,68,68,0.3)'}` }
                        : { backgroundColor: 'var(--c-bg-page)', color: 'var(--c-text-muted)', border: '1.5px solid var(--c-border)' }}>
                      <IonIcon name={icon} size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monto */}
              <div className="mb-4">
                <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-muted)' }}>
                  <IonIcon name="cash-outline" size={12} /> Monto (MXN)
                </label>
                <input type="number" min="0" placeholder="0" value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className={`w-full rounded-xl px-4 py-3 text-xl font-bold focus:outline-none focus:ring-2 transition-colors ${
                    form.type === 'income'
                      ? 'border-green-300 bg-green-50 text-green-700 focus:ring-green-400 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700/50'
                      : 'border-red-300 bg-red-50 text-red-700 focus:ring-red-400 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700/50'
                  }`}
                  style={{ border: undefined }} />
              </div>

              {/* Fecha */}
              <div className="mb-4">
                <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-muted)' }}>
                  <IonIcon name="calendar-outline" size={12} /> Fecha
                </label>
                <DatePicker value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
              </div>

              {/* Categoría */}
              <div className="mb-4">
                <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-muted)' }}>
                  <IonIcon name="pricetag-outline" size={12} /> Categoría
                </label>
                <CategoryPicker value={form.category}
                  onChange={(val) => setForm({ ...form, category: val })}
                  categories={categories} onAddCategory={(name) => addCategory(name)} />
              </div>

              {/* Medio */}
              <div className="mb-4">
                <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-muted)' }}>
                  <IonIcon name="wallet-outline" size={12} /> Medio de pago
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ['cash',    'Efectivo',  'cash-outline'],
                    ['debit',   'Débito',    'card-outline'],
                    ['credit',  'Crédito',   'card-outline'],
                    ['promise', 'Promesa',   'handshake-outline'],
                  ] as const).map(([val, label, icon]) => (
                    <button key={val} type="button"
                      onClick={() => handleMedioChange(val)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={form.medio === val
                        ? { backgroundColor: 'var(--c-text-primary)', color: 'var(--c-bg-surface)', border: '1.5px solid transparent' }
                        : { backgroundColor: 'var(--c-bg-page)', color: 'var(--c-text-muted)', border: '1.5px solid var(--c-border)' }}>
                      <IonIcon name={icon} size={15} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tarjeta */}
              {needsCard && (
                <div className="mb-4">
                  <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-muted)' }}>
                    <IonIcon name="card-outline" size={12} /> Tarjeta
                  </label>
                  <CardPicker value={form.cardId} onChange={(id) => setForm({ ...form, cardId: id })} cards={creditCards} />
                </div>
              )}
            </div>

            {/* footer sticky */}
            <div className="shrink-0 px-5 pt-3 pb-8 flex items-center gap-3"
              style={{ borderTop: '1px solid var(--c-border-subtle)' }}>
              {editingId && (
                <button onClick={handleDelete}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium text-red-500 transition-colors"
                  style={{ border: '1.5px solid rgba(239,68,68,0.25)', backgroundColor: 'rgba(239,68,68,0.06)' }}>
                  <IonIcon name="trash-outline" size={16} />
                  Eliminar
                </button>
              )}
              <button onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors">
                <IonIcon name={editingId ? 'save-outline' : 'add-circle-outline'} size={18} />
                {editingId ? 'Guardar cambios' : 'Añadir transacción'}
              </button>
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
          onClose={closeCatManager}
          leaving={catManagerLeaving}
        />
      )}
    </div>
  );
}
