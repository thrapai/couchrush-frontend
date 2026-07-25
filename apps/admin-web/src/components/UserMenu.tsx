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
import { LanguageSwitcher, useTranslation } from '@couchrush/i18n';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CurrentUserResponse } from '@couchrush/api-client';

const SIDEBAR_TRANSITION = 'all 220ms cubic-bezier(0.2, 0, 0, 1)';

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
  const { t } = useTranslation('common');
  const { mode, setMode } = useColorScheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isOpen = Boolean(anchorEl);
  const primaryRole = formatRole(user.roles[0] ?? 'USER');
  const resolvedMode = mode === 'system' || !mode ? 'dark' : mode;
  const nextMode = resolvedMode === 'dark' ? 'light' : 'dark';
  const colorModeLabel = t(nextMode === 'light' ? 'common.theme.switchToLightMode' : 'common.theme.switchToDarkMode');
  const displayName = user.display_name?.trim() || user.email;
  const avatarSeed = (user.display_name?.trim() || user.email).slice(0, 2).toUpperCase();

  async function handleLogout() {
    setAnchorEl(null);
    await onLogout();
  }

  return (
    <>
      {collapsed ? (
        <Tooltip title={t('common.userMenu.open')}>
          <IconButton
            aria-label={t('common.userMenu.open')}
            onClick={(event) => setAnchorEl(event.currentTarget)}
            color="inherit"
            size="small"
            sx={{
              width: 56,
              height: 50,
              borderRadius: 1,
              p: 0,
              mx: 'auto',
              display: 'flex',
              transition: SIDEBAR_TRANSITION,
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', color: 'secondary.contrastText', fontSize: '0.9rem' }}>
              {avatarSeed}
            </Avatar>
          </IconButton>
        </Tooltip>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 0.875,
            py: 0.5,
            borderRadius: 1,
            bgcolor: 'action.hover',
            minHeight: 50,
            transition: SIDEBAR_TRANSITION,
          }}
        >
          <Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main', color: 'secondary.contrastText', fontSize: '0.85rem' }}>
            {avatarSeed}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {primaryRole}
            </Typography>
          </Box>
          <Tooltip title={t('common.userMenu.open')}>
            <IconButton
              aria-label={t('common.userMenu.open')}
              onClick={(event) => setAnchorEl(event.currentTarget)}
              color="inherit"
              size="small"
              sx={{ p: 0.5, borderRadius: 1 }}
            >
              <MoreHorizRounded fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      <Menu anchorEl={anchorEl} open={isOpen} onClose={() => setAnchorEl(null)} keepMounted>
        <Box sx={{ px: 2, py: 1.5, maxWidth: 260, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main', color: 'secondary.contrastText', fontSize: '0.8rem' }}>
            {avatarSeed}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {primaryRole}
            </Typography>
          </Box>
        </Box>
        <Divider />
        <Box sx={{ px: 1.25, py: 1 }}>
          <LanguageSwitcher />
        </Box>
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
          <ListItemText primary={t('common.auth.profile')} />
        </MenuItem>
        <MenuItem onClick={() => void handleLogout()}>
          <ListItemIcon>
            <LogoutRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('common.auth.logout')} />
        </MenuItem>
      </Menu>
    </>
  );
}
