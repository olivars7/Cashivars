import { NavLink } from 'react-router-dom';
import {
  Wallet,
  LayoutDashboard,
  Receipt,
  PieChart,
  PiggyBank,
  CreditCard,
  Banknote,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/transactions', label: 'Transacciones', Icon: Receipt },
  { to: '/cards', label: 'Tarjetas', Icon: CreditCard },
  { to: '/analytics', label: 'Analíticas', Icon: PieChart },
  { to: '/savings', label: 'Ahorros', Icon: PiggyBank },
  { to: '/debts', label: 'Deudas', Icon: Banknote },
];

export default function Sidebar() {
  const { resetToDefaults } = useStore();

  function handleReset() {
    resetToDefaults();
    window.location.reload();
  }

  return (
    <aside className="hidden md:flex flex-col w-52 h-screen fixed inset-y-0 left-0 bg-white text-gray-500 border-r border-gray-200 z-50">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-200">
        <Wallet className="text-black" size={20} />
        <span className="text-black font-bold text-lg">Cashivars</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 mt-3 px-2.5 flex-1">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 group',
                isActive
                  ? 'bg-black text-white'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
              ].join(' ')
            }
          >
            <Icon
              size={16}
              className="transition-transform duration-200 group-hover:scale-110 flex-shrink-0"
            />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2.5 py-4 border-t border-gray-200 flex flex-col gap-2">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 w-full"
        >
          <RotateCcw size={14} />
          Restablecer datos
        </button>
        <p className="text-xs text-gray-400 px-3">Cashivars v1.0</p>
      </div>
    </aside>
  );
}
