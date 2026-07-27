import axios, { type AxiosInstance } from 'axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  display_name?: string | null;
}

export interface AccessTokenResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
}

export interface CurrentUserResponse {
  id: string;
  email: string;
  display_name?: string | null;
  is_active: boolean;
  roles: string[];
  permissions: string[];
}

export interface CurrentUserProfileResponse {
  id: string;
  email: string;
  display_name: string | null;
  is_active: boolean;
  roles: string[];
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  display_name: string | null;
  is_active: boolean;
  roles: string[];
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface PaginatedUsersResponse {
  items: AdminUserSummary[];
  page: number;
  page_size: number;
  total: number;
}

export interface ListAdminUsersRequest {
  page?: number;
  page_size?: number;
  search?: string;
  role?: string;
  is_active?: boolean;
}

export interface RegisteredUserResponse {
  id: string;
  email: string;
  display_name: string | null;
  is_active: boolean;
  roles: string[];
  created_at: string;
}

export interface ValidationErrorItem {
  loc: Array<string | number>;
  msg: string;
  type: string;
}

export interface ValidationErrorResponse {
  detail: ValidationErrorItem[];
}

export interface ErrorDetailResponse {
  detail: string;
}

export type ApiErrorResponse = ErrorDetailResponse | ValidationErrorResponse | unknown;

export type RoomStatus = 'LOBBY' | 'IN_GAME' | 'CLOSED';
export type RoomViewerRole = 'HOST' | 'PLAYER' | 'DISPLAY';

export interface RoomMemberPublicResponse {
  id: string;
  display_name: string;
  is_host: boolean;
  is_player: boolean;
  is_connected: boolean;
}

export interface RoomPublicStateResponse {
  id: string;
  code: string;
  status: RoomStatus;
  is_public: boolean;
  player_limit: number;
  player_count: number;
  inactivity_timeout_seconds: number;
  created_at: string;
  last_activity_at: string;
  members: RoomMemberPublicResponse[];
}

export interface HostRoomStateResponse extends RoomPublicStateResponse {
  viewer_role: 'HOST';
  host_member_id: string;
}

export interface PlayerRoomStateResponse extends RoomPublicStateResponse {
  viewer_role: 'PLAYER';
  self_member_id: string;
  self_is_host: boolean;
  self_is_player: boolean;
}

export interface DisplayRoomStateResponse extends RoomPublicStateResponse {
  viewer_role: 'DISPLAY';
}

export type RoomControllerStateResponse = HostRoomStateResponse | PlayerRoomStateResponse;
export type AnyRoomStateResponse =
  | RoomPublicStateResponse
  | HostRoomStateResponse
  | PlayerRoomStateResponse
  | DisplayRoomStateResponse;

export interface RoomMemberSessionResponse {
  room_id: string;
  room_code: string;
  member_id: string;
  is_host: boolean;
  is_player: boolean;
  csrf_token: string;
}

export interface CreateRoomRequest {
  display_name: string;
  participate_as_player: boolean;
  player_limit?: number;
  is_public?: boolean;
  inactivity_timeout_seconds?: number;
}

export interface JoinRoomRequest {
  room_code: string;
  display_name: string;
}

export interface JoinPublicRoomRequest {
  display_name: string;
}

export interface RemoveRoomMemberRequest {
  member_id: string;
}

export interface RoomSessionCsrfRequest {
  csrf_token: string;
}

export interface CreateRoomResponse {
  room: RoomControllerStateResponse;
  session: RoomMemberSessionResponse;
}

export interface JoinRoomResponse {
  room: PlayerRoomStateResponse;
  session: RoomMemberSessionResponse;
}

export interface PublicRoomSummaryResponse {
  id: string;
  code: string;
  status: RoomStatus;
  player_limit: number;
  player_count: number;
  members: RoomMemberPublicResponse[];
  host_display_name: string | null;
  created_at: string;
  last_activity_at: string;
  inactivity_timeout_seconds: number;
}

export interface PaginatedPublicRoomsResponse {
  items: PublicRoomSummaryResponse[];
  page: number;
  page_size: number;
  total: number;
}

export interface ReconnectRoomResponse {
  room: RoomControllerStateResponse;
  session: RoomMemberSessionResponse;
}

export interface RefreshRoomSessionResponse {
  session: RoomMemberSessionResponse;
}

export class ApiError extends Error {
  readonly status: number;
  readonly data: ApiErrorResponse;

  constructor(status: number, data: ApiErrorResponse, message?: string) {
    super(message ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function isValidationErrorResponse(data: unknown): data is ValidationErrorResponse {
  if (!data || typeof data !== 'object' || !('detail' in data)) {
    return false;
  }

  const { detail } = data as { detail?: unknown };
  return (
    Array.isArray(detail) &&
    detail.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        'msg' in item &&
        typeof (item as { msg: unknown }).msg === 'string',
    )
  );
}

export function getApiErrorMessage(error: unknown, fallback = 'Request failed.'): string {
  if (error instanceof ApiError) {
    const { data } = error;

    if (isValidationErrorResponse(data)) {
      return data.detail.map((item) => item.msg).join(' ');
    }

    if (data && typeof data === 'object' && 'detail' in data && typeof data.detail === 'string') {
      return data.detail;
    }

    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export interface ApiClientOptions {
  baseUrl?: string;
  axios?: AxiosInstance;
  getAccessToken?: () => string | null;
  refreshAccessToken?: () => Promise<string | null>;
}

interface RequestOptions {
  method?: string;
  path: string;
  body?: unknown;
  authenticated?: boolean;
  retryOnUnauthorized?: boolean;
  headers?: Record<string, string>;
}

export class ApiClient {
  private readonly client: AxiosInstance;
  private readonly getAccessToken?: () => string | null;
  private readonly refreshAccessToken?: () => Promise<string | null>;

  constructor(options: ApiClientOptions = {}) {
    this.client =
      options.axios ??
      axios.create({
        baseURL: options.baseUrl?.replace(/\/$/, '') ?? '',
        withCredentials: true,
        validateStatus: () => true,
      });
    this.getAccessToken = options.getAccessToken;
    this.refreshAccessToken = options.refreshAccessToken;
  }

  async login(payload: LoginRequest): Promise<AccessTokenResponse> {
    return this.request<AccessTokenResponse>({
      method: 'POST',
      path: '/api/auth/login',
      body: payload,
      retryOnUnauthorized: false,
    });
  }

  async register(payload: RegisterRequest): Promise<RegisteredUserResponse> {
    return this.request<RegisteredUserResponse>({
      method: 'POST',
      path: '/api/auth/register',
      body: payload,
      retryOnUnauthorized: false,
    });
  }

  async refresh(): Promise<AccessTokenResponse> {
    return this.request<AccessTokenResponse>({
      method: 'POST',
      path: '/api/auth/refresh',
      retryOnUnauthorized: false,
    });
  }

  async logout(): Promise<void> {
    await this.request<void>({
      method: 'POST',
      path: '/api/auth/logout',
      retryOnUnauthorized: false,
    });
  }

  async getCurrentUser(): Promise<CurrentUserResponse> {
    return this.request<CurrentUserResponse>({
      path: '/api/auth/me',
      authenticated: true,
    });
  }

  async getCurrentUserProfile(): Promise<CurrentUserProfileResponse> {
    return this.request<CurrentUserProfileResponse>({
      path: '/api/users/me',
      authenticated: true,
    });
  }

  async checkAdminAccess(): Promise<{ status: string }> {
    return this.request<{ status: string }>({
      path: '/api/admin/audit-logs/access-check',
      authenticated: true,
    });
  }

  async listAdminUsers(params: ListAdminUsersRequest = {}): Promise<PaginatedUsersResponse> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        query.set(key, String(value));
      }
    });

    return this.request<PaginatedUsersResponse>({
      path: `/api/admin/users${query.size ? `?${query.toString()}` : ''}`,
      authenticated: true,
    });
  }

  async createRoom(payload: CreateRoomRequest): Promise<CreateRoomResponse> {
    return this.request<CreateRoomResponse>({
      method: 'POST',
      path: '/api/rooms',
      body: payload,
      authenticated: true,
      retryOnUnauthorized: false,
    });
  }

  async getRoom(roomId: string): Promise<RoomPublicStateResponse> {
    return this.request<RoomPublicStateResponse>({
      path: `/api/rooms/${roomId}`,
      retryOnUnauthorized: false,
    });
  }

  async getRoomByCode(roomCode: string): Promise<RoomPublicStateResponse> {
    return this.request<RoomPublicStateResponse>({
      path: `/api/rooms/code/${encodeURIComponent(roomCode)}`,
      retryOnUnauthorized: false,
    });
  }

  async joinRoom(payload: JoinRoomRequest): Promise<JoinRoomResponse> {
    return this.request<JoinRoomResponse>({
      method: 'POST',
      path: '/api/rooms/join',
      body: payload,
      authenticated: true,
      retryOnUnauthorized: false,
    });
  }

  async listPublicRooms(page = 1, pageSize = 20): Promise<PaginatedPublicRoomsResponse> {
    const query = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });

    return this.request<PaginatedPublicRoomsResponse>({
      path: `/api/rooms/public?${query.toString()}`,
      retryOnUnauthorized: false,
    });
  }

  async joinPublicRoom(roomId: string, payload: JoinPublicRoomRequest): Promise<JoinRoomResponse> {
    return this.request<JoinRoomResponse>({
      method: 'POST',
      path: `/api/rooms/public/${roomId}/join`,
      body: payload,
      authenticated: true,
      retryOnUnauthorized: false,
    });
  }

  async reconnectRoom(csrfToken: string): Promise<ReconnectRoomResponse> {
    return this.request<ReconnectRoomResponse>({
      method: 'POST',
      path: '/api/rooms/reconnect',
      body: {},
      retryOnUnauthorized: false,
      headers: {
        'X-Room-CSRF-Token': csrfToken,
      },
    });
  }

  async refreshRoomSession(
    roomId: string,
    csrfToken: string,
  ): Promise<RefreshRoomSessionResponse> {
    return this.request<RefreshRoomSessionResponse>({
      method: 'POST',
      path: `/api/rooms/${roomId}/session/refresh`,
      body: {},
      retryOnUnauthorized: false,
      headers: {
        'X-Room-CSRF-Token': csrfToken,
      },
    });
  }

  async leaveRoom(csrfToken: string): Promise<void> {
    await this.request<void>({
      method: 'POST',
      path: '/api/rooms/leave',
      body: {},
      retryOnUnauthorized: false,
      headers: {
        'X-Room-CSRF-Token': csrfToken,
      },
    });
  }

  async removeRoomMember(payload: RemoveRoomMemberRequest, csrfToken: string): Promise<void> {
    await this.request<void>({
      method: 'POST',
      path: '/api/rooms/remove-member',
      body: payload,
      retryOnUnauthorized: false,
      headers: {
        'X-Room-CSRF-Token': csrfToken,
      },
    });
  }

  async closeRoom(csrfToken: string): Promise<void> {
    await this.request<void>({
      method: 'POST',
      path: '/api/rooms/close',
      body: {},
      retryOnUnauthorized: false,
      headers: {
        'X-Room-CSRF-Token': csrfToken,
      },
    });
  }

  private async request<T>(options: RequestOptions, accessTokenOverride?: string | null): Promise<T> {
    const headers: Record<string, string> = { ...(options.headers ?? {}) };

    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const accessToken = accessTokenOverride ?? this.getAccessToken?.() ?? null;
    if (options.authenticated && accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await this.client.request({
      url: options.path,
      method: options.method ?? 'GET',
      headers,
      data: options.body,
    });

    if (response.status === 401 && options.authenticated && options.retryOnUnauthorized !== false) {
      const refreshedToken = await this.refreshAccessToken?.();
      if (refreshedToken) {
        return this.request<T>({ ...options, retryOnUnauthorized: false }, refreshedToken);
      }
    }

    if (response.status < 200 || response.status >= 300) {
      throw new ApiError(response.status, response.data);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.data as T;
  }
}
