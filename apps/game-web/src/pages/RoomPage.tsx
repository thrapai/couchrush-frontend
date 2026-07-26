import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { useTranslation } from '@couchrush/i18n';
import { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { RoomLobbyCard } from '../components/RoomLobbyCard';
import { LoadingScreen } from '../components/LoadingScreen';
import { useRoomController } from '../hooks/useRoomController';

export function RoomPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(['player', 'common']);
  const [copied, setCopied] = useState(false);
  const normalizedRoomCode = roomCode ?? '';
  const { status, room, connectionStatus, errorMessage, serverMessage, wasRemoved, actionPending, leaveRoom, removePlayer, closeRoom } =
    useRoomController(normalizedRoomCode);

  if (!roomCode) {
    return <LoadingScreen />;
  }

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
    }, 1200);
  };

  const handleLeaveRoom = () => {
    void leaveRoom().then((didLeave) => {
      if (didLeave) {
        void navigate('/');
      }
    });
  };

  if (status === 'missing-session' || status === 'invalid-session' || status === 'closed') {
    const description = wasRemoved
      ? t('player.status.removed')
      : status === 'closed'
        ? t('player.lobby.roomClosed')
        : status === 'missing-session'
          ? t('player.lobby.noSession')
          : t('player.lobby.reconnectFailed');

    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Stack spacing={2} sx={{ width: '100%', maxWidth: 520 }}>
          <Alert severity={status === 'closed' ? 'warning' : 'error'}>{errorMessage ?? description}</Alert>
          <Button size="small" variant="contained" component={RouterLink} to="/join">
            {t('player.actions.joinRoom')}
          </Button>
          <Button size="small" variant="outlined" component={RouterLink} to="/">
            {t('common:common.actions.backHome')}
          </Button>
        </Stack>
      </Box>
    );
  }

  if (!room) {
    return <LoadingScreen />;
  }

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
      <Stack spacing={2} sx={{ width: '100%', maxWidth: 720 }}>
        <Typography sx={{ fontFamily: 'Bungee, sans-serif', fontSize: { xs: '1.6rem', sm: '1.9rem' } }}>
          {room.code}
        </Typography>
        <RoomLobbyCard
          room={room}
          connectionStatus={connectionStatus}
          copied={copied}
          actionError={errorMessage}
          serverMessage={serverMessage ? t(serverMessage) : null}
          actionPending={actionPending}
          onCopyCode={() => {
            void handleCopyCode();
          }}
          onLeaveRoom={handleLeaveRoom}
          onRemovePlayer={removePlayer}
          onCloseRoom={closeRoom}
        />
      </Stack>
    </Box>
  );
}
