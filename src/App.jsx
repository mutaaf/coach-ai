import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { MantineProvider } from '@mantine/core';
import Layout from './components/Layout';
import RecordFeedback from './pages/RecordFeedback';
import Players from './pages/Players';
import PlayerDashboard from './pages/PlayerDashboard';
import Landing from './pages/Landing';
import theme from './theme';

function App() {
  return (
    <MantineProvider>
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/" element={<Layout />}>
              <Route path="dashboard" element={<PlayerDashboard />} />
              <Route path="players" element={<Players />} />
              <Route path="record" element={<RecordFeedback />} />
              <Route path="analytics" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </MantineProvider>
  );
}

export default App;
