import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { getAllPlayers, deletePlayer } from '../services/storageService';

const PlayerDashboard = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = () => {
    const playerData = getAllPlayers();
    setPlayers(Object.values(playerData));
  };

  const handleMenuClick = (event, player) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedPlayer(player);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedPlayer(null);
  };

  const handleDeletePlayer = () => {
    if (selectedPlayer) {
      deletePlayer(selectedPlayer.id);
      loadPlayers();
    }
    handleMenuClose();
  };

  const handleEditPlayer = () => {
    if (selectedPlayer) {
      navigate(`/players?edit=${selectedPlayer.id}`);
    }
    handleMenuClose();
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      '#1976d2', // blue
      '#388e3c', // green
      '#d32f2f', // red
      '#f57c00', // orange
      '#7b1fa2', // purple
      '#0288d1', // light blue
      '#388e3c', // green
      '#fbc02d', // yellow
    ];
    
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Player Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/record')}
        >
          Record Feedback
        </Button>
      </Box>

      <Grid container spacing={3}>
        {players.map((player) => (
          <Grid item xs={12} sm={6} md={4} key={player.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { boxShadow: 6 }
              }}
              onClick={() => navigate(`/players?view=${player.id}`)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      width: 56, 
                      height: 56, 
                      mr: 2,
                      bgcolor: getAvatarColor(player.name)
                    }}
                  >
                    {getInitials(player.name)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{player.name}</Typography>
                    <Typography color="text.secondary">
                      {player.position || 'Position not set'}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={(e) => handleMenuClick(e, player)}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  Recent Activity
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {player.stats.totalSessions} sessions recorded
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last feedback: {player.stats.lastFeedback ? 
                      new Date(player.stats.lastFeedback).toLocaleDateString() :
                      'No feedback yet'
                    }
                  </Typography>
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  Top Skills
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {Object.entries(player.stats.skillFrequency || {})
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([skill]) => (
                      <Chip
                        key={skill}
                        label={skill}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditPlayer}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Player
        </MenuItem>
        <MenuItem onClick={handleDeletePlayer} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Player
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default PlayerDashboard; 