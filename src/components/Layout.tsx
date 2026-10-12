import { Outlet, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Sidebar from './Sidebar';
import BottomBarMobile from './BottomBarMobile';

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div
      className="h-screen flex flex-col overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: 'var(--c-bg-page)', color: 'var(--c-text-primary)' }}
    >
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 md:pl-52 overflow-y-auto">
          {/* pb: 64px pill + 8px gap + ~34px safe-area = ~106px; use pb-28 (112px) for comfort */}
          <div className="p-6 pb-28 md:pb-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomBarMobile />

      {/* Mobile floating "+" button — top-right, all pages */}
      <button
        onClick={() => navigate('/transactions', { state: { openAdd: true } })}
        className="md:hidden fixed top-3 right-3 z-40 w-11 h-11 rounded-full bg-black text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform duration-150 dark:bg-white dark:text-black"
        aria-label="Nueva transacción"
      >
        <Plus size={20} />
      </button>
    </div>
  );
}
