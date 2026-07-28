import {
  Alert,
  Box,
  Button,
  Chip,
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
import { useMutation, useQuery } from '@tanstack/react-query';
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
import { loadStoredRoomSessionForCode, saveStoredRoomSession } from '../lib/roomSession';

type HostMode = 'host-player' | 'host-only';
type RoomVisibility = 'public' | 'private';
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
  const [roomCode, setRoomCode] = useState('');
  const [hostMode, setHostMode] = useState<HostMode>('host-player');
  const [roomVisibility, setRoomVisibility] = useState<RoomVisibility>('private');
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

  const publicRoomsQuery = useQuery({
    queryKey: ['publicRooms'],
    queryFn: () => client.listPublicRooms(),
  });

  function navigateToStoredRoomSession(roomCodeToCheck: string) {
    const storedSession = loadStoredRoomSessionForCode(roomCodeToCheck);
    if (!storedSession) {
      return false;
    }

    void navigate(`/room/${storedSession.room_code}`);
    return true;
  }

  const createRoomMutation = useMutation({
    mutationFn: async () => {
      const trimmedDisplayName = displayName.trim();
      if (!trimmedDisplayName) {
        throw new Error(t('player.form.displayNameRequired'));
      }

      return client.createRoom({
        display_name: trimmedDisplayName,
        participate_as_player: hostMode === 'host-player',
        is_public: roomVisibility === 'public',
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

  const joinMutation = useMutation({
    mutationFn: async () => {
      const trimmedDisplayName = displayName.trim();
      const normalizedRoomCode = roomCode.trim().toUpperCase();

      if (!normalizedRoomCode) {
        throw new Error(t('player.form.roomCodeRequired'));
      }

      if (!trimmedDisplayName) {
        throw new Error(t('player.form.displayNameRequired'));
      }

      return client.joinRoom({
        room_code: normalizedRoomCode,
        display_name: trimmedDisplayName,
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

  const joinPublicMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const trimmedDisplayName = displayName.trim();

      if (!trimmedDisplayName) {
        throw new Error(t('player.form.displayNameRequired'));
      }

      return client.joinPublicRoom(roomId, {
        display_name: trimmedDisplayName,
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
              <RadioGroup
                value={roomVisibility}
                onChange={(event) => {
                  setRoomVisibility(event.target.value as RoomVisibility);
                }}
              >
                <FormControlLabel
                  value="private"
                  control={<Radio size="small" />}
                  label={t('player.form.privateRoom')}
                />
                <FormControlLabel
                  value="public"
                  control={<Radio size="small" />}
                  label={t('player.form.publicRoom')}
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
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h5">{t('player.home.joinTitle')}</Typography>
                  <Typography color="text.secondary">{t('player.home.joinSubtitle')}</Typography>
                </Box>
                <TextField
                  size="small"
                  label={t('player.form.roomCode')}
                  value={roomCode}
                  onChange={(event) => {
                    setRoomCode(event.target.value.toUpperCase());
                    setFormError(null);
                  }}
                />
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => {
                    setFormError(null);
                    const normalizedRoomCode = roomCode.trim().toUpperCase();
                    if (navigateToStoredRoomSession(normalizedRoomCode)) {
                      return;
                    }

                    joinMutation.mutate();
                  }}
                  disabled={joinMutation.isPending}
                >
                  {t('player.actions.joinRoom')}
                </Button>
              </Stack>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Stack spacing={1.25}>
                <Box>
                  <Typography variant="h5">{t('player.publicRooms.title')}</Typography>
                  <Typography color="text.secondary">{t('player.publicRooms.subtitle')}</Typography>
                </Box>

                {publicRoomsQuery.isError ? (
                  <Alert severity="error">{getApiErrorMessage(publicRoomsQuery.error)}</Alert>
                ) : null}

                {publicRoomsQuery.isLoading ? (
                  <Typography color="text.secondary">{t('player.publicRooms.loading')}</Typography>
                ) : null}

                {publicRoomsQuery.data?.items.length === 0 ? (
                  <Typography color="text.secondary">{t('player.publicRooms.empty')}</Typography>
                ) : null}

                {publicRoomsQuery.data?.items.map((room) => (
                  <Paper key={room.id} variant="outlined" sx={{ p: 1.5 }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1.25}
                      sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
                    >
                      <Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography sx={{ fontWeight: 700 }}>{room.code}</Typography>
                          <Chip
                            size="small"
                            label={t('player.publicRooms.players', {
                              count: room.player_count,
                              limit: room.player_limit,
                            })}
                          />
                        </Stack>
                        <Typography color="text.secondary">
                          {room.host_display_name ?? t('player.publicRooms.unknownHost')}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setFormError(null);
                          if (navigateToStoredRoomSession(room.code)) {
                            return;
                          }

                          joinPublicMutation.mutate(room.id);
                        }}
                        disabled={joinPublicMutation.isPending}
                      >
                        {t('player.actions.join')}
                      </Button>
                    </Stack>
                  </Paper>
                ))}
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
