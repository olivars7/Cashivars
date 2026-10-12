import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  PiggyBank,
  CreditCard,
  Banknote,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', Icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', Icon: Receipt, label: 'Transacciones' },
  { to: '/cards', Icon: CreditCard, label: 'Tarjetas' },
  { to: '/analytics', Icon: PieChart, label: 'Analíticas' },
  { to: '/savings', Icon: PiggyBank, label: 'Ahorros' },
  { to: '/debts', Icon: Banknote, label: 'Deudas' },
];

export default function BottomBarMobile() {
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 34px)' }}
    >
      <nav
        className="mx-4 mb-2 flex items-center justify-around px-4 transition-colors duration-300"
        style={{
          height: '64px',
          borderRadius: '32px',
          border: '1px solid var(--c-border)',
          backgroundColor: 'var(--c-bg-surface)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)',
        }}
      >
        {navItems.map(({ to, Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              [
                'flex items-center justify-center transition-colors duration-150',
                isActive
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-[var(--c-text-faint)]',
              ].join(' ')
            }
            style={{ width: '44px', height: '44px', borderRadius: '22px' }}
          >
            <Icon size={25} />
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
