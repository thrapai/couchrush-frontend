import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@couchrush/auth';
import type { ApiClientOptions } from '@couchrush/api-client';
import { BrowserRouter } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { AppRoutes } from './AppRoutes';
import { GlobalSnackbarProvider } from './providers/GlobalSnackbarProvider';

interface AppProps {
  apiClientOptions?: ApiClientOptions;
}

export function App({ apiClientOptions: apiClientOptionsProp }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      }),
  );
  const apiClientOptions = useMemo(
    () => apiClientOptionsProp ?? { baseUrl: import.meta.env.VITE_API_BASE_URL ?? '' },
    [apiClientOptionsProp],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalSnackbarProvider>
        <AuthProvider apiClientOptions={apiClientOptions}>
          <AppErrorBoundary>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AppErrorBoundary>
        </AuthProvider>
      </GlobalSnackbarProvider>
    </QueryClientProvider>
  );
}
