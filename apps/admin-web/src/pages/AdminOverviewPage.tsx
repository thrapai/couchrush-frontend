import { Typography } from '@mui/material';
import { useAuth } from '@couchrush/auth';
import { PagePlaceholder } from './PagePlaceholder';

export function AdminOverviewPage() {
  const { user } = useAuth();

  return (
    <PagePlaceholder
      title="Overview"
      description="This is the reusable admin shell landing page. Feature pages will be added in later milestones."
    >
      <Typography color="text.secondary">Signed in as {user?.email}</Typography>
    </PagePlaceholder>
  );
}
