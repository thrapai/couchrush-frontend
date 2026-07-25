import { Box, Drawer } from '@mui/material';
import { getApiErrorMessage } from '@couchrush/api-client';
import { useAuth } from '@couchrush/auth';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAdminRouteMeta } from '../config/adminNavigation';
import { useGlobalSnackbar } from '../providers/globalSnackbarContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopBar } from './AdminTopBar';

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 88;

export function AdminShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSnackbar } = useGlobalSnackbar();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  const routeMeta = getAdminRouteMeta(location.pathname);

  useEffect(() => {
    document.title = `${routeMeta.title} | Couchrush Admin`;
  }, [routeMeta.title]);

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      showSnackbar({
        severity: 'warning',
        message: getApiErrorMessage(error, 'Signed out locally. The server session could not be revoked.'),
      });
    } finally {
      navigate('/login', { replace: true });
    }
  }

  if (!user) {
    return null;
  }

  function handleOpenNavigation() {
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(min-width: 900px)').matches
    ) {
      setDesktopSidebarOpen((current) => !current);
      return;
    }

    setMobileDrawerOpen(true);
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      <Drawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        variant="temporary"
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 'min(320px, 100vw)',
            boxSizing: 'border-box',
          },
        }}
      >
        <Box data-testid="mobile-navigation-drawer" sx={{ height: '100%' }}>
          <AdminSidebar
            user={user}
            permissions={user.permissions}
            onLogout={handleLogout}
            onNavigate={() => setMobileDrawerOpen(false)}
            onClose={() => setMobileDrawerOpen(false)}
          />
        </Box>
      </Drawer>

      <Drawer
        open
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: desktopSidebarOpen ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH,
          flexShrink: 0,
          transition: (theme) => theme.transitions.create('width'),
          '& .MuiDrawer-paper': {
            width: desktopSidebarOpen ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            transition: (theme) => theme.transitions.create('width'),
          },
        }}
      >
        <AdminSidebar
          user={user}
          permissions={user.permissions}
          collapsed={!desktopSidebarOpen}
          onToggleDesktop={() => setDesktopSidebarOpen((current) => !current)}
          onLogout={handleLogout}
        />
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AdminTopBar
          title={routeMeta.title}
          breadcrumbs={routeMeta.breadcrumbs}
          onOpenNavigation={handleOpenNavigation}
        />
        <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 3 }, minWidth: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
