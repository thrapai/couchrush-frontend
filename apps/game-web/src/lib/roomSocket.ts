import type {
  HostRoomStateResponse,
  PlayerRoomStateResponse,
} from '@couchrush/api-client';
import { io, type Socket } from 'socket.io-client';

export type RoomSocketState = HostRoomStateResponse | PlayerRoomStateResponse;
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface RoomSocketEventMap {
  room_state_updated: RoomSocketState;
  player_joined: { member?: { id: string } };
  player_disconnected: { member_id: string };
  player_reconnected: { member?: { id: string } };
  player_removed: { member_id: string };
  room_closed: { room_id: string };
  error: { message: string };
}

type RoomSocketEventName = keyof RoomSocketEventMap;
const CONNECT_TIMEOUT_MS = 5000;

export interface RoomSocketClient {
  connectMember: () => Promise<RoomSocketState | null>;
  on: <TEventName extends RoomSocketEventName>(
    eventName: TEventName,
    listener: (payload: RoomSocketEventMap[TEventName]) => void,
  ) => () => void;
  onConnectionStatus: (listener: (status: ConnectionStatus) => void) => () => void;
  disconnect: () => void;
}

export interface CreateRoomSocketClientOptions {
  baseUrl?: string;
}

function registerConnectionListener(socket: Socket, listener: (status: ConnectionStatus) => void) {
  const handleConnect = () => {
    listener('connected');
  };
  const handleDisconnect = () => {
    listener('disconnected');
  };
  const handleConnectError = () => {
    listener('error');
  };

  socket.on('connect', handleConnect);
  socket.on('disconnect', handleDisconnect);
  socket.on('connect_error', handleConnectError);

  return () => {
    socket.off('connect', handleConnect);
    socket.off('disconnect', handleDisconnect);
    socket.off('connect_error', handleConnectError);
  };
}

function waitForSocketConnect(socket: Socket) {
  if (socket.connected) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Socket connection timed out.'));
    }, CONNECT_TIMEOUT_MS);
    const cleanup = () => {
      window.clearTimeout(timeout);
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
    };
    const handleConnect = () => {
      cleanup();
      resolve();
    };
    const handleConnectError = (error: Error) => {
      cleanup();
      reject(error);
    };

    socket.once('connect', handleConnect);
    socket.once('connect_error', handleConnectError);
    socket.connect();
  });
}

export function createRoomSocketClient(options: CreateRoomSocketClientOptions = {}): RoomSocketClient {
  const socket = io(options.baseUrl ?? undefined, {
    autoConnect: false,
    path: '/ws/socket.io',
    withCredentials: true,
  });

  return {
    async connectMember() {
      try {
        await waitForSocketConnect(socket);
      } catch {
        return null;
      }

      return new Promise((resolve) => {
        socket.timeout(CONNECT_TIMEOUT_MS).emit(
          'connect_to_room',
          {},
          (error: Error | null, response: RoomSocketState | null) => {
            resolve(error ? null : response);
          },
        );
      });
    },
    on(eventName, listener) {
      socket.on(eventName, listener as never);
      return () => {
        socket.off(eventName, listener as never);
      };
    },
    onConnectionStatus(listener) {
      listener(socket.connected ? 'connected' : 'connecting');
      return registerConnectionListener(socket, listener);
    },
    disconnect() {
      socket.disconnect();
    },
  };
}
