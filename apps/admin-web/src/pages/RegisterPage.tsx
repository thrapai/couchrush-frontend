import { Link, TextField, Typography } from '@mui/material';
import { type RegisterRequest, getApiErrorMessage } from '@couchrush/api-client';
import { useAuth } from '@couchrush/auth';
import { useTranslation } from '@couchrush/i18n';
import { AuthFormCard } from '@couchrush/ui';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export function RegisterPage() {
  const { t } = useTranslation(['common', 'admin']);
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
      navigate('/login', {
        replace: true,
        state: {
          registeredEmail: payload.email,
          registrationMessage: t('admin:admin.auth.registrationSuccess'),
        },
      });
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, t('admin:admin.auth.registrationFailed')));
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
      title={t('admin:admin.auth.registerTitle')}
      subtitle={t('admin:admin.auth.registerSubtitle')}
      submitLabel={t('common:common.auth.register')}
      isSubmitting={registerMutation.isPending}
      errorMessage={errorMessage}
      footer={
        <Typography color="text.secondary">
          {t('admin:admin.auth.alreadyHaveAccount')}{' '}
          <Link component={RouterLink} to="/login" underline="hover">
            {t('admin:admin.auth.signIn')}
          </Link>
        </Typography>
      }
      onSubmit={handleSubmit}
    >
      <TextField
        label={t('common:common.auth.displayName')}
        autoComplete="nickname"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        disabled={registerMutation.isPending}
      />
      <TextField
        label={t('common:common.auth.email')}
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={registerMutation.isPending}
        required
      />
      <TextField
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
