import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from '@couchrush/i18n';

export function LoadingScreen() {
  const { t } = useTranslation('common');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        px: 2,
      }}
    >
      <CircularProgress size={28} />
      <Typography variant="body2" color="text.secondary">
        {t('common.loadingSession')}
      </Typography>
    </Box>
  );
}
