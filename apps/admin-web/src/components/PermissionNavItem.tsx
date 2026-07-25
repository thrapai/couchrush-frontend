import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import { Box, Chip, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { hasAnyPermission, type AdminNavItem } from '../config/adminNavigation';

const NAV_ITEM_HEIGHT = 50;
const COLLAPSED_NAV_ITEM_WIDTH = 56;
const NAV_ICON_COLUMN_WIDTH = 56;
const SIDEBAR_TRANSITION = 'all 220ms cubic-bezier(0.2, 0, 0, 1)';

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
      <ListItemIcon
        sx={{
          minWidth: collapsed ? 0 : NAV_ICON_COLUMN_WIDTH,
          width: collapsed ? 'auto' : NAV_ICON_COLUMN_WIDTH,
          justifyContent: 'center',
          transition: SIDEBAR_TRANSITION,
        }}
      >
        {item.icon}
      </ListItemIcon>
      {!collapsed ? (
        <>
          <ListItemText
            primary={item.label}
            secondary={item.description}
            slotProps={{
              primary: {
                variant: 'body2',
                noWrap: true,
              },
              secondary: {
                variant: 'caption',
                noWrap: true,
                title: item.description,
              },
            }}
            sx={{
              my: 0,
              minWidth: 0,
              opacity: collapsed ? 0 : 1,
              transition: SIDEBAR_TRANSITION,
              '& .MuiListItemText-primary': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
              '& .MuiListItemText-secondary': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
            }}
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
          sx={{
            minHeight: NAV_ITEM_HEIGHT,
            width: collapsed ? COLLAPSED_NAV_ITEM_WIDTH : '100%',
            borderRadius: 1,
            justifyContent: collapsed ? 'center' : 'flex-start',
            px: 0,
            alignItems: 'center',
            mx: collapsed ? 'auto' : 0,
            transition: SIDEBAR_TRANSITION,
          }}
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
        sx={{
          minHeight: NAV_ITEM_HEIGHT,
          width: collapsed ? COLLAPSED_NAV_ITEM_WIDTH : '100%',
          borderRadius: 1,
          justifyContent: collapsed ? 'center' : 'flex-start',
          px: 0,
          alignItems: 'center',
          mx: collapsed ? 'auto' : 0,
          transition: SIDEBAR_TRANSITION,
        }}
      >
        {content}
      </ListItemButton>
    </Tooltip>
  );
}
