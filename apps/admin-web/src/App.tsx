import { Alert, Box, Button, CircularProgress, Container, Paper, TextField, Typography } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getApiErrorMessage } from '@couchrush/api-client';
import {
  AuthProvider,
  RedirectIfAuthenticated,
  RequireAuth,
  getSessionExpiredMessage,
  useAuth,
} from '@couchrush/auth';
import { ColorModeToggle } from '@couchrush/theme';
import { ApiError, type ApiClientOptions } from '@couchrush/api-client';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

function PageShell() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <ColorModeToggle />
      </Box>
      <Outlet />
    </Container>
  );
}

function CenteredMessage({ children }: { children: ReactNode }) {
  return (
    <Paper sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{children}</Box>
    </Paper>
  );
}

function LoadingScreen() {
  return (
    <CenteredMessage>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
      <Typography align="center" color="text.secondary">
        Loading session…
      </Typography>
    </CenteredMessage>
  );
}

function LoginPage() {
  const { login, status, isSessionExpired, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sessionExpiredMessage = getSessionExpiredMessage(isSessionExpired);

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/admin';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Sign-in failed.'));
    }
  }

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <CenteredMessage>
      <Typography variant="h4" component="h1">
        Couchrush Admin
      </Typography>
      <Typography color="text.secondary">Sign in with your admin account.</Typography>
      {sessionExpiredMessage ? <Alert severity="warning">{sessionExpiredMessage}</Alert> : null}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isLoggingIn}
          required
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isLoggingIn}
          required
        />
        <Button type="submit" variant="contained" disabled={isLoggingIn}>
          {isLoggingIn ? <CircularProgress color="inherit" size={20} /> : 'Sign in'}
        </Button>
      </Box>
    </CenteredMessage>
  );
}

function AdminPage() {
  const { client, logout, user } = useAuth();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      try {
        await client.checkAdminAccess();
        if (cancelled) {
          return;
        }

        setIsAllowed(true);
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && error.status === 403) {
          setErrorMessage('You are signed in, but you do not have access to the admin portal.');
        } else {
          setErrorMessage(getApiErrorMessage(error, 'Unable to load the admin portal.'));
        }
      } finally {
        if (!cancelled) {
          setIsCheckingAccess(false);
        }
      }
    }

    void checkAccess();

    return () => {
      cancelled = true;
    };
  }, [client]);

  if (isCheckingAccess) {
    return <LoadingScreen />;
  }

  if (!isAllowed) {
    return (
      <CenteredMessage>
        <Alert severity="error">{errorMessage ?? 'You do not have access to this page.'}</Alert>
        <Button variant="outlined" onClick={() => void logout()}>
          Sign out
        </Button>
      </CenteredMessage>
    );
  }

  return (
    <CenteredMessage>
      <Typography variant="h4" component="h1">
        Admin
      </Typography>
      <Typography color="text.secondary">{user?.email}</Typography>
      <Alert severity="success">Authenticated and authorized.</Alert>
      <Button variant="outlined" onClick={() => void logout()}>
        Logout
      </Button>
    </CenteredMessage>
  );
}

function AppRoutes() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route element={<PageShell />}>
        <Route element={<RedirectIfAuthenticated />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}

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
      <AuthProvider apiClientOptions={apiClientOptions}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
