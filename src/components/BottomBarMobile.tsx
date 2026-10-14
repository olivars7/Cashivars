import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import IonIcon from './IonIcon';

const navItems = [
  { to: '/dashboard',    iconOutline: 'grid-outline',        iconFilled: 'grid',         label: 'Dashboard'     },
  { to: '/transactions', iconOutline: 'receipt-outline',     iconFilled: 'receipt',      label: 'Transacciones' },
  { to: '/cards',        iconOutline: 'card-outline',        iconFilled: 'card',         label: 'Tarjetas'      },
  { to: '/analytics',   iconOutline: 'pie-chart-outline',   iconFilled: 'pie-chart',    label: 'Analíticas'    },
  { to: '/settings',    iconOutline: 'settings-outline',    iconFilled: 'settings',     label: 'Configuración' },
];

const SPRING_IN  = 'cubic-bezier(0.34, 1.3, 0.5, 1)';
const SPRING_OUT = 'cubic-bezier(0.4, 0, 0.2, 1)';
const DURATION   = '380ms';
const SLIDE      = 'cubic-bezier(0.4, 0, 0.2, 1)';
const ITEM_H     = 48;
const PAD        = 6;

export default function BottomBarMobile() {
  const { isDark } = useTheme();
  const [expanded, setExpanded]     = useState(false);
  const [itemWidth, setItemWidth]   = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const location  = useLocation();
  const idleRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef    = useRef<HTMLElement>(null);
  const firstRef  = useRef<HTMLAnchorElement>(null);

  const activeIndex = navItems.findIndex(({ to }) => location.pathname.startsWith(to));
  const safeIndex   = activeIndex === -1 ? 0 : activeIndex;

  // Measure using offsetLeft/offsetWidth — relative to the nav container, always accurate
  useEffect(() => {
    const measure = () => {
      if (firstRef.current) {
        setItemWidth(firstRef.current.offsetWidth);
        setItemOffset(firstRef.current.offsetLeft);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (navRef.current) ro.observe(navRef.current);
    return () => ro.disconnect();
  }, []);

  // pillX starts at the first item's offsetLeft, then steps by itemWidth
  const pillX = itemOffset + safeIndex * itemWidth;

  const expand = () => { setExpanded(true); scheduleCollapse(); };
  const scheduleCollapse = () => {
    if (idleRef.current) clearTimeout(idleRef.current);
    idleRef.current = setTimeout(() => setExpanded(false), 2200);
  };

  useEffect(() => {
    const scroller = document.querySelector('main.flex-1') as HTMLElement | null;
    if (!scroller) return;
    const THRESHOLD = 10;
    let last = scroller.scrollTop;
    const onScroll = () => {
      const y = scroller.scrollTop;
      if (y < last - THRESHOLD) expand();
      else if (y > last + THRESHOLD && y > 40) {
        if (idleRef.current) clearTimeout(idleRef.current);
        setExpanded(false);
      }
      last = y;
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { scheduleCollapse(); }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (idleRef.current) clearTimeout(idleRef.current); }, []);

  const ease = expanded ? SPRING_IN : SPRING_OUT;

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}
    >
      <div style={{ width: '100%', marginBottom: '16px', display: 'flex' }}>
        <nav
          ref={navRef}
          aria-label="Primary"
          style={{
            position:             'relative',
            display:              'flex',
            alignItems:           'center',
            width:                '100%',
            padding:              `${PAD}px`,
            borderRadius:         '9999px',
            transform:            expanded ? 'scaleX(1) scaleY(1)' : 'scaleX(0.78) scaleY(0.88)',
            transformOrigin:      'center bottom',
            transition:           `transform ${DURATION} ${ease}`,
            background:           isDark ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.28)',
            border:               isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
            boxShadow:            isDark
              ? 'inset 0 1px 0 rgba(255,255,255,0.04), 0 12px 32px -8px rgba(0,0,0,0.25)'
              : 'inset 0 -1px 0 rgba(0,0,0,0.03), 0 12px 32px -8px rgba(0,0,0,0.10)',
            backdropFilter:       'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
          }}
        >
          {/* Sliding pill — translates to active item using measured width */}
          {itemWidth > 0 && (
            <div
              aria-hidden
              style={{
                position:        'absolute',
                top:             `${PAD}px`,
                left:            0,
                width:           `${itemWidth}px`,
                height:          `${ITEM_H}px`,
                borderRadius:    '9999px',
                backgroundColor: isDark ? 'rgba(130,130,130,0.38)' : 'rgba(0,0,0,0.10)',
                transform:       `translateX(${pillX}px)`,
                transition:      `transform 320ms ${SLIDE}`,
                pointerEvents:   'none',
              }}
            />
          )}

          {navItems.map(({ to, iconOutline, iconFilled, label }, i) => (
            <NavLink
              key={to}
              to={to}
              aria-label={label}
              onClick={expand}
              ref={i === 0 ? firstRef : undefined}
              style={() => ({
                position:       'relative',
                zIndex:         1,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                flex:           '1',
                height:         `${ITEM_H}px`,
                borderRadius:   '9999px',
                userSelect:     'none',
                color: isDark ? '#ffffff' : '#000000',
                transition:     'color 200ms',
              })}
            >
              {({ isActive }) => (
                <IonIcon
                  name={isActive ? iconFilled : iconOutline}
                  size={isActive ? 22 : 20}
                  aria-hidden
                />
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
