import { Checkbox, FormControlLabel, Link, TextField, Typography } from '@mui/material';
import { getApiErrorMessage } from '@couchrush/api-client';
import { getSessionExpiredMessage, useAuth } from '@couchrush/auth';
import { AuthFormCard } from '@couchrush/ui';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  clearRememberedEmail,
  getRememberEmailEnabled,
  getRememberedEmail,
  persistRememberedEmail,
  setRememberEmailEnabled,
} from '../auth/rememberEmail';

type LoginLocationState = {
  from?: { pathname?: string };
  registeredEmail?: string;
  registrationMessage?: string;
} | null;

export function LoginPage() {
  const { login, isSessionExpired, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LoginLocationState;
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
        persistRememberedEmail(email);
      } else {
        clearRememberedEmail();
      }

      await login({ email, password });
      navigate(from, { replace: true });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Sign-in failed.'));
    }
  }

  useEffect(() => {
    setRememberEmailEnabled(rememberMe);
  }, [rememberMe]);

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
        control={<Checkbox checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} disabled={isLoggingIn} />}
        label="Remember email"
      />
    </AuthFormCard>
  );
}
