import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  Link,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { getApiErrorMessage, type RegisterRequest } from '@couchrush/api-client';
import {
  AuthProvider,
  RedirectIfAuthenticated,
  RequireAuth,
  getSessionExpiredMessage,
  useAuth,
} from '@couchrush/auth';
import { ColorModeToggle } from '@couchrush/theme';
import { ApiError, type ApiClientOptions } from '@couchrush/api-client';
import { AuthFormCard } from '@couchrush/ui';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Link as RouterLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

const REMEMBER_EMAIL_KEY = 'couchrush.admin.remember_email';
const REMEMBER_EMAIL_ENABLED_KEY = 'couchrush.admin.remember_email.enabled';

function getRememberedEmail() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(REMEMBER_EMAIL_KEY) ?? '';
}

function getRememberEmailEnabled() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(REMEMBER_EMAIL_ENABLED_KEY) === 'true';
}

function PageShell() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        <Box
          component="img"
          src="/logo.png"
          alt="Couchrush"
          sx={{ display: 'block', width: 144, maxWidth: '100%', height: 'auto' }}
        />
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
  const locationState = location.state as
    | { from?: { pathname?: string }; registeredEmail?: string; registrationMessage?: string }
    | null;
  const [email, setEmail] = useState(() => locationState?.registeredEmail ?? getRememberedEmail());
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => getRememberEmailEnabled());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sessionExpiredMessage = getSessionExpiredMessage(isSessionExpired);
  const registrationMessage = locationState?.registrationMessage ?? null;

  const from = locationState?.from?.pathname ?? '/admin';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    try {
      if (rememberMe) {
        window.localStorage.setItem(REMEMBER_EMAIL_KEY, email);
        window.localStorage.setItem(REMEMBER_EMAIL_ENABLED_KEY, 'true');
      } else {
        window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
        window.localStorage.removeItem(REMEMBER_EMAIL_ENABLED_KEY);
      }

      await login({ email, password });
      navigate(from, { replace: true });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Sign-in failed.'));
    }
  }

  useEffect(() => {
    if (rememberMe) {
      window.localStorage.setItem(REMEMBER_EMAIL_ENABLED_KEY, 'true');
      return;
    }

    window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
    window.localStorage.removeItem(REMEMBER_EMAIL_ENABLED_KEY);
  }, [rememberMe]);

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <AuthFormCard
      title="Couchrush Admin"
      subtitle="Sign in with your admin account."
      submitLabel="Sign in"
      isSubmitting={isLoggingIn}
      warningMessage={sessionExpiredMessage}
      errorMessage={errorMessage}
      successMessage={registrationMessage}
      footer={
        <Typography color="text.secondary">
          Need an account?{' '}
          <Link component={RouterLink} to="/register" underline="hover">
            Register
          </Link>
        </Typography>
      }
      onSubmit={handleSubmit}
    >
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
      <FormControlLabel
        control={
          <Checkbox
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            disabled={isLoggingIn}
          />
        }
        label="Remember email"
      />
    </AuthFormCard>
  );
}

function RegisterPage() {
  const { client, status } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterRequest) => client.register(payload),
    onSuccess: async (_, payload) => {
      setErrorMessage(null);
      navigate('/login', {
        replace: true,
        state: {
          registeredEmail: payload.email,
          registrationMessage: 'Account created. You can sign in now.',
        },
      });
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, 'Registration failed.'));
    },
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    try {
      await registerMutation.mutateAsync({
        email,
        password,
        display_name: displayName.trim() ? displayName.trim() : null,
      });
    } catch {
      return;
    }
  }

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <AuthFormCard
      title="Create account"
      subtitle="Register a Couchrush account."
      submitLabel="Register"
      isSubmitting={registerMutation.isPending}
      errorMessage={errorMessage}
      footer={
        <Typography color="text.secondary">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" underline="hover">
            Sign in
          </Link>
        </Typography>
      }
      onSubmit={handleSubmit}
    >
      <TextField
        label="Display name"
        autoComplete="nickname"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        disabled={registerMutation.isPending}
      />
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={registerMutation.isPending}
        required
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        disabled={registerMutation.isPending}
        required
      />
    </AuthFormCard>
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
          <Route path="/register" element={<RegisterPage />} />
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
