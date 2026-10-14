import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';
import IonIcon from './IonIcon';

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',     iconOutline: 'grid-outline',      iconFilled: 'grid'      },
  { to: '/transactions', label: 'Transacciones', iconOutline: 'receipt-outline',   iconFilled: 'receipt'   },
  { to: '/cards',        label: 'Tarjetas',       iconOutline: 'card-outline',       iconFilled: 'card'      },
  { to: '/analytics',   label: 'Analíticas',    iconOutline: 'pie-chart-outline', iconFilled: 'pie-chart' },
  { to: '/settings',    label: 'Configuración',  iconOutline: 'settings-outline',  iconFilled: 'settings'  },
];

const SLIDE = 'cubic-bezier(0.4, 0, 0.2, 1)';

export default function Sidebar() {
  const { resetToDefaults } = useStore();
  const { isDark }          = useTheme();
  const location            = useLocation();

  const activeIndex = navItems.findIndex(({ to }) => location.pathname.startsWith(to));
  const safeActive  = activeIndex === -1 ? 0 : activeIndex;

  const [pillY, setPillY] = useState(0);
  const [pillH, setPillH] = useState(0);

  const navRef   = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Measure pill against the active item only
  useEffect(() => {
    const measure = () => {
      const el  = itemRefs.current[safeActive];
      const nav = navRef.current;
      if (!el || !nav) return;
      const navRect = nav.getBoundingClientRect();
      const elRect  = el.getBoundingClientRect();
      setPillY(elRect.top - navRect.top);
      setPillH(elRect.height);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (navRef.current) ro.observe(navRef.current);
    return () => ro.disconnect();
  }, [safeActive]);

  function handleReset() {
    resetToDefaults();
    window.location.reload();
  }

  const glassStyle: React.CSSProperties = {
    background:           isDark ? '#212121'                           : 'rgba(255,255,255,0.28)',
    border:               isDark ? '1px solid rgba(255,255,255,0.08)'  : '1px solid rgba(0,0,0,0.07)',
    boxShadow:            isDark
      ? 'inset 0 1px 0 rgba(255,255,255,0.04), 0 12px 32px -8px rgba(0,0,0,0.35)'
      : 'inset 0 -1px 0 rgba(0,0,0,0.03), 0 12px 32px -8px rgba(0,0,0,0.12)',
    backdropFilter:       isDark ? 'none' : 'blur(18px) saturate(1.6)',
    WebkitBackdropFilter: isDark ? 'none' : 'blur(18px) saturate(1.6)',
  };

  return (
    <aside
      className="hidden md:flex flex-col fixed inset-y-0 left-0 z-50"
      style={{ padding: '12px', width: '224px' }}
    >
      {/* Floating glass panel */}
      <div
        className="flex flex-col flex-1 rounded-2xl overflow-hidden transition-colors duration-300"
        style={{ ...glassStyle, color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)' }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2.5 px-4 py-4"
          style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}
        >
          <img src="/icon.png" alt="Cashivars" className="w-7 h-7 rounded-md object-contain" />
          <span className="font-bold text-base" style={{ color: isDark ? '#ffffff' : '#000000' }}>
            Cashivars
          </span>
        </div>

        {/* Navigation */}
        <nav ref={navRef} className="relative flex flex-col gap-1 mt-2 px-2 flex-1">

          {/* Sliding pill — only tracks active route */}
          {pillH > 0 && (
            <div
              aria-hidden
              style={{
                position:        'absolute',
                left:            '8px',
                right:           '8px',
                height:          `${pillH}px`,
                borderRadius:    '12px',
                backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)',
                transform:       `translateY(${pillY}px)`,
                transition:      `transform 380ms ${SLIDE}`,
                pointerEvents:   'none',
                zIndex:          0,
              }}
            />
          )}

          {navItems.map(({ to, label, iconOutline, iconFilled }, i) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                ref={el => { itemRefs.current[i] = el; }}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
                style={{ zIndex: 1, color: isDark ? '#ffffff' : '#000000' }}
              >
                <IonIcon
                  name={isActive ? iconFilled : iconOutline}
                  size={18}
                  style={{ flexShrink: 0 }}
                />
                <span style={{
                  opacity:    isActive ? 1 : (isDark ? 0.65 : 0.55),
                  transition: 'opacity 200ms',
                }}>
                  {label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="px-2 py-3 flex flex-col gap-1"
          style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}
        >
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-200 w-full hover:bg-red-500/10 hover:text-red-500"
            style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.40)' }}
          >
            <IonIcon name="refresh-outline" size={14} />
            Restablecer datos
          </button>
          <p className="text-xs px-3" style={{ color: isDark ? 'rgba(255,255,255,0.30)' : 'rgba(0,0,0,0.30)' }}>
            Cashivars v1.0
          </p>
        </div>
      </div>
    </aside>
  );
}
