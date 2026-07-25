import { Box, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface ShowcaseSectionProps {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function ShowcaseSection({
  id,
  title,
  description,
  children,
}: ShowcaseSectionProps) {
  return (
    <Paper
      id={id}
      component="section"
      variant="outlined"
      sx={{
        p: { xs: 2.5, sm: 3.5 },
        scrollMarginTop: 112,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h3" gutterBottom>
            {title}
          </Typography>
          <Typography color="text.secondary">{description}</Typography>
        </Box>
        {children}
      </Stack>
    </Paper>
  );
}
