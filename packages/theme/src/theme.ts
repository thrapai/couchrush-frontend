/// <reference path="./theme-augmentation.d.ts" />

import { createTheme } from '@mui/material/styles';
import { couchRushFonts, electricArcade } from './tokens';

const { brand, dark, light, semantic, radius, layout } = electricArcade;

export const couchRushTheme = createTheme({
  cssVariables: {
    cssVarPrefix: 'couchrush',
    colorSchemeSelector: 'class',
  },
  colorSchemes: {
    dark: {
      palette: {
        mode: 'dark',
        primary: {
          main: brand.lime,
          light: brand.limeLight,
          dark: brand.limeDark,
          contrastText: '#111326',
        },
        secondary: {
          main: brand.coral,
          light: brand.coralLight,
          dark: brand.coralDark,
          contrastText: '#FFFFFF',
        },
        background: {
          default: dark.background,
          paper: dark.paper,
        },
        text: {
          primary: dark.text,
          secondary: dark.textSecondary,
        },
        divider: dark.divider,
        info: {
          main: semantic.dark.info,
        },
        success: {
          main: semantic.dark.success,
        },
        warning: {
          main: semantic.dark.warning,
        },
        error: {
          main: semantic.dark.error,
        },
        surface: dark.surface,
        surfaceRaised: dark.surfaceRaised,
        action: {
          hover: 'rgba(248, 249, 255, 0.055)',
          selected: 'rgba(199, 244, 100, 0.14)',
          disabled: 'rgba(248, 249, 255, 0.38)',
          disabledBackground: 'rgba(248, 249, 255, 0.10)',
        },
      },
    },
    light: {
      palette: {
        mode: 'light',
        primary: {
          main: brand.limeDark,
          light: brand.lime,
          dark: '#77A91D',
          contrastText: '#151822',
        },
        secondary: {
          main: brand.coralDark,
          light: brand.coral,
          dark: '#B82745',
          contrastText: '#FFFFFF',
        },
        background: {
          default: light.background,
          paper: light.paper,
        },
        text: {
          primary: light.text,
          secondary: light.textSecondary,
        },
        divider: light.divider,
        info: {
          main: semantic.light.info,
        },
        success: {
          main: semantic.light.success,
        },
        warning: {
          main: semantic.light.warning,
        },
        error: {
          main: semantic.light.error,
        },
        surface: light.surface,
        surfaceRaised: light.surfaceRaised,
        action: {
          hover: 'rgba(23, 25, 40, 0.045)',
          selected: 'rgba(155, 207, 47, 0.14)',
          disabled: 'rgba(23, 25, 40, 0.38)',
          disabledBackground: 'rgba(23, 25, 40, 0.08)',
        },
      },
    },
  },
  shape: {
    borderRadius: radius.large,
  },
  spacing: 8,
  typography: {
    fontFamily: couchRushFonts.body,
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 800,
    display: {
      fontFamily: couchRushFonts.display,
      fontWeight: 400,
      fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
      lineHeight: 0.96,
      letterSpacing: '0.01em',
    },
    score: {
      fontFamily: couchRushFonts.display,
      fontWeight: 400,
      fontSize: 'clamp(3rem, 8vw, 6rem)',
      lineHeight: 1,
      letterSpacing: '0.01em',
    },
    h1: {
      fontFamily: couchRushFonts.display,
      fontWeight: 400,
      fontSize: 'clamp(2.2rem, 5vw, 4.5rem)',
      lineHeight: 0.98,
      letterSpacing: '0.01em',
    },
    h2: {
      fontFamily: couchRushFonts.display,
      fontWeight: 400,
      fontSize: 'clamp(1.65rem, 3vw, 2.35rem)',
      lineHeight: 1.08,
      letterSpacing: '0.01em',
    },
    h3: {
      fontFamily: couchRushFonts.display,
      fontWeight: 400,
      fontSize: 'clamp(1.2rem, 2vw, 1.65rem)',
      lineHeight: 1.15,
      letterSpacing: '0.01em',
    },
    h4: {
      fontFamily: couchRushFonts.display,
      fontWeight: 400,
      fontSize: '1.125rem',
      lineHeight: 1.2,
    },
    h5: {
      fontWeight: 800,
      fontSize: '1.05rem',
      lineHeight: 1.3,
    },
    h6: {
      fontWeight: 800,
      fontSize: '0.95rem',
      lineHeight: 1.35,
    },
    subtitle1: {
      fontWeight: 700,
    },
    subtitle2: {
      fontWeight: 700,
      fontSize: '0.84rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.65,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.55,
    },
    button: {
      fontFamily: couchRushFonts.body,
      fontWeight: 800,
      textTransform: 'none',
      letterSpacing: 0,
    },
    overline: {
      fontWeight: 800,
      fontSize: '0.72rem',
      lineHeight: 1.4,
      letterSpacing: '0.13em',
      textTransform: 'uppercase',
    },
  },
  couchRush: {
    displayFont: couchRushFonts.display,
    bodyFont: couchRushFonts.body,
    surface: 'var(--couchrush-palette-surface)',
    surfaceRaised: 'var(--couchrush-palette-surfaceRaised)',
    heroGradient:
      'linear-gradient(155deg, var(--couchrush-palette-surfaceRaised), var(--couchrush-palette-background-paper))',
    overlay:
      'color-mix(in srgb, var(--couchrush-palette-background-default), transparent 10%)',
    layout,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          minHeight: '100%',
          scrollBehavior: 'smooth',
        },
        body: {
          minHeight: '100%',
          backgroundColor: 'var(--couchrush-palette-background-default)',
          backgroundImage: [
            'radial-gradient(circle at 10% 0%, color-mix(in srgb, var(--couchrush-palette-primary-main), transparent 84%), transparent 28rem)',
            'radial-gradient(circle at 100% 10%, color-mix(in srgb, var(--couchrush-palette-secondary-main), transparent 87%), transparent 32rem)',
          ].join(', '),
          backgroundAttachment: 'fixed',
        },
        '#root': {
          minHeight: '100vh',
        },
        '*': {
          boxSizing: 'border-box',
        },
        '::selection': {
          backgroundColor: 'var(--couchrush-palette-primary-main)',
          color: 'var(--couchrush-palette-primary-contrastText)',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        variant: 'contained',
      },
      styleOverrides: {
        root: {
          minHeight: layout.minimumTouchTarget,
          paddingInline: 18,
          borderRadius: radius.medium,
          fontWeight: 800,
          transition: 'transform 160ms ease, background-color 160ms ease, box-shadow 160ms ease',
          '&.MuiButton-containedPrimary': {
            color: 'var(--couchrush-palette-primary-contrastText)',
          },
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        sizeLarge: {
          minHeight: layout.largeTouchTarget,
          paddingInline: 24,
          borderRadius: radius.large,
        },
        sizeSmall: {
          minHeight: 36,
          paddingInline: 13,
          borderRadius: radius.small,
        },
        outlined: {
          borderColor: 'var(--couchrush-palette-divider)',
          '&:hover': {
            borderColor: 'var(--couchrush-palette-primary-main)',
            backgroundColor:
              'color-mix(in srgb, var(--couchrush-palette-primary-main), transparent 92%)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          border: '1px solid var(--couchrush-palette-divider)',
          borderRadius: 13,
          backgroundColor: 'var(--couchrush-palette-background-paper)',
          '&:hover': {
            backgroundColor: 'var(--couchrush-palette-surface)',
          },
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          borderColor: 'var(--couchrush-palette-divider)',
          borderRadius: radius.large,
          backgroundImage: 'none',
          boxShadow: '0 16px 42px color-mix(in srgb, #000000, transparent 86%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: radius.large,
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: 'transparent',
      },
      styleOverrides: {
        root: {
          borderBottom: '1px solid var(--couchrush-palette-divider)',
          backgroundColor:
            'color-mix(in srgb, var(--couchrush-palette-background-default), transparent 10%)',
          backdropFilter: 'blur(18px)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid var(--couchrush-palette-divider)',
          backgroundColor:
            'color-mix(in srgb, var(--couchrush-palette-background-default), transparent 8%)',
          backdropFilter: 'blur(18px)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          marginInline: 6,
          borderRadius: 12,
          color: 'var(--couchrush-palette-text-secondary)',
          '&:hover': {
            color: 'var(--couchrush-palette-text-primary)',
            backgroundColor: 'var(--couchrush-palette-surface)',
          },
          '&.Mui-selected': {
            color: 'var(--couchrush-palette-text-primary)',
            backgroundColor: 'var(--couchrush-palette-surface)',
            boxShadow: 'inset 3px 0 var(--couchrush-palette-primary-main)',
            '&:hover': {
              backgroundColor: 'var(--couchrush-palette-surface)',
            },
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          minHeight: layout.minimumTouchTarget,
          borderRadius: 13,
          backgroundColor: 'var(--couchrush-palette-surface)',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--couchrush-palette-text-secondary)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1,
            borderColor: 'var(--couchrush-palette-primary-main)',
          },
        },
        notchedOutline: {
          borderColor: 'var(--couchrush-palette-divider)',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: 2,
        },
      },
    },
    MuiMenu: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        paper: {
          padding: 6,
          border: '1px solid var(--couchrush-palette-divider)',
          borderRadius: 15,
          boxShadow: '0 18px 50px color-mix(in srgb, #000000, transparent 76%)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: 42,
          marginBlock: 2,
          borderRadius: 10,
          fontWeight: 700,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          minHeight: 30,
          borderRadius: radius.pill,
          fontWeight: 700,
        },
        filled: {
          backgroundColor: 'var(--couchrush-palette-surface)',
        },
      },
    },
    MuiDialog: {
      defaultProps: {
        fullWidth: true,
        maxWidth: 'sm',
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          paddingBottom: 8,
          fontFamily: couchRushFonts.display,
          fontWeight: 400,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          gap: 8,
          padding: '8px 24px 24px',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          border: '1px solid var(--couchrush-palette-divider)',
          borderRadius: radius.large,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: 'var(--couchrush-palette-divider)',
        },
        head: {
          color: 'var(--couchrush-palette-text-secondary)',
          fontSize: '0.76rem',
          fontWeight: 800,
          letterSpacing: '0.09em',
          textTransform: 'uppercase',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor:
              'color-mix(in srgb, var(--couchrush-palette-surface), transparent 45%)',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 48,
          width: 'fit-content',
          maxWidth: '100%',
          padding: 6,
          borderRadius: 14,
          backgroundColor: 'var(--couchrush-palette-surface)',
        },
        indicator: {
          display: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minWidth: 0,
          minHeight: 36,
          padding: '8px 14px',
          borderRadius: 10,
          color: 'var(--couchrush-palette-text-secondary)',
          fontWeight: 800,
          textTransform: 'none',
          '&.Mui-selected': {
            color: 'var(--couchrush-palette-text-primary)',
            backgroundColor: 'var(--couchrush-palette-surfaceRaised)',
          },
        },
      },
    },
    MuiAlert: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: 'var(--couchrush-palette-background-paper)',
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
      styleOverrides: {
        tooltip: {
          borderRadius: 9,
          fontSize: '0.78rem',
          fontWeight: 700,
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: 11,
          fontWeight: 800,
          '&.Mui-selected': {
            color: 'var(--couchrush-palette-primary-contrastText)',
            backgroundColor: 'var(--couchrush-palette-primary-main)',
            '&:hover': {
              backgroundColor: 'var(--couchrush-palette-primary-dark)',
            },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 12,
          borderRadius: radius.pill,
          backgroundColor: 'var(--couchrush-palette-surfaceRaised)',
        },
        bar: {
          borderRadius: radius.pill,
        },
      },
    },
    MuiSkeleton: {
      defaultProps: {
        animation: 'wave',
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          fontWeight: 700,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: 'var(--couchrush-palette-primary-main)',
            '& + .MuiSwitch-track': {
              backgroundColor: 'var(--couchrush-palette-primary-main)',
              opacity: 0.55,
            },
          },
        },
      },
    },
    MuiCheckbox: {
      defaultProps: {
        color: 'primary',
      },
    },
    MuiRadio: {
      defaultProps: {
        color: 'primary',
      },
    },
  },
});

export const theme = couchRushTheme;
