'use client';

import { createTheme } from '@mui/material/styles';

// Black & White Premium Theme - Fusion of Notion + Apple + Material UI
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFFFFF',
      light: '#FFFFFF',
      dark: '#E0E0E0',
      contrastText: '#000000',
    },
    secondary: {
      main: '#000000',
      light: '#1A1A1A',
      dark: '#000000',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#FFFFFF',
      light: '#FFFFFF',
      dark: '#E0E0E0',
      contrastText: '#000000',
    },
    warning: {
      main: '#FFFFFF',
      light: '#FFFFFF',
      dark: '#E0E0E0',
      contrastText: '#000000',
    },
    info: {
      main: '#FFFFFF',
      light: '#FFFFFF',
      dark: '#E0E0E0',
      contrastText: '#000000',
    },
    success: {
      main: '#FFFFFF',
      light: '#FFFFFF',
      dark: '#E0E0E0',
      contrastText: '#000000',
    },
    background: {
      default: '#000000',
      paper: '#0A0A0A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      disabled: '#616161',
    },
    divider: '#1A1A1A',
    action: {
      active: '#FFFFFF',
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.16)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
      focus: 'rgba(255, 255, 255, 0.12)',
      focusOpacity: 0.12,
      activatedOpacity: 0.16,
    },
  },
  typography: {
    fontFamily: [
      '"SF Pro Display"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '4.5rem',
      fontWeight: 600,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '3.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1.125rem',
      lineHeight: 1.75,
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    button: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
      textTransform: 'none',
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.1)',
    '0px 4px 8px rgba(0, 0, 0, 0.15)',
    '0px 8px 16px rgba(0, 0, 0, 0.2)',
    '0px 12px 24px rgba(0, 0, 0, 0.25)',
    '0px 16px 32px rgba(0, 0, 0, 0.3)',
    '0px 20px 40px rgba(0, 0, 0, 0.35)',
    '0px 24px 48px rgba(0, 0, 0, 0.4)',
    '0px 28px 56px rgba(0, 0, 0, 0.45)',
    '0px 32px 64px rgba(0, 0, 0, 0.5)',
    '0px 2px 4px rgba(255, 255, 255, 0.05)',
    '0px 4px 8px rgba(255, 255, 255, 0.08)',
    '0px 8px 16px rgba(255, 255, 255, 0.1)',
    '0px 12px 24px rgba(255, 255, 255, 0.12)',
    '0px 16px 32px rgba(255, 255, 255, 0.15)',
    '0px 20px 40px rgba(255, 255, 255, 0.18)',
    '0px 24px 48px rgba(255, 255, 255, 0.2)',
    '0px 28px 56px rgba(255, 255, 255, 0.22)',
    '0px 32px 64px rgba(255, 255, 255, 0.25)',
    '0px 36px 72px rgba(255, 255, 255, 0.28)',
    '0px 40px 80px rgba(255, 255, 255, 0.3)',
    '0px 44px 88px rgba(255, 255, 255, 0.32)',
    '0px 48px 96px rgba(255, 255, 255, 0.35)',
    '0px 52px 104px rgba(255, 255, 255, 0.38)',
    '0px 56px 112px rgba(255, 255, 255, 0.4)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 32px',
          fontSize: '1rem',
          fontWeight: 500,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 8px 24px rgba(255, 255, 255, 0.15)',
          },
          '&:focus': {
            outline: '2px solid rgba(255, 255, 255, 0.5)',
            outlineOffset: '2px',
          },
          '& .MuiTouchRipple-root': {
            color: '#FFFFFF',
          },
        },
        contained: {
          backgroundColor: '#FFFFFF',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#E0E0E0',
          },
        },
        outlined: {
          borderColor: '#FFFFFF',
          color: '#FFFFFF',
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            borderColor: '#FFFFFF',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#0A0A0A',
          borderRadius: 16,
          border: '1px solid #1A1A1A',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#2A2A2A',
            transform: 'translateY(-4px)',
            boxShadow: '0px 20px 40px rgba(255, 255, 255, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#0A0A0A',
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
});
