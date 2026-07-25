import KeyboardDoubleArrowLeftRounded from '@mui/icons-material/KeyboardDoubleArrowLeftRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { Box, IconButton, List, Stack, Tooltip, Typography } from '@mui/material';
import { couchRushFonts } from '@couchrush/theme';
import type { CurrentUserResponse } from '@couchrush/api-client';
import { adminNavigationSections, hasAnyPermission } from '../config/adminNavigation';
import { PermissionNavItem } from './PermissionNavItem';
import { UserMenu } from './UserMenu';

interface AdminSidebarProps {
  user: CurrentUserResponse;
  permissions: string[];
  collapsed?: boolean;
  onToggleDesktop?: () => void;
  onLogout?: () => Promise<void>;
  onNavigate?: () => void;
  onClose?: () => void;
}

export function AdminSidebar({
  user,
  permissions,
  collapsed = false,
  onToggleDesktop,
  onLogout,
  onNavigate,
  onClose,
}: AdminSidebarProps) {
  return (
    <Box
      sx={{
        width: { xs: 'min(320px, 100vw)', md: collapsed ? 88 : 280 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          px: collapsed ? 1 : 2,
          pt: 2,
          pb: 1.5,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 72,
        }}
      >
        {collapsed ? (
          <Tooltip title="Open sidebar">
            <IconButton aria-label="Open sidebar" onClick={onToggleDesktop} sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
              <Box component="img" src="/logo.png" alt="Couchrush" sx={{ display: 'block', width: 36, height: 'auto' }} />
            </IconButton>
          </Tooltip>
        ) : (
          <>
            <Typography
              variant="h5"
              sx={{
                fontFamily: couchRushFonts.display,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                fontSize: { xs: '1.6rem', md: '1.8rem' },
              }}
            >
              CouchRush
            </Typography>
            <Tooltip title="Collapse sidebar">
              <IconButton aria-label="Collapse sidebar" onClick={onToggleDesktop} sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
                <KeyboardDoubleArrowLeftRounded />
              </IconButton>
            </Tooltip>
          </>
        )}
        {onClose ? (
          <IconButton aria-label="Close navigation" onClick={onClose} sx={{ display: { md: 'none' }, position: 'absolute', top: 12, right: 12 }}>
            <CloseRounded />
          </IconButton>
        ) : null}
      </Box>

      <Stack spacing={collapsed ? 1.5 : 2} sx={{ px: collapsed ? 1 : 1.5, py: 2, overflowY: 'auto', flex: 1 }}>
        {adminNavigationSections.map((section) => {
          const visibleItems = section.items.filter((item) => hasAnyPermission(permissions, item.requiredAnyPermissions));
          if (visibleItems.length === 0) {
            return null;
          }

          return (
            <Box key={section.label}>
              {!collapsed ? (
                <Typography variant="overline" color="text.secondary" sx={{ px: 1.5 }}>
                  {section.label}
                </Typography>
              ) : null}
              <List sx={{ display: 'grid', gap: 0.5, mt: 0.5 }}>
                {visibleItems.map((item) => (
                  <PermissionNavItem
                    key={item.id}
                    item={item}
                    permissions={permissions}
                    onNavigate={onNavigate}
                    collapsed={collapsed}
                  />
                ))}
              </List>
            </Box>
          );
        })}
      </Stack>

      <Box sx={{ px: collapsed ? 1 : 1.5, py: 1.5, mt: 'auto' }}>
        <UserMenu user={user} onLogout={onLogout ?? (async () => {})} collapsed={collapsed} />
      </Box>
    </Box>
  );
}
