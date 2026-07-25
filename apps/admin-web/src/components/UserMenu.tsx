import MoreHorizRounded from '@mui/icons-material/MoreHorizRounded';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import PaletteRounded from '@mui/icons-material/PaletteRounded';
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { ColorModeToggle } from '@couchrush/theme';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CurrentUserResponse } from '@couchrush/api-client';

interface UserMenuProps {
  user: CurrentUserResponse;
  onLogout: () => Promise<void>;
  collapsed?: boolean;
}

export function UserMenu({ user, onLogout, collapsed = false }: UserMenuProps) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isOpen = Boolean(anchorEl);
  const primaryRole = user.roles[0] ?? 'USER';

  async function handleLogout() {
    setAnchorEl(null);
    await onLogout();
  }

  return (
    <>
      {collapsed ? (
        <Tooltip title="Open user menu">
          <IconButton aria-label="Open user menu" onClick={(event) => setAnchorEl(event.currentTarget)} color="inherit" size="small">
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
              {user.email.slice(0, 2).toUpperCase()}
            </Avatar>
          </IconButton>
        </Tooltip>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1.5,
            py: 1.25,
            borderRadius: 3,
            bgcolor: 'action.hover',
          }}
        >
          <Avatar sx={{ width: 40, height: 40, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
            {user.email.slice(0, 2).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {user.email}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {primaryRole}
            </Typography>
          </Box>
          <Tooltip title="Open user menu">
            <IconButton aria-label="Open user menu" onClick={(event) => setAnchorEl(event.currentTarget)} color="inherit" size="small">
              <MoreHorizRounded fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      <Menu anchorEl={anchorEl} open={isOpen} onClose={() => setAnchorEl(null)} keepMounted>
        <Box sx={{ px: 2, py: 1.5, maxWidth: 260 }}>
          <Typography variant="subtitle2" noWrap>
            {user.email}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {primaryRole}
          </Typography>
        </Box>
        <Divider />
        <MenuItem disableRipple sx={{ gap: 1.5, cursor: 'default' }}>
          <ListItemIcon>
            <PaletteRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Color mode" />
          <ColorModeToggle />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            navigate('/admin/profile');
          }}
        >
          <ListItemIcon>
            <PersonRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="My Profile" />
        </MenuItem>
        <MenuItem onClick={() => void handleLogout()}>
          <ListItemIcon>
            <LogoutRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
    </>
  );
}
