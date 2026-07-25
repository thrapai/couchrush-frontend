import { Link, TextField, Typography } from '@mui/material';
import { type RegisterRequest, getApiErrorMessage } from '@couchrush/api-client';
import { useAuth } from '@couchrush/auth';
import { AuthFormCard } from '@couchrush/ui';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export function RegisterPage() {
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
