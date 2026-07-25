import { Box, Chip, Stack, Typography, useTheme } from '@mui/material';
import { ShowcaseSection } from '../components/ShowcaseSection';
import { TokenSwatch } from '../components/TokenSwatch';

export function ThemeTokensSection() {
  const theme = useTheme();

  const colorTokens = [
    { label: 'Primary', value: theme.palette.primary.main, textColor: theme.palette.primary.contrastText },
    { label: 'Secondary', value: theme.palette.secondary.main, textColor: theme.palette.secondary.contrastText },
    { label: 'Background Default', value: theme.palette.background.default, textColor: theme.palette.text.primary },
    { label: 'Background Paper', value: theme.palette.background.paper, textColor: theme.palette.text.primary },
    { label: 'Surface', value: theme.palette.surface, textColor: theme.palette.text.primary },
    { label: 'Raised Surface', value: theme.palette.surfaceRaised, textColor: theme.palette.text.primary },
    { label: 'Text Primary', value: theme.palette.text.primary, preview: theme.palette.text.primary, textColor: theme.palette.background.default },
    { label: 'Text Secondary', value: theme.palette.text.secondary, preview: theme.palette.text.secondary, textColor: theme.palette.background.default },
    { label: 'Divider', value: theme.palette.divider, preview: `linear-gradient(90deg, transparent, ${theme.palette.divider}, transparent)` },
    { label: 'Info', value: theme.palette.info.main },
    { label: 'Success', value: theme.palette.success.main },
    { label: 'Warning', value: theme.palette.warning.main },
    { label: 'Error', value: theme.palette.error.main },
  ];

  const radiusTokens = [
    { label: 'Small', value: 10 },
    { label: 'Medium', value: 14 },
    { label: 'Large', value: 16 },
    { label: 'XLarge', value: 24 },
    { label: 'Pill', value: 999 },
  ];

  const touchTargets = [
    { label: 'Minimum touch target', value: theme.couchRush.layout.minimumTouchTarget },
    { label: 'Large touch target', value: theme.couchRush.layout.largeTouchTarget },
  ];

  return (
    <ShowcaseSection
      id="theme-tokens"
      title="Theme Tokens"
      description="Active MUI theme values read directly from the shared CouchRush theme package."
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 2,
        }}
      >
        {colorTokens.map((token) => (
          <TokenSwatch key={token.label} {...token} />
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        <Stack spacing={1.5}>
          <Typography variant="h5">Border Radius</Typography>
          {radiusTokens.map((token) => (
            <Box key={token.label} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 72,
                  height: 48,
                  borderRadius: `${token.value}px`,
                  backgroundColor: 'surface',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {token.label}: {token.value}px
              </Typography>
            </Box>
          ))}
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="h5">Touch Targets</Typography>
          {touchTargets.map((target) => (
            <Box key={target.label} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: target.value,
                  height: target.value,
                  minWidth: target.value,
                  borderRadius: 2,
                  backgroundColor: 'surfaceRaised',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {target.label}: {target.value}px
              </Typography>
            </Box>
          ))}
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="h5">Fonts and Mode</Typography>
          <Typography variant="display">Bungee Display Font</Typography>
          <Typography variant="body1">Inter body font drives the UI and readable content.</Typography>
          <Typography variant="body2" color="text.secondary">
            Display: {theme.couchRush.displayFont}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Body: {theme.couchRush.bodyFont}
          </Typography>
          <Chip label={`Current mode: ${theme.palette.mode}`} color="primary" />
        </Stack>
      </Box>
    </ShowcaseSection>
  );
}
