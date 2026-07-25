import InfoRounded from '@mui/icons-material/InfoRounded';
import {
  Alert,
  AlertTitle,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { ShowcaseSection } from '../components/ShowcaseSection';

export function FeedbackSection() {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [backdropOpen, setBackdropOpen] = useState(false);

  return (
    <ShowcaseSection
      id="feedback"
      title="Feedback"
      description="Alerts, snackbar, progress, tooltip, backdrop, and skeleton coverage."
    >
      <Stack spacing={3}>
        <Stack spacing={1.5}>
          <Alert severity="success">
            <AlertTitle>Success</AlertTitle>
            Leaderboard published to the arena display.
          </Alert>
          <Alert severity="info">
            <AlertTitle>Info</AlertTitle>
            Audience voting opens in 15 seconds.
          </Alert>
          <Alert severity="warning">
            <AlertTitle>Warning</AlertTitle>
            Two buzzers are reporting low battery.
          </Alert>
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            The host connection dropped during answer reveal.
          </Alert>
          <Alert severity="info" variant="filled">
            Filled variant example
          </Alert>
          <Alert severity="warning" variant="outlined">
            Outlined variant example
          </Alert>
        </Stack>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button onClick={() => setSnackbarOpen(true)}>Open snackbar</Button>
          <Button onClick={() => setBackdropOpen(true)}>Open backdrop</Button>
          <Tooltip title="Tooltip example for host-only hints">
            <Button startIcon={<InfoRounded />}>Tooltip trigger</Button>
          </Tooltip>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 3,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <CircularProgress />
          <Box sx={{ width: 280, maxWidth: '100%' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Determinate progress
            </Typography>
            <LinearProgress variant="determinate" value={68} />
          </Box>
          <Box sx={{ width: 280, maxWidth: '100%' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Indeterminate progress
            </Typography>
            <LinearProgress />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Skeleton variant="text" width={180} />
          <Skeleton variant="rectangular" width={180} height={72} />
          <Skeleton variant="circular" width={48} height={48} />
        </Box>
      </Stack>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message="Round saved to host queue."
      />

      <Backdrop open={backdropOpen} onClick={() => setBackdropOpen(false)} sx={{ color: 'primary.main', zIndex: 1400 }}>
        <Box sx={{ display: 'grid', gap: 2, justifyItems: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography variant="h6">Syncing stage devices</Typography>
        </Box>
      </Backdrop>
    </ShowcaseSection>
  );
}
