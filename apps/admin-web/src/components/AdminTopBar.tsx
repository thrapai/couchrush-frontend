import { AppBar, Box, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import type { AdminBreadcrumb } from '../config/adminNavigation';
import { AdminBreadcrumbs } from './AdminBreadcrumbs';

interface AdminTopBarProps {
  title: string;
  breadcrumbs: AdminBreadcrumb[];
  onOpenNavigation: () => void;
}

export function AdminTopBar({ title, breadcrumbs, onOpenNavigation }: AdminTopBarProps) {
  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        backdropFilter: 'blur(12px)',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ gap: 1.5, alignItems: 'flex-start', py: 1.5 }}>
        <IconButton
          aria-label="Open navigation"
          onClick={onOpenNavigation}
          size="small"
          sx={{ display: { xs: 'inline-flex', md: 'none' }, mt: 0.25, p: 0.5 }}
        >
          <Box component="img" src="/logo.png" alt="Couchrush" sx={{ display: 'block', width: 32, height: 'auto' }} />
        </IconButton>

        <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h5" component="h1" sx={{ lineHeight: 1.1 }}>
            {title}
          </Typography>
          <AdminBreadcrumbs items={breadcrumbs} />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
