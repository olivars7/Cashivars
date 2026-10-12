import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Wallet,
  Menu,
  X,
  LayoutDashboard,
  Receipt,
  PieChart,
  PiggyBank,
  CreditCard,
  Banknote,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/transactions', label: 'Transacciones', Icon: Receipt },
  { to: '/cards', label: 'Tarjetas', Icon: CreditCard },
  { to: '/analytics', label: 'Analíticas', Icon: PieChart },
  { to: '/savings', label: 'Ahorros', Icon: PiggyBank },
  { to: '/debts', label: 'Deudas', Icon: Banknote },
];

export default function TopbarMobile() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Topbar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Wallet className="text-black" size={20} />
          <span className="text-black font-bold text-lg">Cashivars</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-gray-400 hover:text-gray-900 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-52 z-50 bg-white border-r border-gray-200 text-gray-500 transform transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Wallet className="text-black" size={20} />
            <span className="text-black font-bold text-lg">Cashivars</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-900"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 mt-4 px-3">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200',
                  isActive
                    ? 'bg-black text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
                ].join(' ')
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}
