import { Box, Container } from '@mui/material';
import { ColorModeToggle } from '@couchrush/theme';
import { Outlet } from 'react-router-dom';

export function AuthPageLayout() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        <Box component="img" src="/logo.png" alt="Couchrush" sx={{ display: 'block', width: 144, maxWidth: '100%', height: 'auto' }} />
        <ColorModeToggle />
      </Box>
      <Outlet />
    </Container>
  );
}
