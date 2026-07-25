import type { ApiClientOptions } from '@couchrush/api-client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CouchRushThemeProvider } from '@couchrush/theme';
import { App } from './App';

type MockResponseInit = {
  status: number;
  body?: unknown;
};

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
const requestMock = vi.fn<
  (config: { url?: string; method?: string; headers?: Record<string, string>; data?: unknown }) => Promise<MockAxiosResponse>
>();

const ADMIN_USER = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'admin@example.com',
  is_active: true,
  roles: ['ADMIN'],
  permissions: ['audit:read'],
};

const USER_WITHOUT_ADMIN = {
  ...ADMIN_USER,
  roles: ['USER'],
  permissions: [],
};

function jsonResponse({ status, body }: MockResponseInit): MockAxiosResponse {
  return {
    status,
    data: body,
    statusText: '',
    headers: {},
    config: { headers: {} as never },
  };
}

function renderApp(pathname: string) {
  window.history.pushState({}, '', pathname);
  const apiClientOptions: ApiClientOptions = {
    axios: {
      request: requestMock,
    } as unknown as MockAxiosInstance & ApiClientOptions['axios'],
  };

  return render(
    <CouchRushThemeProvider defaultMode="dark">
      <App apiClientOptions={apiClientOptions} />
    </CouchRushThemeProvider>,
  );
}

function mockRequestSequence(
  handlers: Array<
    (
      config: { url?: string; method?: string; headers?: Record<string, string>; data?: unknown },
    ) => MockAxiosResponse | Promise<MockAxiosResponse>
  >,
) {
  handlers.forEach((handler) => {
    requestMock.mockImplementationOnce(async (config) => handler(config));
  });

  return requestMock;
}

describe('admin auth flow', () => {
  beforeEach(() => {
    requestMock.mockReset();
  });

  it('supports successful login', async () => {
    const axiosMock = mockRequestSequence([
      () => jsonResponse({ status: 401, body: { detail: 'Invalid refresh token.' } }),
      () => jsonResponse({ status: 200, body: { access_token: 'token-1', token_type: 'bearer', expires_in: 900 } }),
      (config) => {
        expect(config.headers?.Authorization).toBe('Bearer token-1');
        return jsonResponse({ status: 200, body: ADMIN_USER });
      },
      () => jsonResponse({ status: 200, body: { status: 'ok' } }),
    ]);

    renderApp('/login');

    await userEvent.type(await screen.findByLabelText(/email/i), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'change-this-password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Authenticated and authorized.')).toBeInTheDocument();
    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/api/auth/login', method: 'POST' }),
    );
  });

  it('shows failed login errors', async () => {
    mockRequestSequence([
      () => jsonResponse({ status: 401, body: { detail: 'Invalid refresh token.' } }),
      () => jsonResponse({ status: 401, body: { detail: 'Invalid credentials.' } }),
    ]);

    renderApp('/login');

    await userEvent.type(await screen.findByLabelText(/email/i), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Invalid credentials.')).toBeInTheDocument();
  });

  it('restores the session after refresh', async () => {
    mockRequestSequence([
      () => jsonResponse({ status: 200, body: { access_token: 'token-2', token_type: 'bearer', expires_in: 900 } }),
      (config) => {
        expect(config.headers?.Authorization).toBe('Bearer token-2');
        return jsonResponse({ status: 200, body: ADMIN_USER });
      },
      () => jsonResponse({ status: 200, body: { status: 'ok' } }),
    ]);

    renderApp('/admin');

    expect(await screen.findByText('Authenticated and authorized.')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', async () => {
    mockRequestSequence([() => jsonResponse({ status: 401, body: { detail: 'Invalid refresh token.' } })]);

    renderApp('/admin');

    expect(await screen.findByRole('heading', { name: 'Couchrush Admin' })).toBeInTheDocument();
  });

  it('retries one failed request after a successful refresh', async () => {
    const axiosMock = mockRequestSequence([
      () => jsonResponse({ status: 200, body: { access_token: 'expired-token', token_type: 'bearer', expires_in: 900 } }),
      () => jsonResponse({ status: 200, body: ADMIN_USER }),
      () => jsonResponse({ status: 401, body: { detail: 'Unauthorized' } }),
      () => jsonResponse({ status: 200, body: { access_token: 'fresh-token', token_type: 'bearer', expires_in: 900 } }),
      (config) => {
        expect(config.headers?.Authorization).toBe('Bearer fresh-token');
        return jsonResponse({ status: 200, body: { status: 'ok' } });
      },
    ]);

    renderApp('/admin');

    expect(await screen.findByText('Authenticated and authorized.')).toBeInTheDocument();
    expect(axiosMock.mock.calls.filter(([config]) => config.url === '/api/auth/refresh')).toHaveLength(2);
  });

  it('logs out and shows a session-expired message after refresh failure', async () => {
    mockRequestSequence([
      () => jsonResponse({ status: 200, body: { access_token: 'expired-token', token_type: 'bearer', expires_in: 900 } }),
      () => jsonResponse({ status: 200, body: ADMIN_USER }),
      () => jsonResponse({ status: 401, body: { detail: 'Unauthorized' } }),
      () => jsonResponse({ status: 401, body: { detail: 'Invalid refresh token.' } }),
    ]);

    renderApp('/admin');

    expect(await screen.findByText('Your session has expired. Please sign in again.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Couchrush Admin' })).toBeInTheDocument();
  });

  it('shows a basic 403 state for authenticated users without admin access', async () => {
    mockRequestSequence([
      () => jsonResponse({ status: 200, body: { access_token: 'token-3', token_type: 'bearer', expires_in: 900 } }),
      () => jsonResponse({ status: 200, body: USER_WITHOUT_ADMIN }),
      () => jsonResponse({ status: 403, body: { detail: 'Forbidden' } }),
    ]);

    renderApp('/admin');

    expect(
      await screen.findByText('You are signed in, but you do not have access to the admin portal.'),
    ).toBeInTheDocument();
  });
});
