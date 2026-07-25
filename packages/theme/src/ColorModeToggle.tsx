import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useColorScheme } from '@mui/material/styles';

interface ColorModeToggleProps {
  switchToDarkModeLabel?: string;
  switchToLightModeLabel?: string;
}

export function ColorModeToggle({ switchToDarkModeLabel, switchToLightModeLabel }: ColorModeToggleProps) {
  const { mode, setMode } = useColorScheme();

  if (!mode) {
    return null;
  }

  const resolvedMode = mode === 'system' ? 'dark' : mode;
  const nextMode = resolvedMode === 'dark' ? 'light' : 'dark';
  const label = nextMode === 'light'
    ? switchToLightModeLabel ?? 'Switch to light mode'
    : switchToDarkModeLabel ?? 'Switch to dark mode';

  return (
    <Tooltip title={label}>
      <IconButton aria-label={label} onClick={() => setMode(nextMode)}>
        {resolvedMode === 'dark' ? <LightModeRounded /> : <DarkModeRounded />}
      </IconButton>
    </Tooltip>
  );
}
