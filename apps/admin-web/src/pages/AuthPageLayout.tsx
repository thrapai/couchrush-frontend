import { Box, Container } from '@mui/material';
import { LanguageSwitcher, useTranslation } from '@couchrush/i18n';
import { ColorModeToggle } from '@couchrush/theme';
import { Outlet } from 'react-router-dom';

export function AuthPageLayout() {
  const { t } = useTranslation('common');

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        <Box component="img" src="/logo.png" alt={t('common.brand.logoAlt')} sx={{ display: 'block', width: 144, maxWidth: '100%', height: 'auto' }} />
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Box sx={{ width: 120 }}>
            <LanguageSwitcher />
          </Box>
          <ColorModeToggle
            switchToDarkModeLabel={t('common.theme.switchToDarkMode')}
            switchToLightModeLabel={t('common.theme.switchToLightMode')}
          />
        </Box>
      </Box>
      <Outlet />
    </Container>
  );
}
