import { useState } from 'react';
import IonIcon from '../components/IonIcon';
import { CreditCard } from '../mocks/mockData';
import { useStore } from '../context/StoreContext';

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

const GRADIENT_OPTIONS = [
  { label: 'Negro', value: 'from-gray-800 to-black' },
  { label: 'Gris oscuro', value: 'from-gray-700 to-gray-950' },
  { label: 'Azul marino', value: 'from-blue-900 to-blue-950' },
  { label: 'Azul', value: 'from-blue-700 to-blue-950' },
  { label: 'Verde oscuro', value: 'from-green-900 to-green-950' },
  { label: 'Morado', value: 'from-purple-700 to-purple-950' },
  { label: 'Morado oscuro', value: 'from-purple-900 to-purple-950' },
  { label: 'Rojo oscuro', value: 'from-red-900 to-red-950' },
];

const EMPTY_FORM = {
  name: '',
  bank: '',
  lastFour: '',
  balance: '',
  network: 'Visa' as 'Visa' | 'Mastercard',
  gradient: 'from-gray-800 to-black',
};

// Shared input classes for modal fields
const inputCls =
  'w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 transition-colors duration-200';

// ── CardPreview ─────────────────────────────────────────────────────────────
interface CardPreviewProps {
  name: string;
  bank: string;
  lastFour: string;
  network: 'Visa' | 'Mastercard';
  gradient: string;
  balance: number;
}

function CardPreview({ name, bank, lastFour, network, gradient, balance }: CardPreviewProps) {
  return (
    <div
      className={`relative w-full h-44 rounded-2xl bg-gradient-to-br ${gradient} text-white p-5 shadow-md flex flex-col justify-between overflow-hidden`}
    >
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-10 w-36 h-36 rounded-full bg-white/5" />

      <div className="relative flex justify-between items-start">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase opacity-80">
            {name || 'Tu Tarjeta'}
          </span>
          <p className="text-[10px] opacity-60 mt-0.5">{bank || 'Banco'}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold tracking-wider opacity-90">{network}</span>
          <p className="text-[10px] mt-0.5 text-blue-300">Débito</p>
        </div>
      </div>

      <div className="relative">
        <p className="text-lg font-mono tracking-widest">
          •••• •••• •••• {lastFour || '0000'}
        </p>
      </div>

      <div className="relative flex justify-between items-end">
        <div>
          <p className="text-[10px] uppercase opacity-70">Saldo Disponible</p>
          <p className="text-base font-semibold text-green-300">{fmt(balance)}</p>
        </div>
      </div>
    </div>
  );
}

export default function Cards() {
  const { creditCards, addCreditCard, editCreditCard, deleteCreditCard } = useStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(card: CreditCard) {
    setEditingId(card.id);
    setForm({
      name: card.name,
      bank: card.bank,
      lastFour: card.lastFour,
      balance: String(card.balance),
      network: card.network,
      gradient: card.gradient,
    });
    setModalOpen(true);
  }

  function handleSubmit() {
    if (!form.name.trim() || !form.bank.trim() || !form.lastFour.trim()) return;
    const balance = parseFloat(form.balance);
    if (isNaN(balance) || balance < 0) return;

    const payload: Omit<CreditCard, 'id'> = {
      name: form.name.trim(),
      bank: form.bank.trim(),
      lastFour: form.lastFour.trim(),
      balance,
      limit: 0,
      cutDate: '',
      paymentDate: '',
      network: form.network,
      type: 'debit',
      gradient: form.gradient,
    };

    if (editingId) {
      editCreditCard(editingId, payload);
    } else {
      addCreditCard(payload);
    }
    setModalOpen(false);
  }

  const deletingCard = deletingCardId
    ? creditCards.find((c) => c.id === deletingCardId) ?? null
    : null;

  function confirmDelete() {
    if (deletingCardId) {
      deleteCreditCard(deletingCardId);
      setDeletingCardId(null);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <IonIcon name="card-outline" size={22} style={{ color: 'var(--c-text-faint)' }} />
            <h1 className="text-2xl font-bold page-title" style={{ color: 'var(--c-text-primary)' }}>
              Tarjetas
            </h1>
          </div>
          <p className="text-sm ml-8" style={{ color: 'var(--c-text-faint)' }}>
            Tus tarjetas de débito registradas.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          <IonIcon name="add-outline" size={16} />
          Nueva Tarjeta
        </button>
      </div>

      {creditCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--c-text-faint)' }}>
          <IonIcon name="card-outline" size={48} className="mb-4 opacity-30" />
          <p className="text-sm">No tienes tarjetas registradas aún.</p>
          <button
            onClick={openAdd}
            className="mt-4 text-sm font-medium hover:underline"
            style={{ color: 'var(--c-text-primary)' }}
          >
            Añadir primera tarjeta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {creditCards.map((card) => (
            <div key={card.id} className="flex flex-col gap-3">
              {/* Visual card */}
              <CardPreview
                name={card.name}
                bank={card.bank}
                lastFour={card.lastFour}
                network={card.network}
                gradient={card.gradient}
                balance={card.balance}
              />

              {/* Info panel below card */}
              <div
                className="rounded-xl p-4 space-y-3 transition-colors duration-300"
                style={{
                  backgroundColor: 'var(--c-bg-surface)',
                  border: '1px solid var(--c-border)',
                }}
              >
                {/* Network + last four */}
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--c-text-muted)' }}>
                  <span
                    className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide"
                    style={{
                      backgroundColor: 'var(--c-bg-surface-alt)',
                      color: 'var(--c-text-secondary)',
                    }}
                  >
                    {card.network}
                  </span>
                  <span style={{ color: 'var(--c-text-faint)' }}>
                    •••• {card.lastFour}
                  </span>
                  <span
                    className="ml-auto font-semibold"
                    style={{ color: 'var(--c-text-primary)' }}
                  >
                    {fmt(card.balance)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => openEdit(card)}
                    className="flex items-center gap-1.5 text-xs transition-colors hover:text-gray-900 dark:hover:text-white"
                    style={{ color: 'var(--c-text-muted)' }}
                  >
                    <IonIcon name="pencil-outline" size={13} />
                    Editar
                  </button>
                  <button
                    onClick={() => setDeletingCardId(card.id)}
                    className="flex items-center gap-1.5 text-xs transition-colors ml-auto"
                    style={{ color: 'var(--c-text-faint)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--c-text-faint)')}
                  >
                    <IonIcon name="trash-outline" size={13} />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ──────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center modal-overlay px-4">
          <div
            className="rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto transition-colors duration-300"
            style={{
              backgroundColor: 'var(--c-bg-surface)',
              border: '1px solid var(--c-border)',
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold" style={{ color: 'var(--c-text-primary)' }}>
                {editingId ? 'Editar Tarjeta' : 'Nueva Tarjeta'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="transition-colors hover:opacity-70"
                style={{ color: 'var(--c-text-faint)' }}
              >
                <IonIcon name="close-outline" size={18} />
              </button>
            </div>

            {/* Live preview */}
            <div className="mb-5">
              <CardPreview
                name={form.name}
                bank={form.bank}
                lastFour={form.lastFour}
                network={form.network}
                gradient={form.gradient}
                balance={parseFloat(form.balance) || 0}
              />
            </div>

            <div className="space-y-4">
              {/* Nombre + Banco */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: 'var(--c-text-muted)' }}
                  >
                    Nombre de la tarjeta
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: BBVA Débito"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputCls}
                    style={{
                      border: '1px solid var(--c-border)',
                      backgroundColor: 'var(--c-bg-page)',
                      color: 'var(--c-text-primary)',
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: 'var(--c-text-muted)' }}
                  >
                    Banco
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: BBVA"
                    value={form.bank}
                    onChange={(e) => setForm({ ...form, bank: e.target.value })}
                    className={inputCls}
                    style={{
                      border: '1px solid var(--c-border)',
                      backgroundColor: 'var(--c-bg-page)',
                      color: 'var(--c-text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Últimos 4 + Red */}
              <div className="flex gap-3">
                <div className="w-36">
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: 'var(--c-text-muted)' }}
                  >
                    Últimos 4 dígitos
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="0000"
                    value={form.lastFour}
                    onChange={(e) =>
                      setForm({ ...form, lastFour: e.target.value.replace(/\D/g, '').slice(0, 4) })
                    }
                    className={inputCls}
                    style={{
                      border: '1px solid var(--c-border)',
                      backgroundColor: 'var(--c-bg-page)',
                      color: 'var(--c-text-primary)',
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: 'var(--c-text-muted)' }}
                  >
                    Red
                  </label>
                  <select
                    value={form.network}
                    onChange={(e) =>
                      setForm({ ...form, network: e.target.value as 'Visa' | 'Mastercard' })
                    }
                    className={inputCls}
                    style={{
                      border: '1px solid var(--c-border)',
                      backgroundColor: 'var(--c-bg-page)',
                      color: 'var(--c-text-primary)',
                    }}
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                  </select>
                </div>
              </div>

              {/* Saldo disponible */}
              <div>
                <label
                  className="block text-xs font-medium mb-1"
                  style={{ color: 'var(--c-text-muted)' }}
                >
                  Saldo disponible (MXN)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.balance}
                  onChange={(e) => setForm({ ...form, balance: e.target.value })}
                  className={inputCls}
                  style={{
                    border: '1px solid var(--c-border)',
                    backgroundColor: 'var(--c-bg-page)',
                    color: 'var(--c-text-primary)',
                  }}
                />
              </div>

              {/* Color */}
              <div>
                <label
                  className="block text-xs font-medium mb-2"
                  style={{ color: 'var(--c-text-muted)' }}
                >
                  Color de la tarjeta
                </label>
                <div className="flex flex-wrap gap-2">
                  {GRADIENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, gradient: opt.value })}
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${opt.value} border-2 transition-all ${
                        form.gradient === opt.value ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      title={opt.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
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
                className="flex items-center gap-2 px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                <IonIcon name="checkmark-outline" size={15} />
                {editingId ? 'Guardar Cambios' : 'Añadir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────────────────── */}
      {deletingCard && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center modal-overlay px-4">
          <div
            className="rounded-2xl shadow-xl w-full max-w-sm p-6 transition-colors duration-300"
            style={{
              backgroundColor: 'var(--c-bg-surface)',
              border: '1px solid var(--c-border)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}
              >
                <IonIcon name="trash-outline" size={18} style={{ color: '#ef4444' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--c-text-primary)' }}>
                  Eliminar tarjeta
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
                  ¿Eliminar <span className="font-medium" style={{ color: 'var(--c-text-primary)' }}>{deletingCard.name}</span>? Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingCardId(null)}
                className="px-4 py-2 text-sm rounded-lg transition-colors hover:bg-[var(--c-bg-surface-alt)]"
                style={{
                  border: '1px solid var(--c-border)',
                  color: 'var(--c-text-muted)',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
