import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AuthFormCard } from '@couchrush/ui';
import { LanguageSwitcher, useTranslation } from '@couchrush/i18n';
import { getApiErrorMessage, type LoginRequest } from '@couchrush/api-client';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@couchrush/auth';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  clearRememberedEmail,
  getRememberEmailEnabled,
  getRememberedEmail,
  persistRememberedEmail,
  setRememberEmailEnabled,
} from '../auth/rememberEmail';
import { saveStoredRoomSession } from '../lib/roomSession';

type HostMode = 'host-player' | 'host-only';
type HomeLocationState = {
  registeredEmail?: string;
  registrationMessage?: string;
} | null;

function defaultDisplayName(displayName: string | null | undefined, email: string | undefined) {
  if (displayName?.trim()) {
    return displayName;
  }

  if (email?.includes('@')) {
    return email.split('@')[0];
  }

  return '';
}

export function HomePage() {
  const { t } = useTranslation(['player', 'common', 'host']);
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as HomeLocationState;
  const { client, login, logout, user, status, isLoggingIn, isLoggingOut } = useAuth();
  const [displayName, setDisplayName] = useState(() =>
    defaultDisplayName(user?.display_name ?? null, user?.email),
  );
  const [hostMode, setHostMode] = useState<HostMode>('host-player');
  const [formError, setFormError] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState<LoginRequest>({
    email: locationState?.registeredEmail ?? getRememberedEmail(),
    password: '',
  });
  const [rememberEmail, setRememberEmail] = useState(() => getRememberEmailEnabled());
  const [loginError, setLoginError] = useState<string | null>(null);
  const registrationMessage = locationState?.registrationMessage ?? null;

  useEffect(() => {
    setRememberEmailEnabled(rememberEmail);
  }, [rememberEmail]);

  const createRoomMutation = useMutation({
    mutationFn: async () => {
      const trimmedDisplayName = displayName.trim();
      if (!trimmedDisplayName) {
        throw new Error(t('player.form.displayNameRequired'));
      }

      return client.createRoom({
        display_name: trimmedDisplayName,
        participate_as_player: hostMode === 'host-player',
      });
    },
    onSuccess: (response) => {
      saveStoredRoomSession(response.session);
      void navigate(`/room/${response.session.room_code}`);
    },
    onError: (error) => {
      setFormError(getApiErrorMessage(error));
    },
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) => theme.couchRush.heroGradient,
      }}
    >
      <Stack spacing={2.5} sx={{ width: '100%', maxWidth: 980 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: 'Bungee, sans-serif', fontSize: { xs: '2rem', sm: '2.4rem' } }}>
              {t('player.home.title')}
            </Typography>
            <Typography color="text.secondary">{t('player.home.subtitle')}</Typography>
          </Box>
          <Box sx={{ width: 132 }}>
            <LanguageSwitcher />
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} sx={{ alignItems: 'stretch' }}>
          <Paper sx={{ p: 3, flex: 1 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h5">{t('player.home.createTitle')}</Typography>
                <Typography color="text.secondary">{t('player.home.createSubtitle')}</Typography>
              </Box>
              {formError ? <Alert severity="error">{formError}</Alert> : null}
              <TextField
                size="small"
                label={t('player.form.displayName')}
                value={displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value);
                  setFormError(null);
                }}
              />
              <RadioGroup
                value={hostMode}
                onChange={(event) => {
                  setHostMode(event.target.value as HostMode);
                }}
              >
                <FormControlLabel
                  value="host-player"
                  control={<Radio size="small" />}
                  label={t('player.form.hostAndPlay')}
                />
                <FormControlLabel
                  value="host-only"
                  control={<Radio size="small" />}
                  label={t('player.form.hostOnly')}
                />
              </RadioGroup>
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  setFormError(null);
                  createRoomMutation.mutate();
                }}
                disabled={createRoomMutation.isPending}
              >
                {t('host:host.actions.createRoom')}
              </Button>
            </Stack>
          </Paper>

          <Stack spacing={2.5} sx={{ flex: 1 }}>
            <Paper sx={{ p: 3 }}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="h5">{t('player.home.joinTitle')}</Typography>
                  <Typography color="text.secondary">{t('player.home.joinSubtitle')}</Typography>
                </Box>
                <Button size="small" component={RouterLink} to="/join" variant="outlined">
                  {t('player.actions.joinRoom')}
                </Button>
              </Stack>
            </Paper>

            {status === 'authenticated' ? (
              <Paper sx={{ p: 3 }}>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="h5">{t('player.home.authTitle')}</Typography>
                    <Typography color="text.secondary">{t('player.home.authSubtitle')}</Typography>
                  </Box>
                  <Typography variant="body2">
                    {user?.display_name || user?.email}
                  </Typography>
                  <Button size="small" color="inherit" variant="outlined" onClick={() => void logout()} disabled={isLoggingOut}>
                    {t('common:common.auth.logout')}
                  </Button>
                </Stack>
              </Paper>
            ) : (
              <AuthFormCard
                title={t('player.home.loginTitle')}
                subtitle={t('player.home.loginSubtitle')}
                submitLabel={t('common:common.auth.login')}
                errorMessage={loginError}
                successMessage={registrationMessage}
                isSubmitting={isLoggingIn}
                footer={
                  <Typography color="text.secondary">
                    {t('player.home.needAccount')}{' '}
                    <Link component={RouterLink} to="/register" underline="hover">
                      {t('common:common.auth.register')}
                    </Link>
                  </Typography>
                }
                onSubmit={(event) => {
                  event.preventDefault();
                  setLoginError(null);
                  if (rememberEmail) {
                    persistRememberedEmail(loginForm.email);
                  } else {
                    clearRememberedEmail();
                  }
                  void login(loginForm).catch((error: unknown) => {
                    setLoginError(getApiErrorMessage(error));
                  });
                }}
              >
                <TextField
                  size="small"
                  label={t('common:common.auth.email')}
                  value={loginForm.email}
                  onChange={(event) => {
                    setLoginForm((current) => ({ ...current, email: event.target.value }));
                  }}
                />
                <TextField
                  size="small"
                  type="password"
                  label={t('common:common.auth.password')}
                  value={loginForm.password}
                  onChange={(event) => {
                    setLoginForm((current) => ({ ...current, password: event.target.value }));
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberEmail}
                      onChange={(event) => {
                        setRememberEmail(event.target.checked);
                      }}
                      disabled={isLoggingIn}
                    />
                  }
                  label={t('common:common.auth.rememberEmail')}
                />
              </AuthFormCard>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
