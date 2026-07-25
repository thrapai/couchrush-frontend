import { Alert, Button } from '@mui/material';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@couchrush/auth';
import { CenteredMessage } from './CenteredMessage';

interface RequirePermissionsProps {
  children: ReactNode;
  requiredAnyPermissions?: string[];
}

export function RequirePermissions({ children, requiredAnyPermissions }: RequirePermissionsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!requiredAnyPermissions || requiredAnyPermissions.length === 0) {
    return <>{children}</>;
  }

  const permissions = user?.permissions ?? [];
  if (requiredAnyPermissions.some((permission) => permissions.includes(permission))) {
    return <>{children}</>;
  }

  return (
    <CenteredMessage>
      <Alert severity="error">You are signed in, but you do not have access to this page.</Alert>
      <Button variant="outlined" onClick={() => navigate('/admin', { replace: true })}>
        Back to overview
      </Button>
    </CenteredMessage>
  );
}
