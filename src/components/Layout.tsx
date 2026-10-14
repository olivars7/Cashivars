import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomBarMobile from './BottomBarMobile';
import IonIcon from './IonIcon';
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggle } = useTheme();

  const isTransactions = location.pathname === '/transactions';
  const isDashboard    = location.pathname === '/dashboard';

  // Shared glass-button style for FABs
  const fabStyle: React.CSSProperties = {
    background:           isDark ? '#2d2d2d'                          : 'rgba(255,255,255,0.28)',
    border:               isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
    boxShadow:            isDark
      ? '0 12px 32px -8px rgba(0,0,0,0.45)'
      : 'inset 0 -1px 0 rgba(0,0,0,0.03), 0 12px 32px -8px rgba(0,0,0,0.10)',
    backdropFilter:       isDark ? 'none' : 'blur(3px)',
    WebkitBackdropFilter: isDark ? 'none' : 'blur(3px)',
    color:                isDark ? '#f1f1f1' : 'rgba(0,0,0,0.75)',
  };

  // "+" is always at right-3; gear/theme FAB sit 4px to its left (w-11=44px → right: 12 + 44 + 4 = 60px)
  const gearRight  = 'right-[60px] md:right-[64px]';
  const themeRight = 'right-[60px] md:right-[64px]';

  return (
    <div
      className="h-screen flex flex-col overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: 'var(--c-bg-page)', color: 'var(--c-text-primary)' }}
    >
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 md:pl-[224px] overflow-y-auto">
          {/* pb: 64px pill + 8px gap + ~34px safe-area = ~106px; use pb-28 (112px) for comfort */}
          <div className="p-6 pb-28 md:pb-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomBarMobile />

      {/* ── FAB cluster ── */}

      {/* Theme toggle FAB — only on /dashboard */}
      {isDashboard && (
        <button
          onClick={toggle}
          className={`fixed top-2.5 ${themeRight} z-40 w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 overflow-hidden`}
          style={fabStyle}
          aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        >
          {/* Sun icon — visible in light mode */}
          <span
            aria-hidden
            style={{
              position:   'absolute',
              transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
              transform:  isDark ? 'scale(0) rotate(90deg)'  : 'scale(1) rotate(0deg)',
              opacity:    isDark ? 0 : 1,
            }}
          >
            <IonIcon name="sunny-outline" size={20} style={{ color: '#f59e0b' }} />
          </span>
          {/* Moon icon — visible in dark mode */}
          <span
            aria-hidden
            style={{
              position:   'absolute',
              transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
              transform:  isDark ? 'scale(1) rotate(0deg)'  : 'scale(0) rotate(-90deg)',
              opacity:    isDark ? 1 : 0,
            }}
          >
            <IonIcon name="moon-outline" size={20} style={{ color: '#818cf8' }} />
          </span>
        </button>
      )}

      {/* Gear button — only on /transactions, flush against the "+" button */}
      {isTransactions && (
        <button
          onClick={() => navigate('/transactions', { state: { openCatManager: true } })}
          className={`fixed top-2.5 ${gearRight} z-40 w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200`}
          style={fabStyle}
          aria-label="Gestionar categorías"
        >
          <IonIcon name="options-outline" size={20} />
        </button>
      )}

      {/* "+" button — all pages */}
      <button
        onClick={() => navigate('/transactions', { state: { openAdd: true } })}
        className="fixed top-2.5 right-3 z-40 w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200"
        style={fabStyle}
        aria-label="Nueva transacción"
      >
        <IonIcon name="add-outline" size={26} />
      </button>
    </div>
  );
}
