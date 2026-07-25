import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CouchRushThemeProvider } from '@couchrush/theme';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CouchRushThemeProvider defaultMode="dark">
      <App />
    </CouchRushThemeProvider>
  </StrictMode>,
);
