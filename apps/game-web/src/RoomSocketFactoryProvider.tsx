import type { ReactNode } from 'react';
import { createRoomSocketClient } from './lib/roomSocket';
import { RoomSocketFactoryContext, type RoomSocketFactory } from './roomSocketFactoryContext';

export interface RoomSocketFactoryProviderProps {
  createSocketClient?: RoomSocketFactory;
  children: ReactNode;
}

export function RoomSocketFactoryProvider({
  createSocketClient = createRoomSocketClient,
  children,
}: RoomSocketFactoryProviderProps) {
  return (
    <RoomSocketFactoryContext.Provider value={createSocketClient}>{children}</RoomSocketFactoryContext.Provider>
  );
}
