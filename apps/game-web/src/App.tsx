import type { ApiClientOptions } from '@couchrush/api-client';
import { AuthProvider } from '@couchrush/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { AppRoutes } from './AppRoutes';
import { RoomSocketFactoryProvider } from './RoomSocketFactoryProvider';
import type { RoomSocketFactory } from './roomSocketFactoryContext';

interface AppProps {
  apiClientOptions?: ApiClientOptions;
  socketFactory?: RoomSocketFactory;
}

export function App({ apiClientOptions: apiClientOptionsProp, socketFactory }: AppProps) {
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
      <AuthProvider apiClientOptions={apiClientOptions}>
        <RoomSocketFactoryProvider createSocketClient={socketFactory}>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </RoomSocketFactoryProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
