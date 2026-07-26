import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { getApiErrorMessage } from '@couchrush/api-client';
import { useMutation } from '@tanstack/react-query';
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
      <Paper sx={{ p: 3, width: '100%', maxWidth: 520 }}>
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
        </Stack>
      </Paper>
    </Box>
  );
}
