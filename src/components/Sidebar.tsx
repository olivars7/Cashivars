import { NavLink } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import IonIcon from './IonIcon';

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',     icon: 'grid-outline'        },
  { to: '/transactions', label: 'Transacciones', icon: 'receipt-outline'     },
  { to: '/cards',        label: 'Tarjetas',       icon: 'card-outline'        },
  { to: '/analytics',   label: 'Analíticas',    icon: 'pie-chart-outline'   },
  { to: '/debts',        label: 'Deudas',         icon: 'cash-outline'        },
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
        <IonIcon name="wallet-outline" size={20} style={{ color: 'var(--c-text-primary)' }} />
        <span className="font-bold text-lg" style={{ color: 'var(--c-text-primary)' }}>
          Cashivars
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 mt-3 px-2.5 flex-1">
        {navItems.map(({ to, label, icon }) => (
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
            <IonIcon
              name={icon}
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
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 w-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          style={{ color: 'var(--c-text-muted)' }}
        >
          <IonIcon name="refresh-outline" size={14} />
          Restablecer datos
        </button>
        <p className="text-xs px-3" style={{ color: 'var(--c-text-faint)' }}>
          Cashivars v1.0
        </p>
      </div>
    </aside>
  );
}
