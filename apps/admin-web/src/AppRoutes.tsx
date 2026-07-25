import { RedirectIfAuthenticated, RequireAuth, useAuth } from '@couchrush/auth';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminShell } from './components/AdminShell';
import { LoadingScreen } from './components/LoadingScreen';
import { RequirePermissions } from './components/RequirePermissions';
import { AuthPageLayout } from './pages/AuthPageLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminOverviewPage } from './pages/AdminOverviewPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminAccessPage } from './pages/AdminAccessPage';
import { AdminProfilePage } from './pages/AdminProfilePage';

export function AppRoutes() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route element={<AuthPageLayout />}>
        <Route element={<RedirectIfAuthenticated />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/admin" element={<AdminShell />}>
          <Route index element={<AdminOverviewPage />} />
          <Route
            path="users"
            element={
              <RequirePermissions requiredAnyPermissions={['users:read']}>
                <AdminUsersPage />
              </RequirePermissions>
            }
          />
          <Route
            path="access"
            element={
              <RequirePermissions requiredAnyPermissions={['roles:manage']}>
                <AdminAccessPage />
              </RequirePermissions>
            }
          />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
