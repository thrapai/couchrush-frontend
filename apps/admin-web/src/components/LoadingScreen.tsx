import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from '@couchrush/i18n';
import { CenteredMessage } from './CenteredMessage';

export function LoadingScreen() {
  const { t } = useTranslation('common');

  return (
    <CenteredMessage>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
      <Typography align="center" color="text.secondary">
        {t('common.loadingSession')}
      </Typography>
    </CenteredMessage>
  );
}
