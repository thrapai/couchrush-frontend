import { Box, Drawer, IconButton, Tooltip } from '@mui/material';
import { getApiErrorMessage } from '@couchrush/api-client';
import { useAuth } from '@couchrush/auth';
import { Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useGlobalSnackbar } from '../providers/globalSnackbarContext';
import { AdminSidebar } from './AdminSidebar';

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 88;
const SIDEBAR_TRANSITION = 'width 220ms cubic-bezier(0.2, 0, 0, 1)';

export function AdminShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showSnackbar } = useGlobalSnackbar();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

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
          transition: SIDEBAR_TRANSITION,
          '& .MuiDrawer-paper': {
            width: desktopSidebarOpen ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            transition: SIDEBAR_TRANSITION,
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
        <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 3 }, minWidth: 0 }}>
          <Tooltip title="Open navigation">
            <IconButton
              aria-label="Open navigation"
              onClick={() => setMobileDrawerOpen(true)}
              size="small"
              sx={{
                display: { xs: 'inline-flex', md: 'none' },
                mb: 2,
                borderRadius: 1,
                p: 0.5,
              }}
            >
              <Box component="img" src="/logo.png" alt="Couchrush" sx={{ display: 'block', width: 32, height: 'auto' }} />
            </IconButton>
          </Tooltip>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
