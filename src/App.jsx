import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
            <Route element={<Layout />}>
              <Route path="/record" element={<RecordFeedback />} />
              <Route path="/players" element={<Players />} />
              <Route path="/dashboard" element={<PlayerDashboard />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </MantineProvider>
  );
}

export default App;
