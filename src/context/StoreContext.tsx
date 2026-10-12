import { createContext, useContext, type ReactNode } from 'react';
import { useStoreState } from '../hooks/useStore';

type StoreValue = ReturnType<typeof useStoreState>;

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useStoreState();
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>');
  return ctx;
}
