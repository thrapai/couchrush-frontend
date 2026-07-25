import ExpandLessRounded from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import KeyboardDoubleArrowLeftRounded from '@mui/icons-material/KeyboardDoubleArrowLeftRounded';
import KeyboardDoubleArrowRightRounded from '@mui/icons-material/KeyboardDoubleArrowRightRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import MoreHorizRounded from '@mui/icons-material/MoreHorizRounded';
import {
  Box,
  Collapse,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { couchRushFonts } from '@couchrush/theme';
import type { CurrentUserResponse } from '@couchrush/api-client';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminNavigationSections, hasAnyPermission } from '../config/adminNavigation';
import { PermissionNavItem } from './PermissionNavItem';
import { UserMenu } from './UserMenu';

const SIDEBAR_TRANSITION = 'all 220ms cubic-bezier(0.2, 0, 0, 1)';
const HEADER_HEIGHT = 64;
const RAIL_ITEM_WIDTH = 56;

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
  const navigate = useNavigate();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [moreAnchorEl, setMoreAnchorEl] = useState<HTMLElement | null>(null);
  const [isCollapsedRailHovered, setIsCollapsedRailHovered] = useState(false);
  const collapsedVisibleItems = useMemo(
    () =>
      adminNavigationSections.flatMap((section) =>
        section.items.filter((item) => hasAnyPermission(permissions, item.requiredAnyPermissions)),
      ),
    [permissions],
  );
  const pinnedCollapsedItems = collapsedVisibleItems.filter(
    (item) => item.id === 'overview' || item.id === 'roles-permissions',
  );
  const overflowCollapsedItems = collapsedVisibleItems.filter(
    (item) => item.id !== 'overview' && item.id !== 'roles-permissions',
  );

  function toggleSection(label: string) {
    setCollapsedSections((current) => ({
      ...current,
      [label]: !current[label],
    }));
  }

  function handleOverflowItemClick(to?: string) {
    setMoreAnchorEl(null);
    if (!to) {
      return;
    }

    navigate(to);
    onNavigate?.();
  }

  return (
    <Box
      sx={{
        width: { xs: 'min(320px, 100vw)', md: collapsed ? 88 : 280 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: SIDEBAR_TRANSITION,
      }}
      onMouseEnter={() => {
        if (collapsed) {
          setIsCollapsedRailHovered(true);
        }
      }}
      onMouseLeave={() => setIsCollapsedRailHovered(false)}
    >
      <Box
        sx={{
          px: 1.25,
          py: 1.25,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: HEADER_HEIGHT,
          transition: SIDEBAR_TRANSITION,
        }}
      >
        {collapsed ? (
          <Tooltip title="Open sidebar">
            <IconButton
              aria-label="Open sidebar"
              onClick={onToggleDesktop}
              sx={{
                display: { xs: 'none', md: 'inline-flex' },
                width: RAIL_ITEM_WIDTH,
                height: 50,
                borderRadius: 1,
                p: 0,
                transition: SIDEBAR_TRANSITION,
              }}
            >
              {isCollapsedRailHovered ? (
                <Box sx={{ width: 32, height: 32, display: 'grid', placeItems: 'center' }}>
                  <KeyboardDoubleArrowRightRounded sx={{ fontSize: 26 }} />
                </Box>
              ) : (
                <Box component="img" src="/logo.png" alt="Couchrush" sx={{ display: 'block', width: 32, height: 'auto' }} />
              )}
            </IconButton>
          </Tooltip>
        ) : (
          <>
            <Typography
              variant="h5"
              sx={{
                fontFamily: couchRushFonts.display,
                letterSpacing: 0,
                lineHeight: 1,
                fontSize: { xs: '1.4rem', md: '1.6rem' },
                whiteSpace: 'nowrap',
                transition: SIDEBAR_TRANSITION,
              }}
            >
              CouchRush
            </Typography>
            <Tooltip title="Collapse sidebar">
              <IconButton
                aria-label="Collapse sidebar"
                onClick={onToggleDesktop}
                sx={{
                  display: { xs: 'none', md: 'inline-flex' },
                  width: RAIL_ITEM_WIDTH,
                  height: 50,
                  borderRadius: 1,
                  p: 0,
                  transition: SIDEBAR_TRANSITION,
                }}
              >
                <Box sx={{ width: 32, height: 32, display: 'grid', placeItems: 'center' }}>
                  <KeyboardDoubleArrowLeftRounded sx={{ fontSize: 26 }} />
                </Box>
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

      <Stack
        spacing={collapsed ? 0.75 : 1.1}
        sx={{
          px: 1.25,
          py: 1.5,
          overflowY: 'auto',
          flex: 1,
          transition: SIDEBAR_TRANSITION,
        }}
      >
        {collapsed ? (
          <List disablePadding sx={{ display: 'grid', gap: 0.5, p: 0, m: 0 }}>
            {pinnedCollapsedItems.map((item) => (
              <PermissionNavItem
                key={item.id}
                item={item}
                permissions={permissions}
                onNavigate={onNavigate}
                collapsed
              />
            ))}
            {overflowCollapsedItems.length > 0 ? (
              <>
                <Tooltip title="More">
                  <ListItemButton
                    onClick={(event) => setMoreAnchorEl(event.currentTarget)}
                    sx={{
                      minHeight: 50,
                      width: RAIL_ITEM_WIDTH,
                      borderRadius: 1,
                      justifyContent: 'center',
                      px: 0,
                      alignItems: 'center',
                      mx: 'auto',
                      transition: SIDEBAR_TRANSITION,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
                      <MoreHorizRounded fontSize="small" />
                    </ListItemIcon>
                  </ListItemButton>
                </Tooltip>
                <Menu anchorEl={moreAnchorEl} open={Boolean(moreAnchorEl)} onClose={() => setMoreAnchorEl(null)} keepMounted>
                  {overflowCollapsedItems.map((item) => (
                    <MenuItem
                      key={item.id}
                      disabled={!item.to || item.comingSoon}
                      onClick={() => handleOverflowItemClick(item.to)}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} secondary={item.description} />
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : null}
          </List>
        ) : (
          adminNavigationSections.map((section) => {
            const visibleItems = section.items.filter((item) => hasAnyPermission(permissions, item.requiredAnyPermissions));
            if (visibleItems.length === 0) {
              return null;
            }

            if (visibleItems.length === 1) {
              return (
                <List key={section.label} disablePadding sx={{ display: 'grid', gap: 0.5, p: 0, m: 0 }}>
                  <PermissionNavItem
                    item={visibleItems[0]}
                    permissions={permissions}
                    onNavigate={onNavigate}
                    collapsed={false}
                  />
                </List>
              );
            }

            return (
              <Box key={section.label}>
                <ListItemButton
                  onClick={() => toggleSection(section.label)}
                  sx={{
                    minHeight: 30,
                    px: 1,
                    py: 0.375,
                    borderRadius: 1,
                  }}
                >
                  <ListItemText
                    primary={section.label}
                    slotProps={{
                      primary: {
                        variant: 'overline',
                        color: 'text.secondary',
                      },
                    }}
                  />
                  {collapsedSections[section.label] ? (
                    <ExpandMoreRounded fontSize="small" color="disabled" />
                  ) : (
                    <ExpandLessRounded fontSize="small" color="disabled" />
                  )}
                </ListItemButton>
                <Collapse in={!collapsedSections[section.label]} timeout="auto" unmountOnExit={false}>
                  <List disablePadding sx={{ display: 'grid', gap: 0.5, mt: 0.5, p: 0, m: 0 }}>
                    {visibleItems.map((item) => (
                      <PermissionNavItem
                        key={item.id}
                        item={item}
                        permissions={permissions}
                        onNavigate={onNavigate}
                        collapsed={false}
                      />
                    ))}
                  </List>
                </Collapse>
              </Box>
            );
          })
        )}
      </Stack>

      <Box
        sx={{
          px: 1.25,
          py: 1,
          mt: 'auto',
          display: collapsed ? 'flex' : 'block',
          justifyContent: collapsed ? 'center' : undefined,
          transition: SIDEBAR_TRANSITION,
        }}
      >
        <UserMenu user={user} onLogout={onLogout ?? (async () => {})} collapsed={collapsed} />
      </Box>
    </Box>
  );
}
