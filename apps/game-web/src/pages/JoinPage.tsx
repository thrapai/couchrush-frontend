import { Alert, Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material';
import { getApiErrorMessage } from '@couchrush/api-client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@couchrush/auth';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { LanguageSwitcher, useTranslation } from '@couchrush/i18n';
import { saveStoredRoomSession } from '../lib/roomSession';

function defaultDisplayName(displayName: string | null | undefined, email: string | undefined) {
  if (displayName?.trim()) {
    return displayName;
  }

  if (email?.includes('@')) {
    return email.split('@')[0];
  }

  return '';
}

export function JoinPage() {
  const { t } = useTranslation(['player', 'common']);
  const navigate = useNavigate();
  const { client, user } = useAuth();
  const [roomCode, setRoomCode] = useState('');
  const [displayName, setDisplayName] = useState(() =>
    defaultDisplayName(user?.display_name ?? null, user?.email),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const publicRoomsQuery = useQuery({
    queryKey: ['publicRooms'],
    queryFn: () => client.listPublicRooms(),
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
      }}
    >
      <Paper sx={{ p: 3, width: '100%', maxWidth: 620 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Box>
              <Typography variant="h4">{t('player.home.joinTitle')}</Typography>
              <Typography color="text.secondary">{t('player.home.joinSubtitle')}</Typography>
            </Box>
            <Box sx={{ width: 132 }}>
              <LanguageSwitcher />
            </Box>
          </Stack>

          {formError ? <Alert severity="error">{formError}</Alert> : null}

          <TextField
            size="small"
            label={t('player.form.roomCode')}
            value={roomCode}
            onChange={(event) => {
              setRoomCode(event.target.value.toUpperCase());
              setFormError(null);
            }}
          />
          <TextField
            size="small"
            label={t('player.form.displayName')}
            value={displayName}
            onChange={(event) => {
              setDisplayName(event.target.value);
              setFormError(null);
            }}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                setFormError(null);
                joinMutation.mutate();
              }}
              disabled={joinMutation.isPending}
            >
              {t('player.actions.joinRoom')}
            </Button>
            <Button size="small" variant="outlined" component={RouterLink} to="/">
              {t('common:common.actions.backHome')}
            </Button>
          </Stack>

          <Stack spacing={1.25}>
            <Box>
              <Typography variant="h6">{t('player.publicRooms.title')}</Typography>
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
        </Stack>
      </Paper>
    </Box>
  );
}
