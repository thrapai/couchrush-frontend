import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CouchRushThemeProvider } from '@couchrush/theme';
import { initCouchRushI18n } from '@couchrush/i18n';
import { App } from './App';

void initCouchRushI18n().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <CouchRushThemeProvider defaultMode="dark">
        <App />
      </CouchRushThemeProvider>
    </StrictMode>,
  );
});
