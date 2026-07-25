import AddRounded from '@mui/icons-material/AddRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import HomeRounded from '@mui/icons-material/HomeRounded';
import MenuRounded from '@mui/icons-material/MenuRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Fab,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { ColorModeToggle } from '@couchrush/theme';
import { ShowcaseSection } from '../components/ShowcaseSection';

export function ButtonsSection() {
  const [alignment, setAlignment] = useState('players');
  const [view, setView] = useState('grid');

  return (
    <ShowcaseSection
      id="buttons"
      title="Buttons"
      description="Interactive button and icon-button coverage against shared theme overrides."
    >
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="contained">Contained</Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="text">Text</Button>
          <Button color="secondary">Secondary</Button>
          <Button color="success">Success</Button>
          <Button color="warning">Warning</Button>
          <Button color="error">Error</Button>
          <Button color="info">Info</Button>
          <Button size="small">Small</Button>
          <Button size="medium">Medium</Button>
          <Button size="large">Large</Button>
          <Button disabled>Disabled</Button>
          <Button fullWidth sx={{ maxWidth: 240 }}>
            Full width
          </Button>
          <Button startIcon={<PlayArrowRounded />}>Start icon</Button>
          <Button endIcon={<ArrowForwardRounded />}>End icon</Button>
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <ButtonGroup aria-label="host actions">
            <Button>Launch</Button>
            <Button>Pause</Button>
            <Button>Reset</Button>
          </ButtonGroup>

          <ToggleButtonGroup
            value={alignment}
            exclusive
            onChange={(_, value) => {
              if (value) {
                setAlignment(value);
              }
            }}
            aria-label="showcase alignment"
          >
            <ToggleButton value="players">Players</ToggleButton>
            <ToggleButton value="teams">Teams</ToggleButton>
            <ToggleButton value="audience">Audience</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, value) => {
              if (value) {
                setView(value);
              }
            }}
            aria-label="showcase view"
          >
            <ToggleButton value="grid">Grid</ToggleButton>
            <ToggleButton value="list">List</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Fab color="primary" aria-label="add game">
            <AddRounded />
          </Fab>
          <Fab color="secondary" variant="extended">
            <StarRounded sx={{ mr: 1 }} />
            Featured Round
          </Fab>
          <Fab disabled aria-label="disabled action">
            <FavoriteRounded />
          </Fab>
        </Box>

        <Divider />

        <Box>
          <Typography variant="h5" gutterBottom>
            Icon Buttons
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <IconButton aria-label="default menu">
              <MenuRounded />
            </IconButton>
            <IconButton color="primary" aria-label="home">
              <HomeRounded />
            </IconButton>
            <IconButton color="secondary" aria-label="settings">
              <SettingsRounded />
            </IconButton>
            <IconButton size="small" aria-label="small favorite">
              <FavoriteRounded fontSize="small" />
            </IconButton>
            <IconButton size="medium" aria-label="medium favorite">
              <FavoriteRounded />
            </IconButton>
            <IconButton size="large" aria-label="large favorite">
              <FavoriteRounded fontSize="large" />
            </IconButton>
            <IconButton disabled aria-label="disabled favorite">
              <FavoriteRounded />
            </IconButton>
            <Tooltip title="Open settings">
              <IconButton aria-label="settings tooltip">
                <SettingsRounded />
              </IconButton>
            </Tooltip>
            <ColorModeToggle />
          </Box>
        </Box>
      </Stack>
    </ShowcaseSection>
  );
}
