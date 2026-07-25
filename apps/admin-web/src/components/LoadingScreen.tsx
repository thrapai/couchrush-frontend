import { Box, CircularProgress, Typography } from '@mui/material';
import { CenteredMessage } from './CenteredMessage';

export function LoadingScreen() {
  return (
    <CenteredMessage>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
      <Typography align="center" color="text.secondary">
        Loading session…
      </Typography>
    </CenteredMessage>
  );
}
