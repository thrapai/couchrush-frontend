import {
  ApiClient,
  ApiError,
  type ApiClientOptions,
  type CurrentUserResponse,
  type LoginRequest,
} from '@couchrush/api-client';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { createContext, type PropsWithChildren, useContext, useMemo, useRef, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  client: ApiClient;
  status: AuthStatus;
  user: CurrentUserResponse | null;
  isSessionExpired: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  authError: unknown;
}

interface AuthProviderProps extends PropsWithChildren {
  apiClientOptions?: Omit<ApiClientOptions, 'getAccessToken' | 'refreshAccessToken'>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.';
export const AUTH_ME_QUERY_KEY = ['auth', 'me'] as const;

export function AuthProvider({ apiClientOptions, children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const accessTokenRef = useRef<string | null>(null);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);
  const didAttemptRestoreRef = useRef(false);
  const hadAuthenticatedSessionRef = useRef(false);

  const refreshClient = useMemo(() => new ApiClient(apiClientOptions), [apiClientOptions]);

  function clearAuthState(queryClientInstance: QueryClient, sessionExpired: boolean) {
    accessTokenRef.current = null;
    setIsSessionExpired(sessionExpired);
    didAttemptRestoreRef.current = true;
    queryClientInstance.setQueryData(AUTH_ME_QUERY_KEY, null);
  }

  async function performRefresh(): Promise<string | null> {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const refreshPromise = (async () => {
      try {
        const refreshed = await refreshClient.refresh();
        accessTokenRef.current = refreshed.access_token;
        setIsSessionExpired(false);
        hadAuthenticatedSessionRef.current = true;
        return refreshed.access_token;
      } catch (error) {
        clearAuthState(
          queryClient,
          error instanceof ApiError && error.status === 401 && hadAuthenticatedSessionRef.current,
        );
        if (error instanceof ApiError && error.status !== 401) {
          throw error;
        }
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = refreshPromise;
    return refreshPromise;
  }

  const client = useMemo(
    () =>
      new ApiClient({
        ...apiClientOptions,
        getAccessToken: () => accessTokenRef.current,
        refreshAccessToken: performRefresh,
      }),
    [apiClientOptions],
  );

  const currentUserQuery = useQuery<CurrentUserResponse | null>({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: async () => {
      let token = accessTokenRef.current;

      if (!token) {
        if (didAttemptRestoreRef.current) {
          return null;
        }

        didAttemptRestoreRef.current = true;
        token = await performRefresh();
        if (!token) {
          return null;
        }
      }

      const tokenClient = new ApiClient({
        ...apiClientOptions,
        getAccessToken: () => token,
      });

      return tokenClient.getCurrentUser();
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const loginMutation: UseMutationResult<void, unknown, LoginRequest> = useMutation({
    mutationFn: async (payload) => {
      const response = await refreshClient.login(payload);
      const token = response.access_token;

      didAttemptRestoreRef.current = true;
      accessTokenRef.current = token;
      setIsSessionExpired(false);
      hadAuthenticatedSessionRef.current = true;

      const tokenClient = new ApiClient({
        ...apiClientOptions,
        getAccessToken: () => token,
      });
      const currentUser = await tokenClient.getCurrentUser();

      queryClient.setQueryData(AUTH_ME_QUERY_KEY, currentUser);
      await queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
    },
    onError: () => {
      accessTokenRef.current = null;
      setIsSessionExpired(false);
    },
  });

  const logoutMutation: UseMutationResult<void, unknown, void> = useMutation({
    mutationFn: async () => {
      await refreshClient.logout();
    },
    onSettled: () => {
      hadAuthenticatedSessionRef.current = false;
      clearAuthState(queryClient, false);
    },
  });

  const status: AuthStatus = currentUserQuery.isPending
    ? 'loading'
    : currentUserQuery.data
      ? 'authenticated'
      : 'unauthenticated';

  const value = useMemo<AuthContextValue>(
    () => ({
      client,
      status,
      user: currentUserQuery.data ?? null,
      isSessionExpired,
      login: async (payload) => {
        await loginMutation.mutateAsync(payload);
      },
      logout: async () => {
        await logoutMutation.mutateAsync();
      },
      isLoggingIn: loginMutation.isPending,
      isLoggingOut: logoutMutation.isPending,
      authError: currentUserQuery.error,
    }),
    [
      client,
      currentUserQuery.data,
      currentUserQuery.error,
      isSessionExpired,
      loginMutation,
      logoutMutation,
      status,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}

export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return null;
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function RedirectIfAuthenticated() {
  const { status } = useAuth();

  if (status === 'loading') {
    return null;
  }

  if (status === 'authenticated') {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export function getSessionExpiredMessage(isSessionExpired: boolean): string | null {
  return isSessionExpired ? SESSION_EXPIRED_MESSAGE : null;
}
