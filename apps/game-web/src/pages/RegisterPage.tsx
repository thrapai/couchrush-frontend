import { Link, TextField, Typography } from '@mui/material';
import { type RegisterRequest, getApiErrorMessage } from '@couchrush/api-client';
import { useAuth } from '@couchrush/auth';
import { useTranslation } from '@couchrush/i18n';
import { AuthFormCard } from '@couchrush/ui';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export function RegisterPage() {
  const { t } = useTranslation(['player', 'common']);
  const { client } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterRequest) => client.register(payload),
    onSuccess: async (_, payload) => {
      setErrorMessage(null);
      navigate('/', {
        replace: true,
        state: {
          registeredEmail: payload.email,
          registrationMessage: t('player.home.registrationSuccess'),
        },
      });
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, t('player.home.registrationFailed')));
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

  return (
    <AuthFormCard
      title={t('player.home.registerTitle')}
      subtitle={t('player.home.registerSubtitle')}
      submitLabel={t('common:common.auth.register')}
      isSubmitting={registerMutation.isPending}
      errorMessage={errorMessage}
      footer={
        <Typography color="text.secondary">
          {t('player.home.alreadyHaveAccount')}{' '}
          <Link component={RouterLink} to="/" underline="hover">
            {t('player.home.loginTitle')}
          </Link>
        </Typography>
      }
      onSubmit={handleSubmit}
    >
      <TextField
        size="small"
        label={t('common:common.auth.displayName')}
        autoComplete="nickname"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        disabled={registerMutation.isPending}
      />
      <TextField
        size="small"
        label={t('common:common.auth.email')}
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={registerMutation.isPending}
        required
      />
      <TextField
        size="small"
        label={t('common:common.auth.password')}
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
