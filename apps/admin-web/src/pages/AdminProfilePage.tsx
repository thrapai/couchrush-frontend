import { Chip, Stack, Typography } from '@mui/material';
import { useAuth } from '@couchrush/auth';
import { PagePlaceholder } from './PagePlaceholder';

export function AdminProfilePage() {
  const { user } = useAuth();

  return (
    <PagePlaceholder title="My Profile" description="Profile editing will be added later. Current session details are shown below.">
      <Stack spacing={1}>
        <Typography>Email: {user?.email}</Typography>
        <Typography color="text.secondary">Roles</Typography>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {(user?.roles ?? []).map((role) => (
            <Chip key={role} label={role} />
          ))}
        </Stack>
      </Stack>
    </PagePlaceholder>
  );
}
