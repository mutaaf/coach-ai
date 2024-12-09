import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { MantineProvider } from '@mantine/core';
import Layout from './components/Layout';
import RecordFeedback from './pages/RecordFeedback';
import Athletes from './pages/Athletes';
import AthleteProfile from './pages/AthleteProfile';
import Dashboard from './pages/Dashboard';
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
            <Route element={<Layout />}>
              <Route path="/app">
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="athletes" element={<Athletes />} />
                <Route path="athlete/:id" element={<AthleteProfile />} />
                <Route path="record" element={<RecordFeedback />} />
                <Route path="analytics" element={<Analytics />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </MantineProvider>
  );
}

export default App;
