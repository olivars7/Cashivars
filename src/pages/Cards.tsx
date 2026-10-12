import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, CreditCard as CardIcon } from 'lucide-react';
import { CreditCard } from '../mocks/mockData';
import { useStore } from '../context/StoreContext';

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

const GRADIENT_OPTIONS = [
  { label: 'Negro', value: 'from-gray-800 to-black' },
  { label: 'Gris oscuro', value: 'from-gray-700 to-gray-950' },
  { label: 'Azul marino', value: 'from-blue-900 to-blue-950' },
  { label: 'Verde oscuro', value: 'from-green-900 to-green-950' },
  { label: 'Morado', value: 'from-purple-900 to-purple-950' },
  { label: 'Rojo oscuro', value: 'from-red-900 to-red-950' },
];

const EMPTY_FORM = {
  name: '',
  bank: '',
  lastFour: '',
  balance: '',
  limit: '',
  cutDate: '',
  paymentDate: '',
  network: 'Visa' as 'Visa' | 'Mastercard',
  type: 'credit' as 'credit' | 'debit',
  gradient: 'from-gray-800 to-black',
};

export default function Cards() {
  const { creditCards, addCreditCard, editCreditCard, deleteCreditCard } = useStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

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
      limit: String(card.limit),
      cutDate: card.cutDate,
      paymentDate: card.paymentDate,
      network: card.network,
      type: card.type,
      gradient: card.gradient,
    });
    setModalOpen(true);
  }

  function handleSubmit() {
    if (!form.name.trim() || !form.bank.trim() || !form.lastFour.trim()) return;
    const balance = parseFloat(form.balance);
    const limit = parseFloat(form.limit);
    if (isNaN(balance) || isNaN(limit) || limit <= 0) return;

    const payload: Omit<CreditCard, 'id'> = {
      name: form.name.trim(),
      bank: form.bank.trim(),
      lastFour: form.lastFour.trim(),
      balance,
      limit,
      cutDate: form.cutDate,
      paymentDate: form.paymentDate,
      network: form.network,
      type: form.type,
      gradient: form.gradient,
    };

    if (editingId) {
      editCreditCard(editingId, payload);
    } else {
      addCreditCard(payload);
    }
    setModalOpen(false);
  }

  const usedPct = (balance: number, limit: number) =>
    limit > 0 ? Math.min(100, Math.round((balance / limit) * 100)) : 0;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CardIcon size={22} className="text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-900 page-title">Tarjetas</h1>
          </div>
          <p className="text-sm text-gray-400 ml-8">Tus tarjetas de crédito y débito registradas.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nueva Tarjeta
        </button>
      </div>

      {creditCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <CardIcon size={48} className="mb-4 opacity-30" />
          <p className="text-sm">No tienes tarjetas registradas aún.</p>
          <button
            onClick={openAdd}
            className="mt-4 text-sm text-black font-medium hover:underline"
          >
            Añadir primera tarjeta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {creditCards.map((card) => {
            const pct = usedPct(card.balance, card.limit);
            return (
              <div key={card.id} className="flex flex-col gap-3">
                {/* Visual card */}
                <div
                  className={`relative w-full h-44 rounded-2xl bg-gradient-to-br ${card.gradient} text-white p-5 shadow-md flex flex-col justify-between overflow-hidden`}
                >
                  {/* Decorative circles */}
                  <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
                  <div className="absolute -right-2 -bottom-10 w-36 h-36 rounded-full bg-white/5" />

                  <div className="relative flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold tracking-widest uppercase opacity-80">
                        {card.name}
                      </span>
                      <p className="text-[10px] opacity-60 mt-0.5">{card.bank}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold tracking-wider opacity-90">{card.network}</span>
                      <p className={`text-[10px] mt-0.5 ${card.type === 'credit' ? 'text-purple-300' : 'text-blue-300'}`}>
                        {card.type === 'credit' ? 'Crédito' : 'Débito'}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <p className="text-lg font-mono tracking-widest">•••• •••• •••• {card.lastFour}</p>
                  </div>

                  <div className="relative flex justify-between items-end">
                    <div>
                      <p className="text-[10px] uppercase opacity-70">Saldo Usado</p>
                      <p className="text-base font-semibold text-red-300">{fmt(card.balance)}</p>
                      <p className="text-[10px] opacity-60">de {fmt(card.limit)} límite</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase opacity-70">Corte</p>
                      <p className="text-xs font-medium">{card.cutDate}</p>
                    </div>
                  </div>
                </div>

                {/* Info panel below card */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                  {/* Usage bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Uso del crédito</span>
                      <span className={pct >= 80 ? 'text-red-600 font-semibold' : ''}>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-red-500' : pct >= 50 ? 'bg-orange-400' : 'bg-green-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex gap-4 text-xs text-gray-500">
                    <div>
                      <span className="block text-gray-400 uppercase tracking-wide text-[10px]">Fecha de corte</span>
                      <span className="font-medium text-gray-700">{card.cutDate}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400 uppercase tracking-wide text-[10px]">Fecha de pago</span>
                      <span className="font-medium text-gray-700">{card.paymentDate}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => openEdit(card)}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      <Pencil size={13} />
                      Editar
                    </button>
                    <button
                      onClick={() => deleteCreditCard(card.id)}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-600 transition-colors ml-auto"
                    >
                      <Trash2 size={13} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">
                {editingId ? 'Editar Tarjeta' : 'Nueva Tarjeta'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Nombre + Banco */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nombre de la tarjeta</label>
                  <input
                    type="text"
                    placeholder="Ej: BBVA Azul"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Banco</label>
                  <input
                    type="text"
                    placeholder="Ej: BBVA"
                    value={form.bank}
                    onChange={(e) => setForm({ ...form, bank: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>

              {/* Últimos 4 + Red + Tipo */}
              <div className="flex gap-3">
                <div className="w-28">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Últimos 4 dígitos</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="0000"
                    value={form.lastFour}
                    onChange={(e) => setForm({ ...form, lastFour: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Red</label>
                  <select
                    value={form.network}
                    onChange={(e) => setForm({ ...form, network: e.target.value as 'Visa' | 'Mastercard' })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'credit' | 'debit' })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="credit">Crédito</option>
                    <option value="debit">Débito</option>
                  </select>
                </div>
              </div>

              {/* Balance + Límite */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Saldo usado (MXN)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.balance}
                    onChange={(e) => setForm({ ...form, balance: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Límite (MXN)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.limit}
                    onChange={(e) => setForm({ ...form, limit: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>

              {/* Fechas */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de corte</label>
                  <input
                    type="date"
                    value={form.cutDate}
                    onChange={(e) => setForm({ ...form, cutDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de pago</label>
                  <input
                    type="date"
                    value={form.paymentDate}
                    onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Color de la tarjeta</label>
                <div className="flex flex-wrap gap-2">
                  {GRADIENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, gradient: opt.value })}
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${opt.value} border-2 transition-all ${
                        form.gradient === opt.value ? 'border-black scale-110' : 'border-transparent'
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
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800"
              >
                <Check size={15} />
                {editingId ? 'Guardar Cambios' : 'Añadir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
