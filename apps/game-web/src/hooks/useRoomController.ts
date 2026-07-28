import {
  getApiErrorMessage,
  type ApiClient,
  type ReconnectRoomResponse,
  type RoomControllerStateResponse,
  type RoomMemberSessionResponse,
} from '@couchrush/api-client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@couchrush/auth';
import {
  clearStoredRoomSession,
  loadRoomCsrfToken,
  loadStoredRoomSessionForCode,
  saveStoredRoomSession,
} from '../lib/roomSession';
import type { ConnectionStatus, RoomSocketClient } from '../lib/roomSocket';
import { useRoomSocketFactory } from '../roomSocketFactoryContext';

type RoomViewStatus = 'loading' | 'ready' | 'missing-session' | 'invalid-session' | 'closed';

function isApiStatus(error: unknown, status: number) {
  return typeof error === 'object' && error !== null && 'status' in error && error.status === status;
}

function withoutRoomMember(roomState: RoomControllerStateResponse | null, memberId: string) {
  if (!roomState?.members.some((member) => member.id === memberId)) {
    return roomState;
  }

  const removedMember = roomState.members.find((member) => member.id === memberId);

  return {
    ...roomState,
    members: roomState.members.filter((member) => member.id !== memberId),
    player_count: removedMember?.is_player ? Math.max(0, roomState.player_count - 1) : roomState.player_count,
  };
}

const reconnectRequests = new Map<string, Promise<ReconnectRoomResponse>>();

function reconnectRoomOnce(client: ApiClient, csrfToken: string) {
  const pendingRequest = reconnectRequests.get(csrfToken);
  if (pendingRequest) {
    return pendingRequest;
  }

  const request = client.reconnectRoom(csrfToken).finally(() => {
    if (reconnectRequests.get(csrfToken) === request) {
      reconnectRequests.delete(csrfToken);
    }
  });
  reconnectRequests.set(csrfToken, request);
  return request;
}

export function useRoomController(roomCode: string) {
  const { client } = useAuth();
  const createSocketClient = useRoomSocketFactory();
  const socketRef = useRef<RoomSocketClient | null>(null);
  const sessionRef = useRef<RoomMemberSessionResponse | null>(null);
  const [status, setStatus] = useState<RoomViewStatus>('loading');
  const [room, setRoom] = useState<RoomControllerStateResponse | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [wasRemoved, setWasRemoved] = useState(false);
  const [actionPending, setActionPending] = useState(false);

  const clearRoomSession = useCallback(() => {
    clearStoredRoomSession();
    sessionRef.current = null;
  }, []);

  const disconnectSocket = useCallback((socket: RoomSocketClient | null = socketRef.current) => {
    socket?.disconnect();
    if (socketRef.current === socket) {
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function attachToRoom() {
      const storedSession = loadStoredRoomSessionForCode(roomCode);
      sessionRef.current = storedSession;

      if (!storedSession) {
        if (isActive) {
          setStatus('missing-session');
          setConnectionStatus('disconnected');
        }
        return;
      }

      setStatus('loading');
      setConnectionStatus('connecting');
      setErrorMessage(null);
      setServerMessage(null);
      setWasRemoved(false);

      try {
        const reconnectResponse = await reconnectRoomOnce(client, loadRoomCsrfToken(storedSession.csrf_token));
        if (!isActive) {
          return;
        }

        saveStoredRoomSession(reconnectResponse.session);
        sessionRef.current = reconnectResponse.session;
        setRoom(reconnectResponse.room);
        setStatus('ready');

        const socket = createSocketClient({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? '' });
        socketRef.current = socket;

        const disposers = [
          socket.onConnectionStatus((nextStatus) => {
            if (isActive) {
              setConnectionStatus(nextStatus);
            }
          }),
          socket.on('room_state_updated', (nextRoomState) => {
            if (isActive && sessionRef.current) {
              setRoom(nextRoomState);
              setStatus('ready');
            }
          }),
          socket.on('player_removed', ({ member_id: memberId }) => {
            const activeSession = sessionRef.current;
            if (activeSession?.member_id === memberId) {
              clearRoomSession();
              disconnectSocket();
              if (isActive) {
                setWasRemoved(true);
                setStatus('invalid-session');
              }
              return;
            }

            if (isActive) {
              setRoom((currentRoom) => withoutRoomMember(currentRoom, memberId));
              setServerMessage('player.lobby.memberRemoved');
            }
          }),
          socket.on('player_disconnected', () => {
            if (isActive) {
              setServerMessage('player.lobby.memberDisconnected');
            }
          }),
          socket.on('player_reconnected', () => {
            if (isActive) {
              setServerMessage('player.lobby.memberReconnected');
            }
          }),
          socket.on('room_closed', () => {
            clearRoomSession();
            disconnectSocket();
            if (isActive) {
              setStatus('closed');
            }
          }),
          socket.on('error', ({ message }) => {
            if (isActive) {
              setErrorMessage(message);
              setConnectionStatus('error');
            }
          }),
        ];

        const socketRoomState = await socket.connectMember();
        if (!isActive) {
          disposers.forEach((dispose) => {
            dispose();
          });
          disconnectSocket(socket);
          return;
        }

        if (!socketRoomState) {
          disposers.forEach((dispose) => {
            dispose();
          });
          disconnectSocket(socket);
          setConnectionStatus('error');
          setErrorMessage('player.lobby.realtimeConnectFailed');
          return;
        }

        setRoom(socketRoomState);
        setStatus('ready');

        return () => {
          disposers.forEach((dispose) => {
            dispose();
          });
        };
      } catch (error) {
        clearRoomSession();
        if (isActive) {
          setErrorMessage(getApiErrorMessage(error));
          setStatus('invalid-session');
          setConnectionStatus(isApiStatus(error, 401) ? 'disconnected' : 'error');
        }
      }
    }

    let disposeListeners: (() => void) | undefined;
    void attachToRoom().then((dispose) => {
      disposeListeners = dispose;
    });

    return () => {
      isActive = false;
      disposeListeners?.();
      disconnectSocket();
    };
  }, [clearRoomSession, client, createSocketClient, disconnectSocket, roomCode]);

  const leaveRoom = async () => {
    const session = sessionRef.current;
    if (!session) {
      clearRoomSession();
      setStatus('missing-session');
      return false;
    }

    setActionPending(true);
    setErrorMessage(null);
    try {
      await client.leaveRoom(loadRoomCsrfToken(session.csrf_token));
    } catch (error) {
      if (isApiStatus(error, 401)) {
        clearRoomSession();
        setStatus('invalid-session');
      }
      setErrorMessage(getApiErrorMessage(error));
      setActionPending(false);
      return false;
    }

    disconnectSocket();
    clearRoomSession();
    setActionPending(false);
    return true;
  };

  const removePlayer = async (memberId: string) => {
    const session = sessionRef.current;
    if (!session) {
      return false;
    }

    setActionPending(true);
    setErrorMessage(null);
    try {
      await client.removeRoomMember({ member_id: memberId }, loadRoomCsrfToken(session.csrf_token));
    } catch (error) {
      if (isApiStatus(error, 401)) {
        clearRoomSession();
        setStatus('invalid-session');
      }
      setErrorMessage(getApiErrorMessage(error));
      setActionPending(false);
      return false;
    }
    setRoom((currentRoom) => withoutRoomMember(currentRoom, memberId));
    setActionPending(false);
    return true;
  };

  const closeRoom = async () => {
    const session = sessionRef.current;
    if (!session) {
      return false;
    }

    setActionPending(true);
    setErrorMessage(null);
    try {
      await client.closeRoom(loadRoomCsrfToken(session.csrf_token));
    } catch (error) {
      if (isApiStatus(error, 401)) {
        clearRoomSession();
        setStatus('invalid-session');
      }
      setErrorMessage(getApiErrorMessage(error));
      setActionPending(false);
      return false;
    }

    disconnectSocket();
    clearRoomSession();
    setStatus('closed');
    setActionPending(false);
    return true;
  };

  return {
    status,
    room,
    connectionStatus,
    errorMessage,
    serverMessage,
    wasRemoved,
    actionPending,
    leaveRoom,
    removePlayer,
    closeRoom,
  };
}
