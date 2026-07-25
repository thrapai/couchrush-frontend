import AccountCircleRounded from '@mui/icons-material/AccountCircleRounded';
import DashboardRounded from '@mui/icons-material/DashboardRounded';
import InsightsRounded from '@mui/icons-material/InsightsRounded';
import ListAltRounded from '@mui/icons-material/ListAltRounded';
import MoreHorizRounded from '@mui/icons-material/MoreHorizRounded';
import PeopleRounded from '@mui/icons-material/PeopleRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Breadcrumbs,
  Button,
  Drawer,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { ShowcaseSection } from '../components/ShowcaseSection';

export function NavigationSection() {
  const [bottomNav, setBottomNav] = useState('dashboard');
  const [tabValue, setTabValue] = useState(0);
  const [scrollTabValue, setScrollTabValue] = useState(1);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <ShowcaseSection
      id="navigation"
      title="Navigation"
      description="Navigation patterns, tabs, and menus rendered inside contained previews."
    >
      <Stack spacing={3}>
        <AppBar position="static">
          <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Host Dashboard
            </Typography>
            <Button color="inherit">Rounds</Button>
            <Button color="inherit">Leaderboard</Button>
            <Button color="inherit">Settings</Button>
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '300px 1fr' },
            gap: 2,
          }}
        >
          <Paper variant="outlined" sx={{ p: 2, minHeight: 320, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1">Drawer preview</Typography>
              <Button onClick={() => setDrawerOpen((open) => !open)}>
                {drawerOpen ? 'Close drawer' : 'Open drawer'}
              </Button>
            </Box>
            <Box
              sx={{
                position: 'relative',
                minHeight: 248,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.default',
              }}
            >
              <Drawer
                anchor="left"
                open={drawerOpen}
                variant="persistent"
                slotProps={{
                  paper: {
                    sx: {
                      position: 'absolute',
                      inset: '0 auto 0 0',
                      width: 260,
                      height: '100%',
                    },
                  },
                }}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: 260,
                  flexShrink: 0,
                  '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                  },
                }}
              >
                <Box sx={{ width: 260, height: '100%', p: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                    <IconButton aria-label="Close drawer panel" onClick={() => setDrawerOpen(false)}>
                      <MoreHorizRounded />
                    </IconButton>
                  </Box>
                  <List>
                    <ListItem disablePadding>
                      <ListItemButton selected>
                      <DashboardRounded sx={{ mr: 1.5 }} />
                      <ListItemText primary="Overview" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton>
                      <PeopleRounded sx={{ mr: 1.5 }} />
                      <ListItemText primary="Players" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton disabled>
                      <InsightsRounded sx={{ mr: 1.5 }} />
                      <ListItemText primary="Analytics" />
                    </ListItemButton>
                    </ListItem>
                  </List>
                </Box>
              </Drawer>
              <Box
                data-testid="drawer-preview-body"
                sx={{
                  height: '100%',
                  minHeight: 248,
                  pl: drawerOpen ? '260px' : 0,
                  transition: 'padding-left 180ms ease',
                  display: 'grid',
                  placeItems: 'center',
                  p: 2,
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                <Typography variant="body2">
                  {drawerOpen
                    ? 'The preview content shifts to make room for the drawer inside this bounded example.'
                    : 'Open the drawer to preview bounded navigation behavior without overlapping the page.'}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Stack spacing={2}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link underline="hover" color="inherit" href="#navigation">
                CouchRush
              </Link>
              <Link underline="hover" color="inherit" href="#navigation">
                Admin
              </Link>
              <Typography color="text.primary">Theme Showcase</Typography>
            </Breadcrumbs>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Tabs
                value={tabValue}
                onChange={(_, value) => setTabValue(value)}
                aria-label="main tabs"
              >
                <Tab label="Overview" icon={<DashboardRounded />} iconPosition="start" />
                <Tab label="Players" icon={<PeopleRounded />} iconPosition="start" />
                <Tab label="Disabled" disabled icon={<SettingsRounded />} iconPosition="start" />
              </Tabs>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Tabs
                value={scrollTabValue}
                onChange={(_, value) => setScrollTabValue(value)}
                aria-label="scrollable tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Stage Setup" />
                <Tab label="Question Queue" />
                <Tab label="Audience Polls" />
                <Tab label="Winners" />
                <Tab label="Archive" />
                <Tab label="Reports" />
              </Tabs>
            </Paper>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                aria-haspopup="menu"
                aria-expanded={menuAnchor ? 'true' : undefined}
                aria-controls="showcase-menu"
                onClick={(event) => setMenuAnchor(event.currentTarget)}
              >
                Open action menu
              </Button>
              <Link href="#buttons" underline="hover">
                Jump to buttons
              </Link>
            </Box>

            <Menu
              id="showcase-menu"
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
            >
              <MenuItem selected onClick={() => setMenuAnchor(null)}>
                <ListAltRounded sx={{ mr: 1.5 }} />
                Current round
              </MenuItem>
              <MenuItem onClick={() => setMenuAnchor(null)}>Duplicate set</MenuItem>
              <MenuItem disabled>Locked while live</MenuItem>
              <MenuItem sx={{ pl: 4 }} onClick={() => setMenuAnchor(null)}>
                Indented follow-up action
              </MenuItem>
            </Menu>

            <Paper variant="outlined" sx={{ p: 1 }}>
              <BottomNavigation value={bottomNav} onChange={(_, value) => setBottomNav(value)} showLabels>
                <BottomNavigationAction label="Dashboard" value="dashboard" icon={<DashboardRounded />} />
                <BottomNavigationAction label="Roster" value="roster" icon={<PeopleRounded />} />
                <BottomNavigationAction label="Profile" value="profile" icon={<AccountCircleRounded />} />
                <BottomNavigationAction label="More" value="more" icon={<MoreHorizRounded />} />
              </BottomNavigation>
            </Paper>
          </Stack>
        </Box>
      </Stack>
    </ShowcaseSection>
  );
}
