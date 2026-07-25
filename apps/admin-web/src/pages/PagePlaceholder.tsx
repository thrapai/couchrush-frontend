import { Alert, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface PagePlaceholderProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function PagePlaceholder({ title, description, children }: PagePlaceholderProps) {
  return (
    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={2}>
        <Typography variant="h5" component="h2">
          {title}
        </Typography>
        <Alert severity="info">{description}</Alert>
        {children}
      </Stack>
    </Paper>
  );
}
