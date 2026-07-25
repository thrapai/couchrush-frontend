import { useTranslation } from '@couchrush/i18n';
import { PagePlaceholder } from './PagePlaceholder';

export function AdminUsersPage() {
  const { t } = useTranslation('admin');

  return (
    <PagePlaceholder
      title={t('admin.users.title')}
      description={t('admin.users.description')}
    />
  );
}
