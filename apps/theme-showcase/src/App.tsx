import InfoRounded from '@mui/icons-material/InfoRounded';
import MenuRounded from '@mui/icons-material/MenuRounded';
import {
  AppBar,
  Box,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { ColorModeToggle } from '@couchrush/theme';
import { ButtonsSection } from './sections/ButtonsSection';
import { DataDisplaySection } from './sections/DataDisplaySection';
import { DialogsSection } from './sections/DialogsSection';
import { FeedbackSection } from './sections/FeedbackSection';
import { FormInputsSection } from './sections/FormInputsSection';
import { GamePreviewsSection } from './sections/GamePreviewsSection';
import { LayoutSection } from './sections/LayoutSection';
import { NavigationSection } from './sections/NavigationSection';
import { SelectionControlsSection } from './sections/SelectionControlsSection';
import { ThemeTokensSection } from './sections/ThemeTokensSection';
import { TypographySection } from './sections/TypographySection';

const sectionLinks = [
  ['theme-tokens', 'Tokens'],
  ['typography', 'Typography'],
  ['buttons', 'Buttons'],
  ['navigation', 'Navigation'],
  ['form-inputs', 'Inputs'],
  ['selection-controls', 'Selection'],
  ['data-display', 'Data'],
  ['dialogs', 'Dialogs'],
  ['feedback', 'Feedback'],
  ['layout', 'Layout'],
  ['game-previews', 'Game Previews'],
] as const;

export function App() {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('theme-tokens');
  const drawerWidth = 320;

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Couchrush"
              sx={{ display: 'block', width: 156, maxWidth: '100%', height: 'auto', mb: 2 }}
            />
            <Typography variant="h4" sx={{ mb: 1 }}>
              CouchRush Theme Showcase
            </Typography>
            <Typography color="text.secondary">
              Visual test bed for the shared `@couchrush/theme` package across light and dark modes.
            </Typography>
          </Box>
          <ColorModeToggle />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2, color: 'text.secondary' }}>
          <Tooltip title="Use this app to validate shared theme behavior, not to patch around defects locally.">
            <InfoRounded color="primary" />
          </Tooltip>
          <Typography variant="body2">Shared theme verification only</Typography>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', p: 1.5 }}>
        <List sx={{ display: 'grid', gap: 0.5 }}>
          {sectionLinks.map(([id, label]) => (
            <ListItemButton
              key={id}
              component="a"
              href={`#${id}`}
              selected={activeSection === id}
              onClick={() => {
                setActiveSection(id);
                setMobileDrawerOpen(false);
              }}
            >
              <ListItemText primary={label} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      <AppBar
        position="fixed"
        sx={{
          display: { xs: 'block', lg: 'none' },
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Couchrush"
              sx={{ display: 'block', width: 112, maxWidth: '100%', height: 'auto', flexShrink: 0 }}
            />
            <Typography variant="h6" sx={{ minWidth: 0 }}>
              Theme Showcase
            </Typography>
          </Box>
          <IconButton
            aria-label="Open showcase drawer"
            onClick={() => setMobileDrawerOpen(true)}
          >
            <MenuRounded />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        variant="temporary"
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: 'min(320px, 100vw)',
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        open
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: '100%',
          overflowX: 'hidden',
        }}
      >
        <Toolbar sx={{ display: { xs: 'flex', lg: 'none' } }} />
        <Container
          maxWidth={false}
          sx={{
            width: '100%',
            maxWidth: 1440,
            mx: 'auto',
            py: { xs: 2, md: 4 },
            px: { xs: 1.5, sm: 2, md: 3 },
            overflowX: 'hidden',
            '& .MuiTypography-root': {
              maxWidth: '100%',
              overflowWrap: 'anywhere',
            },
          }}
        >
          <Stack spacing={3} sx={{ minWidth: 0 }}>
            <ThemeTokensSection />
            <TypographySection />
            <ButtonsSection />
            <NavigationSection />
            <FormInputsSection />
            <SelectionControlsSection />
            <DataDisplaySection />
            <DialogsSection />
            <FeedbackSection />
            <LayoutSection />
            <GamePreviewsSection />
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
