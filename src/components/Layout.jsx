import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import MicIcon from '@mui/icons-material/Mic';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import Navbar from './Navbar';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/app/dashboard' },
  { text: 'Athletes', icon: <PeopleIcon />, path: '/app/athletes' },
  { text: 'Record', icon: <MicIcon />, path: '/app/record' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/app/analytics' },
];

const Layout = () => {
  const theme = useTheme();
  const location = useLocation();

  const isCurrentPath = (path) => {
    // Handle both exact matches and sub-paths (for athlete/:id)
    return location.pathname === path || 
           (path === '/app/athletes' && location.pathname.startsWith('/app/athlete/'));
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Side Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            background: theme.palette.background.default,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {/* Spacer for navbar */}
        <Box sx={{ height: 64 }} />
        
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              component={RouterLink}
              to={item.path}
              selected={isCurrentPath(item.path)}
              sx={{
                my: 0.5,
                mx: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(33, 150, 243, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(33, 150, 243, 0.12)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: isCurrentPath(item.path)
                    ? theme.palette.primary.main 
                    : theme.palette.text.secondary,
                  minWidth: 40 
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isCurrentPath(item.path) ? 600 : 500,
                  color: isCurrentPath(item.path)
                    ? theme.palette.primary.main 
                    : theme.palette.text.primary,
                }}
              />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3,
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 