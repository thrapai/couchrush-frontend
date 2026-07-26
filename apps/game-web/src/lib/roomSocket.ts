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

export function createRoomSocketClient(options: CreateRoomSocketClientOptions = {}): RoomSocketClient {
  const socket = io(options.baseUrl ?? undefined, {
    autoConnect: true,
    path: '/ws/socket.io',
    withCredentials: true,
  });

  return {
    connectMember() {
      return new Promise((resolve) => {
        socket.emit('connect_to_room', {}, (response: RoomSocketState | null) => {
          resolve(response);
        });
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
