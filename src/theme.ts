import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#007AFF', // Apple blue
      light: '#47A1FF',
      dark: '#0055B3',
    },
    secondary: {
      main: '#5856D6', // Apple purple
      light: '#7A79E0',
      dark: '#3E3D96',
    },
    background: {
      default: '#F5F5F7', // Apple light gray
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1D1D1F', // Apple dark gray
      secondary: '#86868B', // Apple medium gray
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontSize: '48px',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '32px',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '24px',
      fontWeight: 600,
    },
    h4: {
      fontSize: '20px',
      fontWeight: 600,
    },
    h5: {
      fontSize: '18px',
      fontWeight: 600,
    },
    h6: {
      fontSize: '16px',
      fontWeight: 600,
    },
    body1: {
      fontSize: '16px',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '14px',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
}); 