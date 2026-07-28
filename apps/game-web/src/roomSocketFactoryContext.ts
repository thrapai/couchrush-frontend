import { createContext, useContext } from 'react';
import { createRoomSocketClient, type RoomSocketClient, type CreateRoomSocketClientOptions } from './lib/roomSocket';

export type RoomSocketFactory = (options?: CreateRoomSocketClientOptions) => RoomSocketClient;

export const RoomSocketFactoryContext = createContext<RoomSocketFactory>(createRoomSocketClient);

export function useRoomSocketFactory() {
  return useContext(RoomSocketFactoryContext);
}
