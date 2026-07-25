import { Box, Paper, Stack, Typography } from '@mui/material';

interface TokenSwatchProps {
  label: string;
  value: string;
  preview?: string;
  textColor?: string;
}

export function TokenSwatch({
  label,
  value,
  preview = value,
  textColor,
}: TokenSwatchProps) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Stack spacing={1.25}>
        <Box
          sx={{
            height: 72,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            background: preview,
            color: textColor,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {label}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2">{label}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
