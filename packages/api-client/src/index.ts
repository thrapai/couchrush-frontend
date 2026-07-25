export interface LoginRequest {
  email: string;
  password: string;
}

export interface AccessTokenResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
}

export interface CurrentUserResponse {
  id: string;
  email: string;
  is_active: boolean;
  roles: string[];
  permissions: string[];
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
  fetch?: typeof fetch;
  getAccessToken?: () => string | null;
  refreshAccessToken?: () => Promise<string | null>;
}

interface RequestOptions {
  method?: string;
  path: string;
  body?: unknown;
  authenticated?: boolean;
  retryOnUnauthorized?: boolean;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  private readonly getAccessToken?: () => string | null;
  private readonly refreshAccessToken?: () => Promise<string | null>;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl?.replace(/\/$/, '') ?? '';
    this.fetchImpl = options.fetch
      ? (input, init) => options.fetch!(input, init)
      : (input, init) => fetch(input, init);
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

  async checkAdminAccess(): Promise<{ status: string }> {
    return this.request<{ status: string }>({
      path: '/api/admin/audit-logs/access-check',
      authenticated: true,
    });
  }

  private async request<T>(options: RequestOptions, accessTokenOverride?: string | null): Promise<T> {
    const headers = new Headers();

    if (options.body !== undefined) {
      headers.set('Content-Type', 'application/json');
    }

    const accessToken = accessTokenOverride ?? this.getAccessToken?.() ?? null;
    if (options.authenticated && accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const response = await this.fetchImpl(`${this.baseUrl}${options.path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: 'include',
    });

    if (response.status === 401 && options.authenticated && options.retryOnUnauthorized !== false) {
      const refreshedToken = await this.refreshAccessToken?.();
      if (refreshedToken) {
        return this.request<T>({ ...options, retryOnUnauthorized: false }, refreshedToken);
      }
    }

    if (!response.ok) {
      throw new ApiError(response.status, await parseResponseBody(response));
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await parseResponseBody(response)) as T;
  }
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text.length > 0 ? text : undefined;
}
