import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import IonIcon from './IonIcon';

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',     icon: 'grid-outline'      },
  { to: '/transactions', label: 'Transacciones', icon: 'receipt-outline'   },
  { to: '/cards',        label: 'Tarjetas',       icon: 'card-outline'      },
  { to: '/analytics',   label: 'Analíticas',    icon: 'pie-chart-outline' },
  { to: '/debts',        label: 'Deudas',         icon: 'cash-outline'      },
];

export default function TopbarMobile() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Topbar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <IonIcon name="wallet-outline" size={20} className="text-black" />
          <span className="text-black font-bold text-lg">Cashivars</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-gray-400 hover:text-gray-900 transition-colors"
          aria-label="Abrir menú"
        >
          <IonIcon name="menu-outline" size={22} />
        </button>
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 modal-overlay"
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
            <IonIcon name="wallet-outline" size={20} className="text-black" />
            <span className="text-black font-bold text-lg">Cashivars</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-900"
            aria-label="Cerrar menú"
          >
            <IonIcon name="close-outline" size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 mt-4 px-3">
          {navItems.map(({ to, label, icon }) => (
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
              <IonIcon name={icon} size={18} className="flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}
