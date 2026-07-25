import { Checkbox, FormControlLabel, Link, TextField, Typography } from '@mui/material';
import { getApiErrorMessage } from '@couchrush/api-client';
import { useAuth } from '@couchrush/auth';
import { useTranslation } from '@couchrush/i18n';
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
  const { t } = useTranslation(['common', 'admin']);
  const { login, isSessionExpired, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LoginLocationState;
  const [email, setEmail] = useState(() => locationState?.registeredEmail ?? getRememberedEmail());
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => getRememberEmailEnabled());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sessionExpiredMessage = isSessionExpired ? t('common:common.errors.sessionExpired') : null;
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
      setErrorMessage(getApiErrorMessage(error, t('admin:admin.auth.signInFailed')));
    }
  }

  useEffect(() => {
    setRememberEmailEnabled(rememberMe);
  }, [rememberMe]);

  return (
    <AuthFormCard
      title={t('admin:admin.auth.loginTitle')}
      subtitle={t('admin:admin.auth.loginSubtitle')}
      submitLabel={t('admin:admin.auth.signIn')}
      isSubmitting={isLoggingIn}
      warningMessage={sessionExpiredMessage}
      errorMessage={errorMessage}
      successMessage={registrationMessage}
      footer={
        <Typography color="text.secondary">
          {t('admin:admin.auth.needAccount')}{' '}
          <Link component={RouterLink} to="/register" underline="hover">
            {t('common:common.auth.register')}
          </Link>
        </Typography>
      }
      onSubmit={handleSubmit}
    >
      <TextField
        label={t('common:common.auth.email')}
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={isLoggingIn}
        required
      />
      <TextField
        label={t('common:common.auth.password')}
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        disabled={isLoggingIn}
        required
      />
      <FormControlLabel
        control={<Checkbox checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} disabled={isLoggingIn} />}
        label={t('common:common.auth.rememberEmail')}
      />
    </AuthFormCard>
  );
}
