import {
  getApiErrorMessage,
  type ApiClient,
  type ReconnectRoomResponse,
  type RoomControllerStateResponse,
  type RoomMemberSessionResponse,
} from '@couchrush/api-client';
import { useEffect, useRef, useState } from 'react';
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
            if (isActive) {
              setRoom(nextRoomState);
              setStatus('ready');
            }
          }),
          socket.on('player_removed', ({ member_id: memberId }) => {
            const activeSession = sessionRef.current;
            if (activeSession?.member_id === memberId) {
              clearStoredRoomSession();
              sessionRef.current = null;
              if (isActive) {
                setWasRemoved(true);
                setStatus('invalid-session');
              }
              return;
            }

            if (isActive) {
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
            clearStoredRoomSession();
            sessionRef.current = null;
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
          socket.disconnect();
          return;
        }

        if (!socketRoomState) {
          disposers.forEach((dispose) => {
            dispose();
          });
          socket.disconnect();
          socketRef.current = null;
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
        clearStoredRoomSession();
        sessionRef.current = null;
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
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [client, createSocketClient, roomCode]);

  const leaveRoom = async () => {
    const session = sessionRef.current;
    if (!session) {
      clearStoredRoomSession();
      setStatus('missing-session');
      return false;
    }

    setActionPending(true);
    setErrorMessage(null);
    try {
      await client.leaveRoom(loadRoomCsrfToken(session.csrf_token));
    } catch (error) {
      if (isApiStatus(error, 401)) {
        clearStoredRoomSession();
        sessionRef.current = null;
        setStatus('invalid-session');
      }
      setErrorMessage(getApiErrorMessage(error));
      setActionPending(false);
      return false;
    }

    socketRef.current?.disconnect();
    socketRef.current = null;
    clearStoredRoomSession();
    sessionRef.current = null;
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
        clearStoredRoomSession();
        sessionRef.current = null;
        setStatus('invalid-session');
      }
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setActionPending(false);
    }
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
        clearStoredRoomSession();
        sessionRef.current = null;
        setStatus('invalid-session');
      }
      setErrorMessage(getApiErrorMessage(error));
      setActionPending(false);
      return false;
    }

    socketRef.current?.disconnect();
    socketRef.current = null;
    clearStoredRoomSession();
    sessionRef.current = null;
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
