import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CouchRushThemeProvider } from '@couchrush/theme';
import { App } from './App';

type MockResponseInit = {
  status: number;
  body?: unknown;
};

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

function jsonResponse({ status, body }: MockResponseInit): Response {
  return new Response(body === undefined ? undefined : JSON.stringify(body), {
    status,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
  });
}

function renderApp(pathname: string) {
  window.history.pushState({}, '', pathname);

  return render(
    <CouchRushThemeProvider defaultMode="dark">
      <App />
    </CouchRushThemeProvider>,
  );
}

function mockFetchSequence(
  handlers: Array<(input: RequestInfo | URL, init?: RequestInit) => Response | Promise<Response>>,
) {
  const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

  handlers.forEach((handler) => {
    fetchMock.mockImplementationOnce(async (input, init) => handler(input, init));
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('admin auth flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('supports successful login', async () => {
    const fetchMock = mockFetchSequence([
      () => jsonResponse({ status: 401, body: { detail: 'Invalid refresh token.' } }),
      () => jsonResponse({ status: 200, body: { access_token: 'token-1', token_type: 'bearer', expires_in: 900 } }),
      (_, init) => {
        expect((init?.headers as Headers).get('Authorization')).toBe('Bearer token-1');
        return jsonResponse({ status: 200, body: ADMIN_USER });
      },
      () => jsonResponse({ status: 200, body: { status: 'ok' } }),
    ]);

    renderApp('/login');

    await userEvent.type(await screen.findByLabelText(/email/i), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'change-this-password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Authenticated and authorized.')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({ credentials: 'include', method: 'POST' }),
    );
  });

  it('shows failed login errors', async () => {
    mockFetchSequence([
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
    mockFetchSequence([
      () => jsonResponse({ status: 200, body: { access_token: 'token-2', token_type: 'bearer', expires_in: 900 } }),
      (_, init) => {
        expect((init?.headers as Headers).get('Authorization')).toBe('Bearer token-2');
        return jsonResponse({ status: 200, body: ADMIN_USER });
      },
      () => jsonResponse({ status: 200, body: { status: 'ok' } }),
    ]);

    renderApp('/admin');

    expect(await screen.findByText('Authenticated and authorized.')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', async () => {
    mockFetchSequence([() => jsonResponse({ status: 401, body: { detail: 'Invalid refresh token.' } })]);

    renderApp('/admin');

    expect(await screen.findByRole('heading', { name: 'Couchrush Admin' })).toBeInTheDocument();
  });

  it('retries one failed request after a successful refresh', async () => {
    const fetchMock = mockFetchSequence([
      () => jsonResponse({ status: 200, body: { access_token: 'expired-token', token_type: 'bearer', expires_in: 900 } }),
      () => jsonResponse({ status: 200, body: ADMIN_USER }),
      () => jsonResponse({ status: 401, body: { detail: 'Unauthorized' } }),
      () => jsonResponse({ status: 200, body: { access_token: 'fresh-token', token_type: 'bearer', expires_in: 900 } }),
      (_, init) => {
        expect((init?.headers as Headers).get('Authorization')).toBe('Bearer fresh-token');
        return jsonResponse({ status: 200, body: { status: 'ok' } });
      },
    ]);

    renderApp('/admin');

    expect(await screen.findByText('Authenticated and authorized.')).toBeInTheDocument();
    expect(fetchMock.mock.calls.filter((call) => call[0] === '/api/auth/refresh')).toHaveLength(2);
  });

  it('logs out and shows a session-expired message after refresh failure', async () => {
    mockFetchSequence([
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
    mockFetchSequence([
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
