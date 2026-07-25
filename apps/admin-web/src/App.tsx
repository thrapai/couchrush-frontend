import { Container, Stack, Typography } from '@mui/material';
import { Button } from '@couchrush/ui';

export function App() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack spacing={2} alignItems="flex-start">
        <Typography variant="h4" component="h1">
          Couchrush Admin
        </Typography>
        <Button>Ready</Button>
      </Stack>
    </Container>
  );
}
