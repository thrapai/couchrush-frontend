import { Alert, Box, Button, Card, CardContent, Chip, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { getApiErrorMessage } from '@couchrush/api-client';
import { useAuth } from '@couchrush/auth';
import { Link as RouterLink } from 'react-router-dom';
import { useActiveUsersMetric, useTotalUsersMetric } from '../hooks/useOverviewDashboard';

const USERS_READ_PERMISSION = 'users:read';

export function AdminOverviewPage() {
  const { user } = useAuth();
  const permissions = user?.permissions ?? [];
  const canReadUsers = permissions.includes(USERS_READ_PERMISSION);
  const totalUsersQuery = useTotalUsersMetric(canReadUsers);
  const activeUsersQuery = useActiveUsersMetric(canReadUsers);
  const displayName = user?.display_name?.trim();

  return (
    <Stack spacing={3}>
      <Stack spacing={0.75}>
        <Typography variant="h4" component="h1">
          {displayName ? `Welcome back, ${displayName}` : 'Overview'}
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <AccessSummary roles={user?.roles ?? []} permissions={permissions} />
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <UserMetrics
            canReadUsers={canReadUsers}
            totalUsers={{
              isLoading: totalUsersQuery.isPending,
              error: totalUsersQuery.error,
              value: totalUsersQuery.data?.total,
            }}
            activeUsers={{
              isLoading: activeUsersQuery.isPending,
              error: activeUsersQuery.error,
              value: activeUsersQuery.data?.total,
            }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <QuickActions canReadUsers={canReadUsers} />
        </Grid>
      </Grid>
    </Stack>
  );
}

interface AccessSummaryProps {
  roles: string[];
  permissions: string[];
}

function AccessSummary({ roles, permissions }: AccessSummaryProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" component="h2">
            Your access
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {roles.length > 0 ? roles.map((role) => <Chip key={role} label={role} />) : <Chip label="No roles" color="default" />}
            <Chip label={`${permissions.length} permissions`} color="primary" />
          </Stack>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {permissions.length > 0 ? (
              permissions.map((permission) => <Chip key={permission} label={permission} variant="outlined" />)
            ) : (
              <Typography color="text.secondary">No effective permissions are available.</Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

interface UserMetricsProps {
  canReadUsers: boolean;
  totalUsers: MetricState;
  activeUsers: MetricState;
}

interface MetricState {
  isLoading: boolean;
  error: unknown;
  value?: number;
}

function UserMetrics({ canReadUsers, totalUsers, activeUsers }: UserMetricsProps) {
  if (!canReadUsers) {
    return (
      <Card>
        <CardContent>
          <MetricUnavailable
            title="User metrics"
            message="User metrics are unavailable because this account does not have users:read."
          />
        </CardContent>
      </Card>
    );
  }

  const error = totalUsers.error ?? activeUsers.error;

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" component="h2">
            User metrics
          </Typography>
          {error ? (
            <Alert severity="error">{getApiErrorMessage(error, 'User metrics could not be loaded.')}</Alert>
          ) : null}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <MetricCard label="Total users" state={totalUsers} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <MetricCard label="Active users" state={activeUsers} />
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, state }: { label: string; state: MetricState }) {
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, height: '100%', p: 2 }}>
      <Stack spacing={1}>
        <Typography color="text.secondary">{label}</Typography>
        {state.isLoading ? (
          <Skeleton variant="text" width={80} height={40} />
        ) : state.error || state.value === undefined ? (
          <MetricUnavailable title={label} message="Unavailable" compact />
        ) : (
          <Typography variant="h4">{state.value}</Typography>
        )}
      </Stack>
    </Box>
  );
}

function MetricUnavailable({ title, message, compact = false }: { title: string; message: string; compact?: boolean }) {
  if (compact) {
    return (
      <Typography color="text.secondary">{message}</Typography>
    );
  }

  return (
    <Stack spacing={1}>
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
      <Alert severity="info">{message}</Alert>
    </Stack>
  );
}

function QuickActions({ canReadUsers }: { canReadUsers: boolean }) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" component="h2">
            Quick actions
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {canReadUsers ? (
              <Button component={RouterLink} to="/admin/users" variant="contained">
                Manage users
              </Button>
            ) : null}
            <Button component={RouterLink} to="/admin/profile" variant="outlined">
              View my profile
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
