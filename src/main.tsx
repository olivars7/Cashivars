import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { StoreProvider } from './context/StoreContext';
import { ThemeProvider } from './context/ThemeContext';
import { PrefsProvider } from './context/PrefsContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <PrefsProvider>
        <StoreProvider>
          <App />
        </StoreProvider>
      </PrefsProvider>
    </ThemeProvider>
  </StrictMode>,
);
