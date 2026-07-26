import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import SensorOccupiedRoundedIcon from '@mui/icons-material/SensorOccupiedRounded';
import { Alert, Box, Button, Chip, Divider, IconButton, List, ListItem, ListItemText, Paper, Stack, Typography } from '@mui/material';
import type { RoomControllerStateResponse } from '@couchrush/api-client';
import { useTranslation } from '@couchrush/i18n';
import type { ConnectionStatus } from '../lib/roomSocket';

interface RoomLobbyCardProps {
  room: RoomControllerStateResponse;
  connectionStatus: ConnectionStatus;
  copied: boolean;
  actionError: string | null;
  serverMessage: string | null;
  actionPending: boolean;
  onCopyCode: () => void;
  onLeaveRoom: () => Promise<boolean | void> | void;
  onRemovePlayer: (memberId: string) => Promise<boolean | void> | void;
  onCloseRoom: () => Promise<boolean | void> | void;
}

function connectionColor(status: ConnectionStatus): 'success' | 'warning' | 'error' | 'default' {
  if (status === 'connected') {
    return 'success';
  }

  if (status === 'connecting') {
    return 'warning';
  }

  if (status === 'error') {
    return 'error';
  }

  return 'default';
}

export function RoomLobbyCard({
  room,
  connectionStatus,
  copied,
  actionError,
  serverMessage,
  actionPending,
  onCopyCode,
  onLeaveRoom,
  onRemovePlayer,
  onCloseRoom,
}: RoomLobbyCardProps) {
  const { t } = useTranslation(['player', 'common']);
  const isHostViewer = room.viewer_role === 'HOST';
  const selfMemberId = room.viewer_role === 'PLAYER' ? room.self_member_id : room.host_member_id;

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, width: '100%', maxWidth: 720 }}>
      <Stack spacing={2.5}>
        <Stack
          direction="row"
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontFamily: 'Bungee, sans-serif', fontSize: { xs: '1.7rem', sm: '2rem' } }}>
              {t('player.lobby.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('player.lobby.roomCode')}: {room.code}
            </Typography>
          </Box>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
            <Chip
              size="small"
              color={connectionColor(connectionStatus)}
              icon={<SensorOccupiedRoundedIcon />}
              label={`${t('player.lobby.connectionStatus')}: ${t(`common:common.status.${connectionStatus}`)}`}
            />
            <IconButton
              size="small"
              aria-label={t('player.actions.copyCode')}
              onClick={onCopyCode}
            >
              <ContentCopyRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        {copied ? <Alert severity="success">{t('player.lobby.copied')}</Alert> : null}
        {serverMessage ? <Alert severity="info">{serverMessage}</Alert> : null}
        {actionError ? <Alert severity="error">{actionError}</Alert> : null}

        <Divider />

        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            {t('player.lobby.members')}
          </Typography>
          <List disablePadding>
            {room.members.map((member) => {
              const isSelf = member.id === selfMemberId;
              const canRemove = isHostViewer && !member.is_host;

              return (
                <ListItem
                  key={member.id}
                  disablePadding
                  secondaryAction={
                    canRemove ? (
                      <IconButton
                        edge="end"
                        aria-label={`${t('player.lobby.removeAction')} ${member.display_name}`}
                        disabled={actionPending}
                        onClick={() => {
                          void onRemovePlayer(member.id);
                        }}
                      >
                        <PersonRemoveRoundedIcon fontSize="small" />
                      </IconButton>
                    ) : null
                  }
                  sx={{
                    py: 1.25,
                    pr: canRemove ? 6 : 0,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                        <Typography variant="body1">{member.display_name}</Typography>
                        {isSelf ? <Chip size="small" label={t('player.lobby.you')} /> : null}
                        {member.is_host ? <Chip size="small" color="primary" label={t('player.lobby.hostBadge')} /> : null}
                        {member.is_player ? (
                          <Chip size="small" variant="outlined" label={t('player.lobby.playerBadge')} />
                        ) : (
                          <Chip size="small" variant="outlined" label={t('player.lobby.hostOnlyBadge')} />
                        )}
                      </Stack>
                    }
                    secondary={t(`player.lobby.${member.is_connected ? 'connected' : 'disconnected'}`)}
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1.25 }}>
          <Button
            size="small"
            color="inherit"
            variant="outlined"
            disabled={actionPending}
            onClick={() => {
              void onLeaveRoom();
            }}
          >
            {t('player.lobby.leaveRoom')}
          </Button>
          {isHostViewer ? (
            <Button
              size="small"
              color="error"
              variant="contained"
              disabled={actionPending}
              onClick={() => {
                void onCloseRoom();
              }}
            >
              {t('player.lobby.closeRoom')}
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );
}
