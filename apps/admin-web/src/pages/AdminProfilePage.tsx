import { Chip, Stack, Typography } from '@mui/material';
import { useAuth } from '@couchrush/auth';
import { useTranslation } from '@couchrush/i18n';
import { PagePlaceholder } from './PagePlaceholder';

export function AdminProfilePage() {
  const { user } = useAuth();
  const { t } = useTranslation('admin');

  return (
    <PagePlaceholder title={t('admin.profile.title')} description={t('admin.profile.description')}>
      <Stack spacing={1}>
        <Typography>{t('admin.profile.emailLabel', { email: user?.email })}</Typography>
        <Typography color="text.secondary">{t('admin.profile.roles')}</Typography>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {(user?.roles ?? []).map((role) => (
            <Chip key={role} label={role} />
          ))}
        </Stack>
      </Stack>
    </PagePlaceholder>
  );
}
