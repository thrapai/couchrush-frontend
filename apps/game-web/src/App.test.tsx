import type {
  ApiClientOptions,
  HostRoomStateResponse,
  PlayerRoomStateResponse,
  RoomMemberSessionResponse,
} from '@couchrush/api-client';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CouchRushThemeProvider } from '@couchrush/theme';
import { StrictMode } from 'react';
import { App } from './App';
import type { ConnectionStatus, RoomSocketClient, RoomSocketEventMap } from './lib/roomSocket';

type MockAxiosResponse = {
  status: number;
  data: unknown;
  statusText: string;
  headers: Record<string, string>;
  config: { headers: unknown };
};

type MockAxiosInstance = {
  request: typeof requestMock;
};

type MockSocketEventName = keyof RoomSocketEventMap;

class MockRoomSocketClient implements RoomSocketClient {
  connectResponse: HostRoomStateResponse | PlayerRoomStateResponse | null = null;
  connectMemberShouldHang = false;
  emittedEvents: Array<{ event: string; payload: unknown }> = [];
  private readonly listeners = new Map<string, Set<(payload: unknown) => void>>();
  private readonly connectionListeners = new Set<(status: ConnectionStatus) => void>();

  async connectMember() {
    this.emittedEvents.push({ event: 'connect_to_room', payload: {} });
    this.emitConnectionStatus('connected');
    if (this.connectMemberShouldHang) {
      return new Promise<HostRoomStateResponse | PlayerRoomStateResponse | null>(() => undefined);
    }

    return this.connectResponse;
  }

  on<TEventName extends MockSocketEventName>(
    eventName: TEventName,
    listener: (payload: RoomSocketEventMap[TEventName]) => void,
  ) {
    const listenersForEvent = this.listeners.get(eventName) ?? new Set();
    listenersForEvent.add(listener as (payload: unknown) => void);
    this.listeners.set(eventName, listenersForEvent);

    return () => {
      listenersForEvent.delete(listener as (payload: unknown) => void);
    };
  }

  onConnectionStatus(listener: (status: ConnectionStatus) => void) {
    this.connectionListeners.add(listener);
    listener('connecting');

    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  disconnect() {
    this.emitConnectionStatus('disconnected');
  }

  emitServerEvent<TEventName extends MockSocketEventName>(
    eventName: TEventName,
    payload: RoomSocketEventMap[TEventName],
  ) {
    this.listeners.get(eventName)?.forEach((listener) => {
      listener(payload);
    });
  }

  private emitConnectionStatus(status: ConnectionStatus) {
    this.connectionListeners.forEach((listener) => {
      listener(status);
    });
  }
}

const requestMock = vi.fn<
  (config: { url?: string; method?: string; headers?: Record<string, string>; data?: unknown }) => Promise<MockAxiosResponse>
>();
const storage = new Map<string, string>();

const ROOM_CODE = 'ABCD23';

const HOST_MEMBER = {
  id: '22222222-2222-2222-2222-222222222222',
  display_name: 'Host',
  is_host: true,
  is_player: true,
  is_connected: true,
};

const HOST_ONLY_MEMBER = {
  ...HOST_MEMBER,
  is_player: false,
};

const GUEST_MEMBER = {
  id: '33333333-3333-3333-3333-333333333333',
  display_name: 'Alex',
  is_host: false,
  is_player: true,
  is_connected: true,
};

const HOST_ROOM: HostRoomStateResponse = {
  id: '11111111-1111-1111-1111-111111111111',
  code: ROOM_CODE,
  status: 'LOBBY',
  is_public: false,
  player_limit: 8,
  player_count: 1,
  inactivity_timeout_seconds: 900,
  created_at: '2026-07-26T12:00:00Z',
  last_activity_at: '2026-07-26T12:00:00Z',
  members: [HOST_MEMBER],
  viewer_role: 'HOST',
  host_member_id: HOST_MEMBER.id,
};

const HOST_ONLY_ROOM: HostRoomStateResponse = {
  ...HOST_ROOM,
  members: [HOST_ONLY_MEMBER],
  player_count: 0,
};

const PUBLIC_HOST_ROOM: HostRoomStateResponse = {
  ...HOST_ROOM,
  is_public: true,
};

const PLAYER_ROOM: PlayerRoomStateResponse = {
  ...HOST_ROOM,
  members: [HOST_MEMBER, GUEST_MEMBER],
  player_count: 2,
  viewer_role: 'PLAYER',
  self_member_id: GUEST_MEMBER.id,
  self_is_host: false,
  self_is_player: true,
};

const PUBLIC_PLAYER_ROOM: PlayerRoomStateResponse = {
  ...PLAYER_ROOM,
  is_public: true,
};

const HOST_SESSION: RoomMemberSessionResponse = {
  room_id: HOST_ROOM.id,
  room_code: ROOM_CODE,
  member_id: HOST_MEMBER.id,
  is_host: true,
  is_player: true,
  csrf_token: 'host-csrf-token',
};

const HOST_ONLY_SESSION: RoomMemberSessionResponse = {
  ...HOST_SESSION,
  csrf_token: 'host-only-csrf-token',
  is_player: false,
};

const PLAYER_SESSION: RoomMemberSessionResponse = {
  room_id: HOST_ROOM.id,
  room_code: ROOM_CODE,
  member_id: GUEST_MEMBER.id,
  is_host: false,
  is_player: true,
  csrf_token: 'player-csrf-token',
};

const AUTH_USER = {
  id: '44444444-4444-4444-4444-444444444444',
  email: 'alex@example.com',
  display_name: 'Alex',
  is_active: true,
  roles: ['USER'],
  permissions: [],
};

const AUTH_PROFILE = {
  id: AUTH_USER.id,
  email: AUTH_USER.email,
  display_name: AUTH_USER.display_name,
  is_active: true,
  roles: AUTH_USER.roles,
  created_at: '2026-07-26T12:00:00Z',
  updated_at: '2026-07-26T12:00:00Z',
  last_login_at: '2026-07-26T12:00:00Z',
};

function jsonResponse(status: number, data?: unknown): MockAxiosResponse {
  return {
    status,
    data,
    statusText: '',
    headers: {},
    config: { headers: {} as never },
  };
}

function installBrowserMocks() {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
      clear: () => {
        storage.clear();
      },
    },
  });

  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: vi.fn(async () => undefined),
    },
  });
}

function renderApp(
  pathname: string,
  {
    socketFactory,
    strictMode = false,
  }: {
    socketFactory?: () => MockRoomSocketClient;
    strictMode?: boolean;
  } = {},
) {
  window.history.pushState({}, '', pathname);
  const apiClientOptions: ApiClientOptions = {
    axios: {
      request: requestMock,
    } as unknown as MockAxiosInstance & ApiClientOptions['axios'],
  };

  const app = (
    <CouchRushThemeProvider defaultMode="dark">
      <App apiClientOptions={apiClientOptions} socketFactory={socketFactory} />
    </CouchRushThemeProvider>
  );

  return render(strictMode ? <StrictMode>{app}</StrictMode> : app);
}

function installGuestAuthMock() {
  requestMock.mockImplementation(async (config) => {
    if (config.url === '/api/auth/refresh') {
      return jsonResponse(401, { detail: 'Invalid refresh token.' });
    }

    return jsonResponse(404, { detail: `Unhandled test URL: ${config.url ?? ''}` });
  });
}

function installAuthenticatedMock() {
  requestMock.mockImplementation(async (config) => {
    if (config.url === '/api/auth/refresh') {
      return jsonResponse(200, { access_token: 'auth-token', token_type: 'bearer', expires_in: 900 });
    }

    if (config.url === '/api/auth/me') {
      return jsonResponse(200, AUTH_USER);
    }

    if (config.url === '/api/users/me') {
      return jsonResponse(200, AUTH_PROFILE);
    }

    return jsonResponse(404, { detail: `Unhandled test URL: ${config.url ?? ''}` });
  });
}

describe('game-web app', () => {
  beforeEach(() => {
    installBrowserMocks();
    requestMock.mockReset();
    storage.clear();
  });

  it('supports guest join via room code and display name', async () => {
    const socket = new MockRoomSocketClient();
    socket.connectResponse = PLAYER_ROOM;
    installGuestAuthMock();
    requestMock.mockImplementation(async (config) => {
      if (config.url === '/api/auth/refresh') {
        return jsonResponse(401, { detail: 'Invalid refresh token.' });
      }

      if (config.url === '/api/rooms/join') {
        expect(config.data).toEqual({ room_code: ROOM_CODE, display_name: 'Alex' });
        return jsonResponse(200, { room: PLAYER_ROOM, session: PLAYER_SESSION });
      }

      if (config.url === '/api/rooms/public?page=1&page_size=20') {
        return jsonResponse(200, { items: [], page: 1, page_size: 20, total: 0 });
      }

      if (config.url === '/api/rooms/reconnect') {
        expect(config.data).toEqual({});
        expect(config.headers?.['X-Room-CSRF-Token']).toBe(PLAYER_SESSION.csrf_token);
        return jsonResponse(200, {
          room: PLAYER_ROOM,
          session: { ...PLAYER_SESSION, csrf_token: 'player-csrf-token-rotated' },
        });
      }

      return jsonResponse(404, { detail: `Unhandled test URL: ${config.url ?? ''}` });
    });

    renderApp('/join', { socketFactory: () => socket });

    await userEvent.type(await screen.findByRole('textbox', { name: 'Room code' }), ROOM_CODE.toLowerCase());
    await userEvent.type(screen.getByRole('textbox', { name: 'Display name' }), 'Alex');
    await userEvent.click(screen.getByRole('button', { name: 'Join room' }));

    expect(await screen.findByText(`Room code: ${ROOM_CODE}`)).toBeInTheDocument();
    expect(socket.emittedEvents).toContainEqual({
      event: 'connect_to_room',
      payload: {},
    });
  });

  it('creates a room as host-player', async () => {
    const socket = new MockRoomSocketClient();
    socket.connectResponse = HOST_ROOM;
    installGuestAuthMock();
    requestMock.mockImplementation(async (config) => {
      if (config.url === '/api/auth/refresh') {
        return jsonResponse(401, { detail: 'Invalid refresh token.' });
      }

      if (config.url === '/api/rooms') {
        expect(config.data).toEqual({ display_name: 'Host', participate_as_player: true, is_public: false });
        return jsonResponse(200, { room: HOST_ROOM, session: HOST_SESSION });
      }

      if (config.url === '/api/rooms/reconnect') {
        expect(config.headers?.['X-Room-CSRF-Token']).toBe(HOST_SESSION.csrf_token);
        return jsonResponse(200, {
          room: HOST_ROOM,
          session: { ...HOST_SESSION, csrf_token: 'host-csrf-token-rotated' },
        });
      }

      return jsonResponse(404, { detail: `Unhandled test URL: ${config.url ?? ''}` });
    });

    renderApp('/', { socketFactory: () => socket });

    await userEvent.type(await screen.findByRole('textbox', { name: 'Display name' }), 'Host');
    await userEvent.click(screen.getByRole('button', { name: 'Create room' }));

    expect(await screen.findByText(`Room code: ${ROOM_CODE}`)).toBeInTheDocument();
    expect(screen.getByText('Player')).toBeInTheDocument();
  });

  it('creates a room as host-only', async () => {
    const socket = new MockRoomSocketClient();
    socket.connectResponse = HOST_ONLY_ROOM;
    installGuestAuthMock();
    requestMock.mockImplementation(async (config) => {
      if (config.url === '/api/auth/refresh') {
        return jsonResponse(401, { detail: 'Invalid refresh token.' });
      }

      if (config.url === '/api/rooms') {
        expect(config.data).toEqual({ display_name: 'Host', participate_as_player: false, is_public: false });
        return jsonResponse(200, { room: HOST_ONLY_ROOM, session: HOST_ONLY_SESSION });
      }

      if (config.url === '/api/rooms/reconnect') {
        expect(config.headers?.['X-Room-CSRF-Token']).toBe(HOST_ONLY_SESSION.csrf_token);
        return jsonResponse(200, {
          room: HOST_ONLY_ROOM,
          session: { ...HOST_ONLY_SESSION, csrf_token: 'host-only-csrf-token-rotated' },
        });
      }

      return jsonResponse(404, { detail: `Unhandled test URL: ${config.url ?? ''}` });
    });

    renderApp('/', { socketFactory: () => socket });

    await userEvent.type(await screen.findByRole('textbox', { name: 'Display name' }), 'Host');
    await userEvent.click(screen.getByLabelText('Host only'));
    await userEvent.click(screen.getByRole('button', { name: 'Create room' }));

    expect(await screen.findByText(`Room code: ${ROOM_CODE}`)).toBeInTheDocument();
    expect(screen.getByText('Host only')).toBeInTheDocument();
  });

  it('creates a public room', async () => {
    const socket = new MockRoomSocketClient();
    socket.connectResponse = PUBLIC_HOST_ROOM;
    installGuestAuthMock();
    requestMock.mockImplementation(async (config) => {
      if (config.url === '/api/auth/refresh') {
        return jsonResponse(401, { detail: 'Invalid refresh token.' });
      }

      if (config.url === '/api/rooms') {
        expect(config.data).toEqual({ display_name: 'Host', participate_as_player: true, is_public: true });
        return jsonResponse(200, { room: PUBLIC_HOST_ROOM, session: HOST_SESSION });
      }

      if (config.url === '/api/rooms/reconnect') {
        return jsonResponse(200, {
          room: PUBLIC_HOST_ROOM,
          session: { ...HOST_SESSION, csrf_token: 'host-csrf-token-rotated' },
        });
      }

      return jsonResponse(404, { detail: `Unhandled test URL: ${config.url ?? ''}` });
    });

    renderApp('/', { socketFactory: () => socket });

    await userEvent.type(await screen.findByRole('textbox', { name: 'Display name' }), 'Host');
    await userEvent.click(screen.getByLabelText('Public room'));
    await userEvent.click(screen.getByRole('button', { name: 'Create room' }));

    expect(await screen.findByText(`Room code: ${ROOM_CODE}`)).toBeInTheDocument();
  });

  it('lists and joins a public room', async () => {
    const socket = new MockRoomSocketClient();
    socket.connectResponse = PUBLIC_PLAYER_ROOM;
    installGuestAuthMock();
    requestMock.mockImplementation(async (config) => {
      if (config.url === '/api/auth/refresh') {
        return jsonResponse(401, { detail: 'Invalid refresh token.' });
      }

      if (config.url === '/api/rooms/public?page=1&page_size=20') {
        return jsonResponse(200, {
          items: [
            {
              id: HOST_ROOM.id,
              code: ROOM_CODE,
              status: 'LOBBY',
              player_limit: 8,
              player_count: 1,
              members: [HOST_MEMBER],
              host_display_name: 'Host',
              created_at: '2026-07-26T12:00:00Z',
              last_activity_at: '2026-07-26T12:00:00Z',
              inactivity_timeout_seconds: 900,
            },
          ],
          page: 1,
          page_size: 20,
          total: 1,
        });
      }

      if (config.url === `/api/rooms/public/${HOST_ROOM.id}/join`) {
        expect(config.data).toEqual({ display_name: 'Alex' });
        return jsonResponse(200, { room: PUBLIC_PLAYER_ROOM, session: PLAYER_SESSION });
      }

      if (config.url === '/api/rooms/reconnect') {
        return jsonResponse(200, {
          room: PUBLIC_PLAYER_ROOM,
          session: { ...PLAYER_SESSION, csrf_token: 'player-csrf-token-rotated' },
        });
      }

      return jsonResponse(404, { detail: `Unhandled test URL: ${config.url ?? ''}` });
    });

    renderApp('/join', { socketFactory: () => socket });

    await userEvent.type(await screen.findByRole('textbox', { name: 'Display name' }), 'Alex');
    expect(await screen.findByText(ROOM_CODE)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Join' }));

    expect(await screen.findByText(`Room code: ${ROOM_CODE}`)).toBeInTheDocument();
  });

  it('renders the lobby and host-only controls for hosts', async () => {
    const hostSocket = new MockRoomSocketClient();
    hostSocket.connectResponse = HOST_ROOM;
    installGuestAuthMock();
    window.localStorage.setItem('couchrush.game.room_session', JSON.stringify(HOST_SESSION));
    requestMock.mockImplementation(async (config) => {
      if (config.url === '/api/auth/refresh') {
        return jsonResponse(401, { detail: 'Invalid refresh token.' });
      }

      if (config.url === '/api/rooms/reconnect') {
        return jsonResponse(200, { room: HOST_ROOM, session: HOST_SESSION });
      }

      return jsonResponse(404, { detail: `Unhandled test URL: ${config.url ?? ''}` });
    });

    renderApp(`/room/${ROOM_CODE}`, { socketFactory: () => hostSocket });

    expect(await screen.findByText(`Room code: ${ROOM_CODE}`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close room' })).toBeInTheDocument();
  });

  it('deduplicates StrictMode reconnects for the same room session', async () => {
    const hostSocket = new MockRoomSocketClient();
    hostSocket.connectResponse = HOST_ROOM;
    let reconnectCalls = 0;
    installGuestAuthMock();
    window.localStorage.setItem('couchrush.game.room_session', JSON.stringify(HOST_SESSION));
    requestMock.mockImplementation(async (config) => {
      if (config.url === '/api/auth/refresh') {
        return jsonResponse(401, { detail: 'Invalid refresh token.' });
      }

      if (config.url === '/api/rooms/reconnect') {
        reconnectCalls += 1;
        await Promise.resolve();
        return jsonResponse(200, {
          room: HOST_ROOM,
          session: { ...HOST_SESSION, csrf_token: 'host-csrf-token-rotated' },
        });
      }

      return jsonResponse(404, { detail: `Unhandled test URL: ${config.url ?? ''}` });
    });

    renderApp(`/room/${ROOM_CODE}`, { socketFactory: () => hostSocket, strictMode: true });

    expect(await screen.findByText(`Room code: ${ROOM_CODE}`)).toBeInTheDocument();
    expect(reconnectCalls).toBe(1);
  });

  it('shows the lobby after HTTP reconnect even when the socket ack hangs', async () => {
    const hostSocket = new MockRoomSocketClient();
    hostSocket.connectMemberShouldHang = true;
    installGuestAuthMock();
    window.localStorage.setItem('couchrush.game.room_session', JSON.stringify(HOST_SESSION));
    requestMock.mockImplementation(async (config) => {
      if (config.url === '/api/auth/refresh') {
        return jsonResponse(401, { detail: 'Invalid refresh token.' });
      }

      if (config.url === '/api/rooms/reconnect') {
        return jsonResponse(200, { room: HOST_ROOM, session: HOST_SESSION });
      }

      return jsonResponse(404, { detail: `Unhandled test URL: ${config.url ?? ''}` });
    });

    renderApp(`/room/${ROOM_CODE}`, { socketFactory: () => hostSocket });

    expect(await screen.findByText(`Room code: ${ROOM_CODE}`)).toBeInTheDocument();
    expect(hostSocket.emittedEvents).toContainEqual({ event: 'connect_to_room', payload: {} });
  });

  it('does not show host-only controls to normal players', async () => {
    window.localStorage.setItem('couchrush.game.room_session', JSON.stringify(PLAYER_SESSION));
    const playerSocket = new MockRoomSocketClient();
    playerSocket.connectResponse = PLAYER_ROOM;
    requestMock.mockReset();
    installGuestAuthMock();
    requestMock.mockImplementation(async (config) => {
      if (config.url === '/api/auth/refresh') {
        return jsonResponse(401, { detail: 'Invalid refresh token.' });
      }

      if (config.url === '/api/rooms/reconnect') {
        expect(config.headers?.['X-Room-CSRF-Token']).toBe(PLAYER_SESSION.csrf_token);
        return jsonResponse(200, { room: PLAYER_ROOM, session: PLAYER_SESSION });
      }

      return jsonResponse(404, { detail: `Unhandled test URL: ${config.url ?? ''}` });
    });

    renderApp(`/room/${ROOM_CODE}`, { socketFactory: () => playerSocket });

    const roomCodeText = await screen.findByText(`Room code: ${ROOM_CODE}`);
    const lobbyContainer = roomCodeText.closest('div');
    if (!lobbyContainer) {
      throw new Error('Lobby not found');
    }
    expect(within(lobbyContainer.parentElement ?? lobbyContainer).queryByRole('button', { name: 'Close room' })).not.toBeInTheDocument();
  });

  it('applies room-state socket updates in real time', async () => {
    const socket = new MockRoomSocketClient();
    socket.connectResponse = HOST_ROOM;
    installGuestAuthMock();
    window.localStorage.setItem('couchrush.game.room_session', JSON.stringify(HOST_SESSION));
    requestMock.mockImplementation(async (config) => {
      if (config.url === '/api/auth/refresh') {
        return jsonResponse(401, { detail: 'Invalid refresh token.' });
      }

      if (config.url === '/api/rooms/reconnect') {
        return jsonResponse(200, { room: HOST_ROOM, session: HOST_SESSION });
      }

      return jsonResponse(404, { detail: `Unhandled test URL: ${config.url ?? ''}` });
    });

    renderApp(`/room/${ROOM_CODE}`, { socketFactory: () => socket });
    await screen.findByText(`Room code: ${ROOM_CODE}`);

    socket.emitServerEvent('room_state_updated', {
      ...HOST_ROOM,
      members: [HOST_MEMBER, { ...GUEST_MEMBER, is_connected: false }],
      player_count: 2,
    });

    expect(await screen.findByText('Alex')).toBeInTheDocument();
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('reconnects after refresh and rotates the persisted token', async () => {
    const socket = new MockRoomSocketClient();
    socket.connectResponse = PLAYER_ROOM;
    installGuestAuthMock();
    window.localStorage.setItem('couchrush.game.room_session', JSON.stringify(PLAYER_SESSION));
    requestMock.mockImplementation(async (config) => {
      if (config.url === '/api/auth/refresh') {
        return jsonResponse(401, { detail: 'Invalid refresh token.' });
      }

      if (config.url === '/api/rooms/reconnect') {
        expect(config.data).toEqual({});
        expect(config.headers?.['X-Room-CSRF-Token']).toBe(PLAYER_SESSION.csrf_token);
        return jsonResponse(200, {
          room: PLAYER_ROOM,
          session: { ...PLAYER_SESSION, csrf_token: 'player-csrf-token-rotated' },
        });
      }

      return jsonResponse(404, { detail: `Unhandled test URL: ${config.url ?? ''}` });
    });

    renderApp(`/room/${ROOM_CODE}`, { socketFactory: () => socket });

    await screen.findByText(`Room code: ${ROOM_CODE}`);

    expect(socket.emittedEvents).toContainEqual({
      event: 'connect_to_room',
      payload: {},
    });
    expect(JSON.parse(window.localStorage.getItem('couchrush.game.room_session') ?? '{}')).toMatchObject({
      csrf_token: 'player-csrf-token-rotated',
    });
  });

  it('clears invalid reconnect state', async () => {
    const socket = new MockRoomSocketClient();
    installGuestAuthMock();
    window.localStorage.setItem('couchrush.game.room_session', JSON.stringify(PLAYER_SESSION));
    requestMock.mockImplementation(async (config) => {
      if (config.url === '/api/auth/refresh') {
        return jsonResponse(401, { detail: 'Invalid refresh token.' });
      }

      if (config.url === '/api/rooms/reconnect') {
        expect(config.headers?.['X-Room-CSRF-Token']).toBe(PLAYER_SESSION.csrf_token);
        return jsonResponse(404, { detail: 'Room session not found.' });
      }

      return jsonResponse(404, { detail: `Unhandled test URL: ${config.url ?? ''}` });
    });

    renderApp(`/room/${ROOM_CODE}`, { socketFactory: () => socket });

    expect(await screen.findByText('Room session not found.')).toBeInTheDocument();
    expect(window.localStorage.getItem('couchrush.game.room_session')).toBeNull();
  });

  it('shows the room closed state', async () => {
    const socket = new MockRoomSocketClient();
    socket.connectResponse = PLAYER_ROOM;
    installGuestAuthMock();
    window.localStorage.setItem('couchrush.game.room_session', JSON.stringify(PLAYER_SESSION));
    requestMock.mockImplementation(async (config) => {
      if (config.url === '/api/auth/refresh') {
        return jsonResponse(401, { detail: 'Invalid refresh token.' });
      }

      if (config.url === '/api/rooms/reconnect') {
        expect(config.headers?.['X-Room-CSRF-Token']).toBe(PLAYER_SESSION.csrf_token);
        return jsonResponse(200, { room: PLAYER_ROOM, session: PLAYER_SESSION });
      }

      return jsonResponse(404, { detail: `Unhandled test URL: ${config.url ?? ''}` });
    });

    renderApp(`/room/${ROOM_CODE}`, { socketFactory: () => socket });
    await screen.findByText(`Room code: ${ROOM_CODE}`);

    socket.emitServerEvent('room_closed', { room_id: HOST_ROOM.id });

    expect(await screen.findByText('This room has been closed.')).toBeInTheDocument();
  });

  it('leaves the room and clears the saved session', async () => {
    const socket = new MockRoomSocketClient();
    socket.connectResponse = PLAYER_ROOM;
    installAuthenticatedMock();
    window.localStorage.setItem('couchrush.game.room_session', JSON.stringify(PLAYER_SESSION));
    requestMock.mockImplementation(async (config) => {
      if (config.url === '/api/auth/refresh') {
        return jsonResponse(200, { access_token: 'auth-token', token_type: 'bearer', expires_in: 900 });
      }

      if (config.url === '/api/auth/me') {
        return jsonResponse(200, AUTH_USER);
      }

      if (config.url === '/api/users/me') {
        return jsonResponse(200, AUTH_PROFILE);
      }

      if (config.url === '/api/rooms/reconnect') {
        expect(config.headers?.['X-Room-CSRF-Token']).toBe(PLAYER_SESSION.csrf_token);
        return jsonResponse(200, { room: PLAYER_ROOM, session: PLAYER_SESSION });
      }

      if (config.url === '/api/rooms/leave') {
        expect(config.data).toEqual({});
        expect(config.headers?.['X-Room-CSRF-Token']).toBe(PLAYER_SESSION.csrf_token);
        return jsonResponse(204);
      }

      return jsonResponse(404, { detail: `Unhandled test URL: ${config.url ?? ''}` });
    });

    renderApp(`/room/${ROOM_CODE}`, { socketFactory: () => socket });
    await screen.findByText(`Room code: ${ROOM_CODE}`);

    await userEvent.click(screen.getByRole('button', { name: 'Leave room' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Create room' })).toBeInTheDocument();
    });
    expect(socket.emittedEvents).toContainEqual({
      event: 'connect_to_room',
      payload: {},
    });
    expect(window.localStorage.getItem('couchrush.game.room_session')).toBeNull();
  });

  it('remembers the login email when requested', async () => {
    installGuestAuthMock();
    requestMock.mockImplementation(async (config) => {
      if (config.url === '/api/auth/refresh') {
        return jsonResponse(401, { detail: 'Invalid refresh token.' });
      }

      if (config.url === '/api/auth/login') {
        expect(config.data).toEqual({ email: 'saved@example.com', password: 'secret-pass' });
        return jsonResponse(200, {
          access_token: 'auth-token',
          token_type: 'bearer',
          expires_in: 900,
        });
      }

      if (config.url === '/api/auth/me') {
        return jsonResponse(200, { ...AUTH_USER, email: 'saved@example.com' });
      }

      if (config.url === '/api/users/me') {
        return jsonResponse(200, { ...AUTH_PROFILE, email: 'saved@example.com' });
      }

      return jsonResponse(404, { detail: `Unhandled test URL: ${config.url ?? ''}` });
    });

    renderApp('/');

    await userEvent.type(await screen.findByRole('textbox', { name: 'Email' }), 'saved@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret-pass');
    await userEvent.click(screen.getByRole('checkbox', { name: 'Remember email' }));
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByText('Alex')).toBeInTheDocument();
    expect(window.localStorage.getItem('couchrush.game.remember_email')).toBe('saved@example.com');
    expect(window.localStorage.getItem('couchrush.game.remember_email.enabled')).toBe('true');
  });

  it('supports registration and returns to sign in with the new email', async () => {
    installGuestAuthMock();
    requestMock.mockImplementation(async (config) => {
      if (config.url === '/api/auth/refresh') {
        return jsonResponse(401, { detail: 'Invalid refresh token.' });
      }

      if (config.url === '/api/auth/register') {
        expect(config.data).toEqual({
          email: 'new-user@example.com',
          password: 'change-this-password',
          display_name: 'Nadia',
        });
        return jsonResponse(201, {
          id: '55555555-5555-5555-5555-555555555555',
          email: 'new-user@example.com',
          display_name: 'Nadia',
          is_active: true,
          roles: ['USER'],
          created_at: '2026-07-26T12:00:00Z',
        });
      }

      return jsonResponse(404, { detail: `Unhandled test URL: ${config.url ?? ''}` });
    });

    renderApp('/register');

    await userEvent.type(await screen.findByRole('textbox', { name: 'Display name' }), 'Nadia');
    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'new-user@example.com');
    const passwordInput = document.querySelector('input[type="password"]');
    if (!(passwordInput instanceof HTMLInputElement)) {
      throw new Error('Password input not found');
    }
    await userEvent.type(passwordInput, 'change-this-password');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(await screen.findByText('Account created. You can sign in now.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveValue('new-user@example.com');
  });
});
