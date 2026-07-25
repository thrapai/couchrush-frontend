import { useTranslation } from '@couchrush/i18n';
import { PagePlaceholder } from './PagePlaceholder';

export function AdminAccessPage() {
  const { t } = useTranslation('admin');

  return (
    <PagePlaceholder
      title={t('admin.permissions.title')}
      description={t('admin.permissions.description')}
    />
  );
}
