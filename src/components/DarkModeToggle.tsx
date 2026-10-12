import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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
        <Sun size={18} className="text-amber-500" />
      </span>
      <span className="icon-moon" aria-hidden>
        <Moon size={18} className="text-indigo-400" />
      </span>
    </button>
  );
}
