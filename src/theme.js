import { createTheme } from '@mui/material/styles';

// Sports-themed color palette
const colors = {
  court: '#FF6B6B', // Vibrant coral
  jersey: '#4ECDC4', // Teal
  accent: '#FFE66D', // Athletic gold
  success: '#00C853', // Victory green
  warning: '#FF9100', // Referee whistle orange
  error: '#FF1744', // Foul red
  background: {
    light: '#F5F7FA',
    paper: '#FFFFFF',
    dark: '#1A2027',
  },
  text: {
    primary: '#1A2027',
    secondary: '#4A5568',
  }
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.court,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: colors.jersey,
      contrastText: '#FFFFFF',
    },
    background: {
      default: colors.background.light,
      paper: colors.background.paper,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
    success: {
      main: colors.success,
    },
    warning: {
      main: colors.warning,
    },
    error: {
      main: colors.error,
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-1px',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.3px',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.5px',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 50,
          padding: '10px 24px',
          fontWeight: 600,
          letterSpacing: '0.5px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
          borderRadius: 16,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          letterSpacing: '0.5px',
          background: colors.background.light,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: '0.5px',
          minHeight: 48,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
        colorPrimary: {
          backgroundColor: colors.court,
          color: '#FFFFFF',
        },
        colorSecondary: {
          backgroundColor: colors.jersey,
          color: '#FFFFFF',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: colors.background.dark,
          color: '#FFFFFF',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.background.dark,
          color: '#FFFFFF',
          '& .MuiListItemIcon-root': {
            color: 'inherit',
          },
          '& .MuiListItemText-primary': {
            fontWeight: 600,
            letterSpacing: '0.5px',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: colors.background.light,
        },
        barColorPrimary: {
          backgroundColor: colors.court,
        },
      },
    },
  },
});

export default theme; 