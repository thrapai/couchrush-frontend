import { Alert, Box, Button, Card, CardContent, Chip, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { getApiErrorMessage } from '@couchrush/api-client';
import { useAuth } from '@couchrush/auth';
import { useTranslation } from '@couchrush/i18n';
import { Link as RouterLink } from 'react-router-dom';
import { useActiveUsersMetric, useTotalUsersMetric } from '../hooks/useOverviewDashboard';

const USERS_READ_PERMISSION = 'users:read';

export function AdminOverviewPage() {
  const { t } = useTranslation('admin');
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
          {displayName ? t('admin.overview.welcome', { name: displayName }) : t('admin.overview.title')}
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
  const { t } = useTranslation('admin');

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" component="h2">
            {t('admin.overview.yourAccess')}
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {roles.length > 0 ? roles.map((role) => <Chip key={role} label={role} />) : <Chip label={t('admin.overview.noRoles')} color="default" />}
            <Chip label={t('admin.overview.permissionCount', { count: permissions.length })} color="primary" />
          </Stack>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {permissions.length > 0 ? (
              permissions.map((permission) => <Chip key={permission} label={permission} variant="outlined" />)
            ) : (
              <Typography color="text.secondary">{t('admin.overview.noPermissions')}</Typography>
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
  const { t } = useTranslation('admin');

  if (!canReadUsers) {
    return (
      <Card>
        <CardContent>
          <MetricUnavailable
            title={t('admin.overview.userMetrics')}
            message={t('admin.overview.metricsPermissionUnavailable')}
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
            {t('admin.overview.userMetrics')}
          </Typography>
          {error ? (
            <Alert severity="error">{getApiErrorMessage(error, t('admin.overview.metricsLoadError'))}</Alert>
          ) : null}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <MetricCard label={t('admin.overview.totalUsers')} state={totalUsers} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <MetricCard label={t('admin.overview.activeUsers')} state={activeUsers} />
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, state }: { label: string; state: MetricState }) {
  const { t } = useTranslation('admin');

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, height: '100%', p: 2 }}>
      <Stack spacing={1}>
        <Typography color="text.secondary">{label}</Typography>
        {state.isLoading ? (
          <Skeleton variant="text" width={80} height={40} />
        ) : state.error || state.value === undefined ? (
          <MetricUnavailable title={label} message={t('admin.overview.unavailable')} compact />
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
  const { t } = useTranslation('admin');

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" component="h2">
            {t('admin.overview.quickActions')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {canReadUsers ? (
              <Button component={RouterLink} to="/admin/users" variant="contained">
                {t('admin.overview.manageUsers')}
              </Button>
            ) : null}
            <Button component={RouterLink} to="/admin/profile" variant="outlined">
              {t('admin.overview.viewMyProfile')}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
