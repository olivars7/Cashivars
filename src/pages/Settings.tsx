import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useStore } from '../context/StoreContext';
import IonIcon from '../components/IonIcon';
import { DEFAULT_CATEGORIES } from '../hooks/useStore';
import { storageGet, storageSet } from '../services/storage';
import { PREF_KEYS, PREFS_CHANGED_EVENT } from '../context/PrefsContext';

const CURRENCIES = ['MXN', 'USD', 'EUR', 'COP', 'ARS', 'CLP', 'PEN'];
const START_PAGES = [
  { value: '/dashboard',    label: 'Dashboard'    },
  { value: '/transactions', label: 'Transacciones' },
  { value: '/analytics',   label: 'Analíticas'   },
  { value: '/cards',        label: 'Tarjetas'      },
];
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];

// ── iOS-style toggle ───────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="flex-shrink-0 relative focus:outline-none"
      style={{
        width: 51,
        height: 31,
        borderRadius: 9999,
        backgroundColor: value ? '#34c759' : 'var(--c-border)',
        transition: 'background-color 0.22s ease',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: value ? 22 : 2,
          width: 27,
          height: 27,
          borderRadius: 9999,
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 6px rgba(0,0,0,0.22)',
          transition: 'left 0.22s cubic-bezier(0.34,1.26,0.64,1)',
        }}
      />
    </button>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────
function Section({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div>
      {label && (
        <p
          className="text-xs font-semibold uppercase tracking-wider px-1 mb-1.5"
          style={{ color: 'var(--c-text-faint)' }}
        >
          {label}
        </p>
      )}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--c-bg-surface)',
          border: '1px solid var(--c-border)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Row types ──────────────────────────────────────────────────────────────
interface BaseRowProps {
  icon: string;
  iconBg: string;
  label: string;
  sublabel?: string;
  last?: boolean;
}

function RowToggle({ icon, iconBg, label, sublabel, last, value, onChange }: BaseRowProps & { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      className="flex items-center gap-3 px-4"
      style={{
        height: sublabel ? 60 : 50,
        borderBottom: last ? 'none' : '1px solid var(--c-border-subtle)',
      }}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBg }}>
        <IonIcon name={icon} size={16} className="text-white" style={{ color: '#fff' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--c-text-primary)' }}>{label}</p>
        {sublabel && <p className="text-xs" style={{ color: 'var(--c-text-faint)' }}>{sublabel}</p>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

function RowSelect({ icon, iconBg, label, sublabel, last, options, value, onChange }: BaseRowProps & { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div
      className="flex items-center gap-3 px-4"
      style={{
        height: sublabel ? 60 : 50,
        borderBottom: last ? 'none' : '1px solid var(--c-border-subtle)',
      }}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBg }}>
        <IonIcon name={icon} size={16} style={{ color: '#fff' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--c-text-primary)' }}>{label}</p>
        {sublabel && <p className="text-xs" style={{ color: 'var(--c-text-faint)' }}>{sublabel}</p>}
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none text-sm font-medium pr-5 pl-1 py-1 rounded-md focus:outline-none cursor-pointer"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--c-text-muted)',
            border: 'none',
          }}
        >
          {options.map((o) => (
            <option key={o} value={o} style={{ backgroundColor: 'var(--c-bg-surface)', color: 'var(--c-text-primary)' }}>
              {o}
            </option>
          ))}
        </select>
        <IonIcon name="chevron-expand-outline" size={12} style={{ color: 'var(--c-text-faint)', position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      </div>
    </div>
  );
}

function RowAction({ icon, iconBg, label, sublabel, last, onClick, destructive, rightText }: BaseRowProps & { onClick: () => void; destructive?: boolean; rightText?: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 w-full text-left transition-colors hover:bg-[var(--c-bg-surface-alt)] active:opacity-70"
      style={{
        height: sublabel ? 60 : 50,
        borderBottom: last ? 'none' : '1px solid var(--c-border-subtle)',
      }}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBg }}>
        <IonIcon name={icon} size={16} style={{ color: '#fff' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: destructive ? '#ef4444' : 'var(--c-text-primary)' }}>{label}</p>
        {sublabel && <p className="text-xs" style={{ color: 'var(--c-text-faint)' }}>{sublabel}</p>}
      </div>
      {rightText && <span className="text-xs" style={{ color: 'var(--c-text-faint)' }}>{rightText}</span>}
      <IonIcon name="chevron-forward-outline" size={14} style={{ color: 'var(--c-text-faint)', flexShrink: 0 }} />
    </button>
  );
}

function RowInput({ icon, iconBg, label, last, value, onChange, type = 'text', placeholder }: BaseRowProps & { value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div
      className="flex items-center gap-3 px-4"
      style={{
        height: 50,
        borderBottom: last ? 'none' : '1px solid var(--c-border-subtle)',
      }}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBg }}>
        <IonIcon name={icon} size={16} style={{ color: '#fff' }} />
      </div>
      <p className="text-sm font-medium w-28 flex-shrink-0" style={{ color: 'var(--c-text-primary)' }}>{label}</p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-sm text-right focus:outline-none bg-transparent"
        style={{ color: 'var(--c-text-muted)' }}
      />
    </div>
  );
}

// ── Category Manager ───────────────────────────────────────────────────────
function CategoryManager() {
  const { categories, addCategory, deleteCategory, renameCategory } = useStore();
  const [newCat, setNewCat] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');

  function handleAdd() {
    const t = newCat.trim();
    if (!t) return;
    addCategory(t);
    setNewCat('');
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Add row */}
      <div
        className="flex items-center gap-2 px-4 rounded-2xl"
        style={{ backgroundColor: 'var(--c-bg-surface)', border: '1px solid var(--c-border)', height: 50 }}
      >
        <IonIcon name="add-circle-outline" size={18} style={{ color: '#34c759', flexShrink: 0 }} />
        <input
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Nueva categoría…"
          className="flex-1 text-sm bg-transparent focus:outline-none"
          style={{ color: 'var(--c-text-primary)' }}
        />
        {newCat.trim() && (
          <button
            onClick={handleAdd}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg"
            style={{ backgroundColor: '#34c759', color: '#fff' }}
          >
            Agregar
          </button>
        )}
      </div>

      {/* List */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--c-bg-surface)', border: '1px solid var(--c-border)' }}>
        {categories.map((cat, i) => (
          <div
            key={cat}
            className="flex items-center gap-3 px-4"
            style={{ height: 48, borderBottom: i < categories.length - 1 ? '1px solid var(--c-border-subtle)' : 'none' }}
          >
            {editing === cat ? (
              <>
                <IonIcon name="pencil-outline" size={15} style={{ color: 'var(--c-text-faint)', flexShrink: 0 }} />
                <input
                  autoFocus
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { renameCategory(cat, editVal); setEditing(null); }
                    if (e.key === 'Escape') setEditing(null);
                  }}
                  className="flex-1 text-sm bg-transparent focus:outline-none"
                  style={{ color: 'var(--c-text-primary)' }}
                />
                <button onClick={() => { renameCategory(cat, editVal); setEditing(null); }} style={{ color: '#34c759' }}>
                  <IonIcon name="checkmark-outline" size={16} />
                </button>
                <button onClick={() => setEditing(null)} style={{ color: '#ef4444' }}>
                  <IonIcon name="close-outline" size={16} />
                </button>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: DEFAULT_CATEGORIES.includes(cat) ? '#9ca3af' : '#3b82f6' }} />
                <span className="flex-1 text-sm" style={{ color: 'var(--c-text-primary)' }}>{cat}</span>
                <button
                  onClick={() => { setEditing(cat); setEditVal(cat); }}
                  className="p-1.5 rounded-lg transition-colors hover:bg-[var(--c-bg-surface-alt)]"
                  style={{ color: 'var(--c-text-faint)' }}
                >
                  <IonIcon name="pencil-outline" size={13} />
                </button>
                {!DEFAULT_CATEGORIES.includes(cat) && (
                  <button
                    onClick={() => deleteCategory(cat)}
                    className="p-1.5 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                    style={{ color: '#ef4444' }}
                  >
                    <IonIcon name="trash-outline" size={13} />
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function Settings() {
  const { isDark, toggle } = useTheme();
  const { categories: _c, resetToDefaults, exportData, importData } = useStore();

  // Prefs state
  const [currency,     setCurrencyRaw]    = useState(() => storageGet(PREF_KEYS.CURRENCY,     'MXN'));
  const [compactNums,  setCompactNumsRaw] = useState(() => storageGet(PREF_KEYS.COMPACT_NUMS, false));
  const [showBalance,  setShowBalanceRaw] = useState(() => storageGet(PREF_KEYS.SHOW_BALANCE, true));
  const [startPage,    setStartPageRaw]   = useState(() => storageGet(PREF_KEYS.START_PAGE,   '/dashboard'));
  const [budgetAlert,  setBudgetAlertRaw] = useState(() => storageGet(PREF_KEYS.BUDGET_ALERT, true));
  const [budgetLimit,  setBudgetLimitRaw] = useState(() => storageGet(PREF_KEYS.BUDGET_LIMIT, ''));
  const [showCents,    setShowCentsRaw]   = useState(() => storageGet(PREF_KEYS.SHOW_CENTS,   false));
  const [dateFormat,   setDateFormatRaw]  = useState(() => storageGet(PREF_KEYS.DATE_FORMAT,  'DD/MM/YYYY'));
  const [showCats,     setShowCats]       = useState(false);

  // Import state
  const [importMsg,    setImportMsg]      = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Persist helpers — write to storage then notify PrefsContext in the same tab
  function set<T>(key: string, setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      storageSet(key, v);
      window.dispatchEvent(new Event(PREFS_CHANGED_EVENT));
    };
  }
  const setCurrency    = set<string>(PREF_KEYS.CURRENCY,     setCurrencyRaw);
  const setCompactNums = set<boolean>(PREF_KEYS.COMPACT_NUMS, setCompactNumsRaw);
  const setShowBalance = set<boolean>(PREF_KEYS.SHOW_BALANCE, setShowBalanceRaw);
  const setStartPage   = set<string>(PREF_KEYS.START_PAGE,   setStartPageRaw);
  const setBudgetAlert = set<boolean>(PREF_KEYS.BUDGET_ALERT, setBudgetAlertRaw);
  const setBudgetLimit = set<string>(PREF_KEYS.BUDGET_LIMIT,  setBudgetLimitRaw);
  const setShowCents   = set<boolean>(PREF_KEYS.SHOW_CENTS,   setShowCentsRaw);
  const setDateFormat  = set<string>(PREF_KEYS.DATE_FORMAT,  setDateFormatRaw);

  // Dismiss import msg after 3s
  useEffect(() => {
    if (!importMsg) return;
    const t = setTimeout(() => setImportMsg(null), 3000);
    return () => clearTimeout(t);
  }, [importMsg]);

  function handleExport() {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `cashivars-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        importData(ev.target?.result as string);
        setImportMsg({ ok: true, text: 'Datos importados correctamente.' });
      } catch {
        setImportMsg({ ok: false, text: 'El archivo no es un JSON válido.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleReset() {
    if (!confirm('¿Restablecer todos los datos a los valores por defecto? Esta acción no se puede deshacer.')) return;
    resetToDefaults();
    window.location.reload();
  }

  const startPageLabels = START_PAGES.map((p) => p.label);
  const startPageLabel  = START_PAGES.find((p) => p.value === startPage)?.label ?? 'Dashboard';

  return (
    <div>
      {/* ── Header — same style as other pages ── */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <IonIcon name="settings-outline" size={22} style={{ color: 'var(--c-text-faint)' }} />
          <h1 className="text-2xl font-bold page-title" style={{ color: 'var(--c-text-primary)' }}>
            Configuración
          </h1>
        </div>
        <p className="text-sm ml-8" style={{ color: 'var(--c-text-faint)' }}>
          Personaliza la app según tus preferencias.
        </p>
      </div>

      <div className="flex flex-col gap-5 pb-4">

        {/* ── APARIENCIA ───────────────────────────── */}
        <Section label="Apariencia">
          <RowToggle
            icon={isDark ? 'moon' : 'sunny'}
            iconBg={isDark ? '#5856d6' : '#ff9500'}
            label="Modo oscuro"
            sublabel="Cambia entre tema claro y oscuro"
            value={isDark}
            onChange={toggle}
          />
          <RowToggle
            icon="eye-off-outline"
            iconBg="#8e8e93"
            label="Ocultar saldo"
            sublabel="Enmascara el balance en el dashboard"
            value={!showBalance}
            onChange={(v) => setShowBalance(!v)}
          />
          <RowToggle
            icon="calculator-outline"
            iconBg="#007aff"
            label="Números compactos"
            sublabel="Ej. $12.5k en lugar de $12,500"
            value={compactNums}
            onChange={setCompactNums}
          />
          <RowToggle
            icon="remove-circle-outline"
            iconBg="#30b0c7"
            label="Mostrar centavos"
            sublabel="Muestra decimales en los montos"
            value={showCents}
            onChange={setShowCents}
            last
          />
        </Section>

        {/* ── PREFERENCIAS ─────────────────────────── */}
        <Section label="Preferencias">
          <RowSelect
            icon="cash-outline"
            iconBg="#34c759"
            label="Moneda"
            options={CURRENCIES}
            value={currency}
            onChange={setCurrency}
          />
          <RowSelect
            icon="calendar-outline"
            iconBg="#ff9f0a"
            label="Formato de fecha"
            options={DATE_FORMATS}
            value={dateFormat}
            onChange={setDateFormat}
          />
          <RowSelect
            icon="home-outline"
            iconBg="#5856d6"
            label="Página de inicio"
            options={startPageLabels}
            value={startPageLabel}
            onChange={(label) => {
              const found = START_PAGES.find((p) => p.label === label);
              if (found) setStartPage(found.value);
            }}
            last
          />
        </Section>

        {/* ── PRESUPUESTO ──────────────────────────── */}
        <Section label="Presupuesto">
          <RowToggle
            icon="notifications-outline"
            iconBg="#ff3b30"
            label="Alerta de presupuesto"
            sublabel="Notifica al superar el límite mensual"
            value={budgetAlert}
            onChange={setBudgetAlert}
          />
          <RowInput
            icon="wallet-outline"
            iconBg="#34c759"
            label="Límite mensual"
            value={budgetLimit}
            onChange={setBudgetLimit}
            type="number"
            placeholder="Sin límite"
            last
          />
        </Section>

        {/* ── CATEGORÍAS ───────────────────────────── */}
        <div>
          <div
            className="flex items-center justify-between px-1 mb-1.5 cursor-pointer"
            onClick={() => setShowCats((v) => !v)}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--c-text-faint)' }}>
              Categorías
            </p>
            <IonIcon
              name={showCats ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={13}
              style={{ color: 'var(--c-text-faint)' }}
            />
          </div>
          {showCats && <CategoryManager />}
          {!showCats && (
            <button
              onClick={() => setShowCats(true)}
              className="w-full rounded-2xl flex items-center gap-3 px-4 transition-colors hover:bg-[var(--c-bg-surface-alt)]"
              style={{ backgroundColor: 'var(--c-bg-surface)', border: '1px solid var(--c-border)', height: 50 }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#007aff' }}>
                <IonIcon name="pricetag-outline" size={16} style={{ color: '#fff' }} />
              </div>
              <span className="flex-1 text-sm font-medium text-left" style={{ color: 'var(--c-text-primary)' }}>
                Gestionar categorías
              </span>
              <IonIcon name="chevron-forward-outline" size={14} style={{ color: 'var(--c-text-faint)' }} />
            </button>
          )}
        </div>

        {/* ── DATOS ────────────────────────────────── */}
        <Section label="Datos">
          <RowAction
            icon="download-outline"
            iconBg="#007aff"
            label="Exportar datos"
            sublabel="Descarga un respaldo en formato JSON"
            onClick={handleExport}
          />
          <RowAction
            icon="cloud-upload-outline"
            iconBg="#5856d6"
            label="Importar datos"
            sublabel="Restaura desde un archivo JSON"
            onClick={() => fileRef.current?.click()}
          />
          <RowAction
            icon="refresh-outline"
            iconBg="#ff3b30"
            label="Restablecer datos"
            sublabel="Borra todo y vuelve a los valores por defecto"
            onClick={handleReset}
            destructive
            last
          />
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </Section>

        {/* Import feedback toast */}
        {importMsg && (
          <div
            className="rounded-2xl px-4 py-3 flex items-center gap-2.5 text-sm font-medium"
            style={{
              backgroundColor: importMsg.ok ? 'rgba(52,199,89,0.12)' : 'rgba(239,68,68,0.12)',
              border: `1px solid ${importMsg.ok ? 'rgba(52,199,89,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: importMsg.ok ? '#16a34a' : '#ef4444',
            }}
          >
            <IonIcon name={importMsg.ok ? 'checkmark-circle-outline' : 'alert-circle-outline'} size={16} />
            {importMsg.text}
          </div>
        )}

        {/* ── ACERCA DE ────────────────────────────── */}
        <Section label="Acerca de">
          <RowAction
            icon="star-outline"
            iconBg="#ff9500"
            label="Valorar la app"
            sublabel="Comparte tu opinión"
            onClick={() => {}}
          />
          <RowAction
            icon="share-social-outline"
            iconBg="#30b0c7"
            label="Compartir Cashivars"
            sublabel="Recomienda la app a tus amigos"
            onClick={() => {}}
          />
          <div
            className="flex items-center gap-3 px-4"
            style={{ height: 50, borderTop: '1px solid var(--c-border-subtle)' }}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
              <img src="/icon.png" alt="Cashivars" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--c-text-primary)' }}>Cashivars</p>
              <p className="text-xs" style={{ color: 'var(--c-text-faint)' }}>Versión 1.0.0</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: 'var(--c-bg-surface-alt)', color: 'var(--c-text-faint)' }}>
              Actualizada
            </span>
          </div>
        </Section>

      </div>
    </div>
  );
}
