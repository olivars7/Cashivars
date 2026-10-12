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
import DarkModeToggle from './DarkModeToggle';

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
    <aside
      className="hidden md:flex flex-col w-52 h-screen fixed inset-y-0 left-0 z-50 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--c-bg-surface)',
        borderRight: '1px solid var(--c-border)',
        color: 'var(--c-text-muted)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-5 py-5"
        style={{ borderBottom: '1px solid var(--c-border)' }}
      >
        <Wallet style={{ color: 'var(--c-text-primary)' }} size={20} />
        <span className="font-bold text-lg" style={{ color: 'var(--c-text-primary)' }}>
          Cashivars
        </span>
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
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'hover:bg-[var(--c-bg-surface-alt)]',
              ].join(' ')
            }
            style={({ isActive }) => ({
              color: isActive ? undefined : 'var(--c-text-muted)',
            })}
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
      <div
        className="px-2.5 py-4 flex flex-col gap-2"
        style={{ borderTop: '1px solid var(--c-border)' }}
      >
        {/* Dark mode toggle */}
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-xs font-medium" style={{ color: 'var(--c-text-faint)' }}>
            Apariencia
          </span>
          <DarkModeToggle />
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 w-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          style={{ color: 'var(--c-text-muted)' }}
        >
          <RotateCcw size={14} />
          Restablecer datos
        </button>
        <p className="text-xs px-3" style={{ color: 'var(--c-text-faint)' }}>
          Cashivars v1.0
        </p>
      </div>
    </aside>
  );
}
