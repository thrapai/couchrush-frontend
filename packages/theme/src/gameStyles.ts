import type {} from './theme-augmentation';
import type { SxProps, Theme } from '@mui/material/styles';

export const hostScreenSx: SxProps<Theme> = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  overflow: 'hidden',
  px: {
    xs: 2,
    sm: 4,
    lg: 8,
  },
  py: 4,
  textAlign: 'center',
};

export const questionPanelSx: SxProps<Theme> = {
  width: 'min(1200px, 100%)',
  p: {
    xs: 3,
    sm: 5,
    lg: 7,
  },
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 6,
  background: (theme) => theme.couchRush.heroGradient,
  boxShadow: 12,
};

export const answerGridSx: SxProps<Theme> = {
  width: '100%',
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, minmax(0, 1fr))',
  },
  gap: {
    xs: 1.5,
    sm: 2.5,
  },
};

export const playerAnswerButtonSx: SxProps<Theme> = {
  minHeight: {
    xs: 72,
    sm: 88,
  },
  justifyContent: 'flex-start',
  padding: 2.5,
  fontSize: {
    xs: '1rem',
    sm: '1.15rem',
  },
  textAlign: 'left',
};

export const scoreboardValueSx: SxProps<Theme> = {
  fontFamily: (theme) => theme.couchRush.displayFont,
  fontSize: 'clamp(2.4rem, 8vw, 5.5rem)',
  lineHeight: 1,
  color: 'primary.main',
};
