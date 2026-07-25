import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import { Box, Chip, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { hasAnyPermission, type AdminNavItem } from '../config/adminNavigation';

interface PermissionNavItemProps {
  item: AdminNavItem;
  permissions: string[];
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function PermissionNavItem({ item, permissions, collapsed = false, onNavigate }: PermissionNavItemProps) {
  const location = useLocation();

  if (!hasAnyPermission(permissions, item.requiredAnyPermissions)) {
    return null;
  }

  const isSelected = item.to ? location.pathname === item.to : false;
  const content = (
    <>
      <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, justifyContent: 'center' }}>{item.icon}</ListItemIcon>
      {!collapsed ? (
        <>
          <ListItemText
            primary={item.label}
            secondary={item.description}
            slotProps={{ primary: { variant: 'body2' }, secondary: { variant: 'caption' } }}
          />
          {item.comingSoon ? (
            <Chip size="small" label="Soon" color="default" />
          ) : (
            <Box component="span" sx={{ color: 'text.disabled', display: 'flex' }}>
              <ChevronRightRounded fontSize="small" />
            </Box>
          )}
        </>
      ) : null}
    </>
  );

  if (!item.to || item.comingSoon) {
    return (
      <Tooltip title={item.label} placement="right">
        <ListItemButton
          disabled
          sx={{ borderRadius: 2, justifyContent: collapsed ? 'center' : 'flex-start', px: collapsed ? 1.5 : 2 }}
        >
          {content}
        </ListItemButton>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={collapsed ? item.label : ''} placement="right" disableHoverListener={!collapsed}>
      <ListItemButton
        component={RouterLink}
        to={item.to}
        selected={isSelected}
        onClick={onNavigate}
        sx={{ borderRadius: 2, justifyContent: collapsed ? 'center' : 'flex-start', px: collapsed ? 1.5 : 2 }}
      >
        {content}
      </ListItemButton>
    </Tooltip>
  );
}
