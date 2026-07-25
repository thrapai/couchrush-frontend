import { Alert, Snackbar } from '@mui/material';
import { useCallback, useMemo, useState, type PropsWithChildren } from 'react';
import {
  GlobalSnackbarContext,
  type GlobalSnackbarContextValue,
  type SnackbarPayload,
} from './globalSnackbarContext';

interface SnackbarMessage extends SnackbarPayload {
  id: number;
}

export function GlobalSnackbarProvider({ children }: PropsWithChildren) {
  const [queue, setQueue] = useState<SnackbarMessage[]>([]);

  const showSnackbar = useCallback((message: SnackbarPayload) => {
    setQueue((current) => [...current, { ...message, id: Date.now() + current.length }]);
  }, []);

  const currentMessage = queue[0] ?? null;

  const value = useMemo<GlobalSnackbarContextValue>(
    () => ({
      showSnackbar,
    }),
    [showSnackbar],
  );

  return (
    <GlobalSnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        key={currentMessage?.id}
        open={Boolean(currentMessage)}
        autoHideDuration={5000}
        onClose={(_, reason) => {
          if (reason === 'clickaway') {
            return;
          }

          setQueue((current) => current.slice(1));
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {currentMessage ? <Alert severity={currentMessage.severity}>{currentMessage.message}</Alert> : <span />}
      </Snackbar>
    </GlobalSnackbarContext.Provider>
  );
}
