import {
  type CurrentUserResponse,
  ApiClient,
  ApiError,
  type ApiClientOptions,
  type LoginRequest,
} from '@couchrush/api-client';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  client: ApiClient;
  status: AuthStatus;
  user: CurrentUserResponse | null;
  isSessionExpired: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthProviderProps extends PropsWithChildren {
  apiClientOptions?: Omit<ApiClientOptions, 'getAccessToken' | 'refreshAccessToken'>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.';

export function AuthProvider({ apiClientOptions, children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<CurrentUserResponse | null>(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  function clearSession() {
    setAccessToken(null);
    setUser(null);
    setStatus('unauthenticated');
  }

  const client = useMemo(
    () =>
      new ApiClient({
        ...apiClientOptions,
        getAccessToken: () => accessToken,
        refreshAccessToken: async () => {
          if (refreshPromiseRef.current) {
            return refreshPromiseRef.current;
          }

          const refreshPromise = (async () => {
            try {
              const refreshed = await new ApiClient(apiClientOptions).refresh();
              setAccessToken(refreshed.access_token);
              return refreshed.access_token;
            } catch (error) {
              clearSession();
              setIsSessionExpired(true);
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
        },
      }),
    [accessToken, apiClientOptions],
  );

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      setStatus('loading');

      try {
        const refreshed = await new ApiClient(apiClientOptions).refresh();
        if (cancelled) {
          return;
        }

        setAccessToken(refreshed.access_token);

        const currentUser = await new ApiClient({
          ...apiClientOptions,
          getAccessToken: () => refreshed.access_token,
        }).getCurrentUser();

        if (cancelled) {
          return;
        }

        setUser(currentUser);
        setIsSessionExpired(false);
        setStatus('authenticated');
      } catch (error) {
        if (cancelled) {
          return;
        }

        clearSession();
        if (error instanceof ApiError && error.status === 401) {
          setIsSessionExpired(true);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [apiClientOptions]);

  async function login(payload: LoginRequest) {
    setIsSessionExpired(false);

    try {
      const response = await new ApiClient(apiClientOptions).login(payload);
      setAccessToken(response.access_token);

      const currentUser = await new ApiClient({
        ...apiClientOptions,
        getAccessToken: () => response.access_token,
      }).getCurrentUser();

      setUser(currentUser);
      setStatus('authenticated');
    } catch (error) {
      clearSession();
      throw error;
    }
  }

  async function logout() {
    try {
      await new ApiClient(apiClientOptions).logout();
    } finally {
      setIsSessionExpired(false);
      clearSession();
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      client,
      status,
      user,
      isSessionExpired,
      login,
      logout,
    }),
    [client, isSessionExpired, status, user],
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
