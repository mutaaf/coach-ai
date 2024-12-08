import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MicIcon from '@mui/icons-material/Mic';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AnalyticsIcon from '@mui/icons-material/Analytics';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Talent Scout
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/app/dashboard"
            startIcon={<DashboardIcon />}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/app/athletes"
            startIcon={<PeopleIcon />}
          >
            Athletes
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/app/record"
            startIcon={<MicIcon />}
          >
            Record
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/app/analytics"
            startIcon={<AnalyticsIcon />}
          >
            Analytics
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 