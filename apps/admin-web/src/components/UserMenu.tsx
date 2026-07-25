import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import MoreHorizRounded from '@mui/icons-material/MoreHorizRounded';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
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
import { useColorScheme } from '@mui/material/styles';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CurrentUserResponse } from '@couchrush/api-client';

interface UserMenuProps {
  user: CurrentUserResponse;
  onLogout: () => Promise<void>;
  collapsed?: boolean;
}

function formatRole(role: string) {
  return role
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function UserMenu({ user, onLogout, collapsed = false }: UserMenuProps) {
  const navigate = useNavigate();
  const { mode, setMode } = useColorScheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isOpen = Boolean(anchorEl);
  const primaryRole = formatRole(user.roles[0] ?? 'USER');
  const resolvedMode = mode === 'system' || !mode ? 'dark' : mode;
  const nextMode = resolvedMode === 'dark' ? 'light' : 'dark';
  const colorModeLabel = `Switch to ${nextMode} mode`;
  const displayName = user.display_name?.trim() || user.email;
  const avatarSeed = (user.display_name?.trim() || user.email).slice(0, 2).toUpperCase();

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
              {avatarSeed}
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
            {avatarSeed}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {displayName}
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
            {displayName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {primaryRole}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => setMode(nextMode)}>
          <ListItemIcon>
            {nextMode === 'light' ? <LightModeRounded fontSize="small" /> : <DarkModeRounded fontSize="small" />}
          </ListItemIcon>
          <ListItemText primary={colorModeLabel} />
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
