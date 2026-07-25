import '@fontsource/bungee/400.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import CssBaseline from '@mui/material/CssBaseline';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { ThemeProvider } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { couchRushTheme } from './theme';

export interface CouchRushThemeProviderProps {
  children: ReactNode;
  defaultMode?: 'light' | 'dark' | 'system';
}

export function CouchRushThemeProvider({
  children,
  defaultMode = 'dark',
}: CouchRushThemeProviderProps) {
  return (
    <>
      <InitColorSchemeScript attribute="class" defaultMode={defaultMode} />
      <ThemeProvider
        theme={couchRushTheme}
        defaultMode={defaultMode}
        disableTransitionOnChange
        noSsr
      >
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </>
  );
}
