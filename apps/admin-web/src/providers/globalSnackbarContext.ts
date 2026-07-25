import { createContext, useContext } from 'react';

export type SnackbarSeverity = 'success' | 'info' | 'warning' | 'error';

export interface SnackbarPayload {
  message: string;
  severity: SnackbarSeverity;
}

export interface GlobalSnackbarContextValue {
  showSnackbar: (message: SnackbarPayload) => void;
}

export const GlobalSnackbarContext = createContext<GlobalSnackbarContextValue | null>(null);

export function useGlobalSnackbar() {
  const context = useContext(GlobalSnackbarContext);
  if (!context) {
    throw new Error('useGlobalSnackbar must be used within GlobalSnackbarProvider.');
  }

  return context;
}
