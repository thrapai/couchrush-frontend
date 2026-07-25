import { Box, Paper } from '@mui/material';
import type { ReactNode } from 'react';

export function CenteredMessage({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
      }}
    >
      <Paper sx={{ p: 4, width: '100%', maxWidth: 520 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{children}</Box>
      </Paper>
    </Box>
  );
}
