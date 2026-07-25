import { Box, Container, Typography } from '@mui/material';
import { ColorModeToggle } from '@couchrush/theme';
import { Button } from '@couchrush/ui';

export function App() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
        <Box sx={{ alignSelf: 'flex-end' }}>
          <ColorModeToggle />
        </Box>
        <Typography variant="h4" component="h1">
          Couchrush Admin
        </Typography>
        <Typography color="text.secondary">
          Shared theme package with CouchRush color schemes and component overrides.
        </Typography>
        <Button>Ready</Button>
      </Box>
    </Container>
  );
}
