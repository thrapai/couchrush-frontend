export const electricArcade = {
  brand: {
    lime: '#C7F464',
    limeLight: '#D5FF79',
    limeDark: '#9BCF2F',
    coral: '#FF5C7A',
    coralLight: '#FF7891',
    coralDark: '#D93454',
  },
  dark: {
    background: '#101225',
    paper: '#1A1E38',
    surface: '#242946',
    surfaceRaised: '#303655',
    text: '#F8F9FF',
    textSecondary: '#B8BDD6',
    divider: 'rgba(255, 255, 255, 0.11)',
  },
  light: {
    background: '#F5F6ED',
    paper: '#FFFFFF',
    surface: '#EEF0E2',
    surfaceRaised: '#E1E5D0',
    text: '#171928',
    textSecondary: '#62677C',
    divider: 'rgba(23, 25, 40, 0.12)',
  },
  semantic: {
    dark: {
      info: '#66D9FF',
      success: '#35D6A3',
      warning: '#FFC857',
      error: '#F04462',
    },
    light: {
      info: '#167FA8',
      success: '#12835F',
      warning: '#C68500',
      error: '#D93454',
    },
  },
  radius: {
    small: 10,
    medium: 14,
    large: 16,
    xlarge: 24,
    pill: 999,
  },
  layout: {
    minimumTouchTarget: 46,
    largeTouchTarget: 54,
    sidebarWidth: 250,
    contentMaxWidth: 1400,
  },
} as const;

export const couchRushFonts = {
  display: '"Bungee", "Arial Black", sans-serif',
  body: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
} as const;
