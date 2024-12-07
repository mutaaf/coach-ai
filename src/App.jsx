import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { MantineProvider } from '@mantine/core';
import Layout from './components/Layout';
import Players from './pages/Players';
import RecordFeedback from './pages/RecordFeedback';
import PlayerDashboard from './pages/PlayerDashboard';

// Sports-themed color palette
const colors = {
  court: '#FF6B00', // Vibrant orange like a basketball
  jersey: '#004AAD', // Team blue
  accent: '#FFD600', // Athletic gold
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
    fontFamily: '"Roboto Condensed", -apple-system, BlinkMacSystemFont, sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
      textTransform: 'uppercase',
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
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          borderRadius: 4,
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
          background: `linear-gradient(145deg, ${colors.background.paper} 0%, ${colors.background.light} 100%)`,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          background: colors.background.light,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          background: `linear-gradient(145deg, ${colors.background.paper} 0%, ${colors.background.light} 100%)`,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
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
          background: `linear-gradient(90deg, ${colors.jersey} 0%, ${colors.court} 100%)`,
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

function App() {
  return (
    <MantineProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<PlayerDashboard />} />
              <Route path="/players" element={<Players />} />
              <Route path="/record" element={<RecordFeedback />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </MantineProvider>
  );
}

export default App;
