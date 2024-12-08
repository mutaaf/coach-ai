import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { MantineProvider } from '@mantine/core';
import Layout from './components/Layout';
import RecordFeedback from './pages/RecordFeedback';
import Players from './pages/Players';
import PlayerDashboard from './pages/PlayerDashboard';
import Analytics from './pages/Analytics';
import Landing from './pages/Landing';
import theme from './theme';

function App() {
  return (
    <MantineProvider>
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<Layout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<PlayerDashboard />} />
              <Route path="players" element={<Players />} />
              <Route path="record" element={<RecordFeedback />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </MantineProvider>
  );
}

export default App;
