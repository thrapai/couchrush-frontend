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

describe('admin portal shell', () => {
  beforeEach(() => {
    installLocalStorageMock();
    requestMock.mockReset();
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

    expect(await screen.findByText('This is the reusable admin shell landing page. Feature pages will be added in later milestones.')).toBeInTheDocument();
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

    expect(await screen.findByText('This is the reusable admin shell landing page. Feature pages will be added in later milestones.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Users/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Roles & Permissions/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/switch to /i)).toBeInTheDocument();
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

    await screen.findByText('This is the reusable admin shell landing page. Feature pages will be added in later milestones.');
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

    expect(await screen.findByText('This is the reusable admin shell landing page. Feature pages will be added in later milestones.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Users/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Roles & Permissions/i })).not.toBeInTheDocument();
  });

  it('logout action is triggered from the user menu', async () => {
    const axiosMock = mockRequestSequence([
      () => jsonResponse({ status: 200, body: { access_token: 'token-5', token_type: 'bearer', expires_in: 900 } }),
      () => jsonResponse({ status: 200, body: ADMIN_USER }),
      () => jsonResponse({ status: 204 }),
    ]);

    renderApp('/admin');

    await screen.findByText('This is the reusable admin shell landing page. Feature pages will be added in later milestones.');
    await userEvent.click(screen.getByLabelText('Open user menu'));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Logout' }));

    expect(await screen.findByRole('heading', { name: 'Couchrush Admin' })).toBeInTheDocument();
    expect(axiosMock).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/auth/logout', method: 'POST' }));
  });
});
