import { useTheme } from '../context/ThemeContext';
import IonIcon from './IonIcon';

export default function DarkModeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      className="theme-switch"
      onClick={toggle}
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={isDark ? 'Tema claro' : 'Tema oscuro'}
    >
      <span className="icon-sun" aria-hidden>
        <IonIcon name="sunny-outline" size={18} className="text-amber-500" />
      </span>
      <span className="icon-moon" aria-hidden>
        <IonIcon name="moon-outline" size={18} className="text-indigo-400" />
      </span>
    </button>
  );
}
