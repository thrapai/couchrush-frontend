import type { CSSProperties } from 'react';

declare module '@mui/material/styles' {
  interface Theme {
    couchRush: {
      displayFont: string;
      bodyFont: string;
      surface: string;
      surfaceRaised: string;
      heroGradient: string;
      overlay: string;
      layout: {
        minimumTouchTarget: number;
        largeTouchTarget: number;
        sidebarWidth: number;
        contentMaxWidth: number;
      };
    };
  }

  interface ThemeOptions {
    couchRush?: Partial<Theme['couchRush']>;
  }

  interface Palette {
    surface: string;
    surfaceRaised: string;
  }

  interface PaletteOptions {
    surface?: string;
    surfaceRaised?: string;
  }

  interface TypographyVariants {
    display: CSSProperties;
    score: CSSProperties;
  }

  interface TypographyVariantsOptions {
    display?: CSSProperties;
    score?: CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    display: true;
    score: true;
  }
}

export {};
