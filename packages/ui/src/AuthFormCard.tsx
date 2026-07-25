import { Alert, Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import type { ReactNode, SubmitEventHandler } from 'react';

export interface AuthFormCardProps {
  title: string;
  subtitle: string;
  submitLabel: string;
  isSubmitting?: boolean;
  warningMessage?: string | null;
  errorMessage?: string | null;
  successMessage?: string | null;
  footer?: ReactNode;
  children: ReactNode;
  onSubmit: SubmitEventHandler<HTMLFormElement>;
}

export function AuthFormCard({
  title,
  subtitle,
  submitLabel,
  isSubmitting = false,
  warningMessage,
  errorMessage,
  successMessage,
  footer,
  children,
  onSubmit,
}: AuthFormCardProps) {
  return (
    <Paper sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        <Typography color="text.secondary">{subtitle}</Typography>
        {warningMessage ? <Alert severity="warning">{warningMessage}</Alert> : null}
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
        {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
        <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {children}
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress color="inherit" size={20} /> : submitLabel}
          </Button>
        </Box>
        {footer}
      </Box>
    </Paper>
  );
}
