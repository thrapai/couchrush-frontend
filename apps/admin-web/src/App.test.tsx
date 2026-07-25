import type { ApiClientOptions } from '@couchrush/api-client';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CouchRushThemeProvider } from '@couchrush/theme';
import { App } from './App';

const REMEMBER_EMAIL_KEY = 'couchrush.admin.remember_email';
const REMEMBER_EMAIL_ENABLED_KEY = 'couchrush.admin.remember_email.enabled';
const storage = new Map<string, string>();

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
  display_name: 'Thomas',
  is_active: true,
  roles: ['ADMIN'],
  permissions: [
    'audit:read',
    'games:read',
    'roles:manage',
    'rooms:read',
    'sessions:read',
    'settings:manage',
    'users:manage',
    'users:read',
  ],
};

const SUPPORT_USER = {
  ...ADMIN_USER,
  roles: ['SUPPORT'],
  permissions: ['users:read', 'rooms:read', 'sessions:read'],
};

const NO_USERS_PERMISSION_USER = {
  ...ADMIN_USER,
  roles: ['VIEWER'],
  permissions: ['rooms:read'],
};

const ADMIN_PROFILE = {
  id: ADMIN_USER.id,
  email: ADMIN_USER.email,
  display_name: 'Thomas',
  is_active: true,
  roles: ADMIN_USER.roles,
  created_at: '2026-07-25T12:00:00Z',
  updated_at: '2026-07-25T12:10:00Z',
  last_login_at: '2026-07-25T12:20:00Z',
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

function installLocalStorageMock() {
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
    },
  });
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

function installDefaultApiMock() {
  requestMock.mockImplementation(async (config) => {
    if (config.url === '/api/auth/refresh') {
      return jsonResponse({ status: 200, body: { access_token: 'token-default', token_type: 'bearer', expires_in: 900 } });
    }

    if (config.url === '/api/auth/me') {
      return jsonResponse({ status: 200, body: ADMIN_USER });
    }

    if (config.url === '/api/users/me') {
      return jsonResponse({ status: 200, body: ADMIN_PROFILE });
    }

    if (config.url === '/api/admin/users?page=1&page_size=1') {
      return jsonResponse({ status: 200, body: { items: [], page: 1, page_size: 1, total: 42 } });
    }

    if (config.url === '/api/admin/users?page=1&page_size=1&is_active=true') {
      return jsonResponse({ status: 200, body: { items: [], page: 1, page_size: 1, total: 37 } });
    }

    if (config.url === '/api/auth/logout') {
      return jsonResponse({ status: 204 });
    }

    return jsonResponse({ status: 404, body: { detail: `Unhandled test URL: ${config.url ?? ''}` } });
  });
}

describe('admin portal shell', () => {
  beforeEach(() => {
    installLocalStorageMock();
    requestMock.mockReset();
    installDefaultApiMock();
    storage.delete(REMEMBER_EMAIL_KEY);
    storage.delete(REMEMBER_EMAIL_ENABLED_KEY);
  });

  it('supports successful login', async () => {
    const axiosMock = mockRequestSequence([
      () => jsonResponse({ status: 401, body: { detail: 'Invalid refresh token.' } }),
      () => jsonResponse({ status: 200, body: { access_token: 'token-1', token_type: 'bearer', expires_in: 900 } }),
      (config) => {
        expect(config.headers?.Authorization).toBe('Bearer token-1');
        return jsonResponse({ status: 200, body: ADMIN_USER });
      },
      (config) => {
        expect(config.headers?.Authorization).toBe('Bearer token-1');
        return jsonResponse({ status: 200, body: ADMIN_USER });
      },
    ]);

    renderApp('/login');

    await userEvent.type(await screen.findByRole('textbox', { name: 'Email' }), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'change-this-password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('heading', { name: 'Welcome back, Thomas' })).toBeInTheDocument();
    expect(axiosMock).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/auth/login', method: 'POST' }));
  });

  it('supports successful registration and redirects to login', async () => {
    mockRequestSequence([
      () => jsonResponse({ status: 401, body: { detail: 'Invalid refresh token.' } }),
      () =>
        jsonResponse({
          status: 201,
          body: {
            id: '22222222-2222-2222-2222-222222222222',
            email: 'new-user@example.com',
            display_name: 'Alex',
            is_active: true,
            roles: ['USER'],
            created_at: '2026-07-25T12:00:00Z',
          },
        }),
    ]);

    renderApp('/register');

    await userEvent.type(await screen.findByRole('textbox', { name: 'Display name' }), 'Alex');
    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'new-user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'change-this-password');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(await screen.findByText('Account created. You can sign in now.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveValue('new-user@example.com');
  });

  it('shows failed registration errors', async () => {
    mockRequestSequence([
      () => jsonResponse({ status: 401, body: { detail: 'Invalid refresh token.' } }),
      () => jsonResponse({ status: 409, body: { detail: 'Email already registered.' } }),
    ]);

    renderApp('/register');

    await userEvent.type(await screen.findByRole('textbox', { name: 'Email' }), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'change-this-password');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(await screen.findByText('Email already registered.')).toBeInTheDocument();
  });

  it('does not show a session-expired warning on a first login-page visit', async () => {
    mockRequestSequence([() => jsonResponse({ status: 401, body: { detail: 'Invalid refresh token.' } })]);

    renderApp('/login');

    expect(await screen.findByRole('heading', { name: 'Couchrush Admin' })).toBeInTheDocument();
    expect(screen.queryByText('Your session has expired. Please sign in again.')).not.toBeInTheDocument();
  });

  it('shell renders for an authenticated admin', async () => {
    mockRequestSequence([
      () => jsonResponse({ status: 200, body: { access_token: 'token-2', token_type: 'bearer', expires_in: 900 } }),
      () => jsonResponse({ status: 200, body: ADMIN_USER }),
    ]);

    renderApp('/admin');

    expect(await screen.findByRole('heading', { name: 'Welcome back, Thomas' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Users/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /Roles & Permissions/i })).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Open user menu'));
    expect(await screen.findByRole('menuitem', { name: /Switch to light mode/i })).toBeInTheDocument();
  });

  it('renders authenticated user access details and dashboard metrics', async () => {
    const axiosMock = mockRequestSequence([
      () => jsonResponse({ status: 200, body: { access_token: 'token-dashboard', token_type: 'bearer', expires_in: 900 } }),
      () => jsonResponse({ status: 200, body: ADMIN_USER }),
      () => jsonResponse({ status: 200, body: ADMIN_PROFILE }),
      () => jsonResponse({ status: 200, body: { items: [], page: 1, page_size: 1, total: 42 } }),
      () => jsonResponse({ status: 200, body: { items: [], page: 1, page_size: 1, total: 37 } }),
    ]);

    renderApp('/admin');

    expect(await screen.findByRole('heading', { name: 'Welcome back, Thomas' })).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
    expect(screen.getByText('8 permissions')).toBeInTheDocument();
    expect(screen.getByText('users:read')).toBeInTheDocument();
    expect(await screen.findByText('42')).toBeInTheDocument();
    expect(await screen.findByText('37')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Manage users' })).toHaveAttribute('href', '/admin/users');
    expect(screen.getByRole('link', { name: 'View my profile' })).toHaveAttribute('href', '/admin/profile');
    expect(axiosMock).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/admin/users?page=1&page_size=1' }));
    expect(axiosMock).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/admin/users?page=1&page_size=1&is_active=true' }));
  });

  it('shows unavailable user metrics and hides manage-users action without users:read', async () => {
    mockRequestSequence([
      () => jsonResponse({ status: 200, body: { access_token: 'token-no-users-read', token_type: 'bearer', expires_in: 900 } }),
      () => jsonResponse({ status: 200, body: NO_USERS_PERMISSION_USER }),
      () => jsonResponse({ status: 200, body: { ...ADMIN_PROFILE, roles: NO_USERS_PERMISSION_USER.roles } }),
    ]);

    renderApp('/admin');

    expect(await screen.findByText('User metrics are unavailable because this account does not have users:read.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Manage users' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View my profile' })).toHaveAttribute('href', '/admin/profile');
  });

  it('renders a backend error state when user metrics fail', async () => {
    mockRequestSequence([
      () => jsonResponse({ status: 200, body: { access_token: 'token-metric-error', token_type: 'bearer', expires_in: 900 } }),
      () => jsonResponse({ status: 200, body: ADMIN_USER }),
      () => jsonResponse({ status: 200, body: ADMIN_PROFILE }),
      () => jsonResponse({ status: 500, body: { detail: 'Metrics are unavailable.' } }),
      () => jsonResponse({ status: 200, body: { items: [], page: 1, page_size: 1, total: 37 } }),
    ]);

    renderApp('/admin');

    expect(await screen.findByText('Metrics are unavailable.')).toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('shows a loading state while the session is being restored', async () => {
    let resolveRefresh!: (value: MockAxiosResponse) => void;
    requestMock.mockImplementationOnce(
      () =>
        new Promise<MockAxiosResponse>((resolve) => {
          resolveRefresh = resolve;
        }),
    );

    renderApp('/admin');

    expect(screen.getByText('Loading session…')).toBeInTheDocument();

    resolveRefresh(jsonResponse({ status: 401, body: { detail: 'Invalid refresh token.' } }));
    await screen.findByRole('heading', { name: 'Couchrush Admin' });
  });

  it('mobile drawer opens and closes', async () => {
    mockRequestSequence([
      () => jsonResponse({ status: 200, body: { access_token: 'token-3', token_type: 'bearer', expires_in: 900 } }),
      () => jsonResponse({ status: 200, body: ADMIN_USER }),
    ]);

    renderApp('/admin');

    await screen.findByRole('heading', { name: 'Welcome back, Thomas' });
    await userEvent.click(screen.getByLabelText('Open navigation'));

    const mobileDrawer = await screen.findByTestId('mobile-navigation-drawer');
    expect(within(mobileDrawer).getByLabelText('Close navigation')).toBeInTheDocument();

    await userEvent.click(within(mobileDrawer).getByRole('link', { name: /Users/i }));
    await waitFor(() => {
      expect(screen.queryByLabelText('Close navigation')).not.toBeInTheDocument();
    });
  });

  it('navigation item is hidden when permission is missing', async () => {
    mockRequestSequence([
      () => jsonResponse({ status: 200, body: { access_token: 'token-4', token_type: 'bearer', expires_in: 900 } }),
      () => jsonResponse({ status: 200, body: SUPPORT_USER }),
    ]);

    renderApp('/admin');

    expect(await screen.findByRole('heading', { name: 'Welcome back, Thomas' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Users/i }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: /Roles & Permissions/i })).not.toBeInTheDocument();
  });

  it('logout action is triggered from the user menu', async () => {
    const axiosMock = mockRequestSequence([
      () => jsonResponse({ status: 200, body: { access_token: 'token-5', token_type: 'bearer', expires_in: 900 } }),
      () => jsonResponse({ status: 200, body: ADMIN_USER }),
      () => jsonResponse({ status: 200, body: ADMIN_PROFILE }),
      () => jsonResponse({ status: 200, body: { items: [], page: 1, page_size: 1, total: 42 } }),
      () => jsonResponse({ status: 200, body: { items: [], page: 1, page_size: 1, total: 37 } }),
      () => jsonResponse({ status: 204 }),
    ]);

    renderApp('/admin');

    await screen.findByRole('heading', { name: 'Welcome back, Thomas' });
    await userEvent.click(screen.getByLabelText('Open user menu'));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Logout' }));

    expect(await screen.findByRole('heading', { name: 'Couchrush Admin' })).toBeInTheDocument();
    expect(axiosMock).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/auth/logout', method: 'POST' }));
  });
});
