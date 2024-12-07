import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import TimelineIcon from '@mui/icons-material/Timeline';
import { getAllPlayers, deleteRecording } from '../services/storageService';

const PlayerDashboard = () => {
  const [players, setPlayers] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = () => {
    const playerData = getAllPlayers();
    setPlayers(playerData);
  };

  const handleDeleteRecording = (recordingId) => {
    if (window.confirm('Are you sure you want to delete this recording?')) {
      const success = deleteRecording(recordingId);
      if (success) {
        loadPlayers();
      }
    }
  };

  const renderPlayerCard = (playerName, playerData) => {
    const stats = playerData.stats;
    const isSelected = selectedPlayer === playerName;

    return (
      <Card 
        key={playerName}
        sx={{ 
          mb: 2,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
        }}
        onClick={() => setSelectedPlayer(isSelected ? null : playerName)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{playerData.name}</Typography>
            <Chip 
              icon={<TimelineIcon />}
              label={`${stats.totalSessions} Sessions`}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Most Frequent Skills
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {Object.entries(stats.skillFrequency)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([skill, count]) => (
                    <Chip
                      key={skill}
                      label={`${skill} (${count})`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Recent Session Types
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {Object.entries(stats.sessionTypes)
                  .map(([type, count]) => (
                    <Chip
                      key={type}
                      label={`${type} (${count})`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  ))}
              </Box>
            </Grid>
          </Grid>

          {isSelected && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Recent Highlights
              </Typography>
              <List dense>
                {stats.recentHighlights.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={item.highlight}
                      secondary={new Date(item.timestamp).toLocaleDateString()}
                    />
                  </ListItem>
                ))}
              </List>

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Areas for Improvement
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Area</TableCell>
                      <TableCell align="right">Frequency</TableCell>
                      <TableCell>Progress</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(stats.improvementAreas)
                      .sort(([,a], [,b]) => b - a)
                      .map(([area, count]) => (
                        <TableRow key={area}>
                          <TableCell>{area}</TableCell>
                          <TableCell align="right">{count}</TableCell>
                          <TableCell>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min((count / stats.totalSessions) * 100, 100)}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                Feedback History
              </Typography>
              <List dense>
                {playerData.feedback
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map((feedback, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRecording(feedback.recordingId);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={`${feedback.analysis.session_type} Session`}
                        secondary={new Date(feedback.timestamp).toLocaleString()}
                      />
                    </ListItem>
                  ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Player Progress Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          {Object.entries(players).length > 0 ? (
            Object.entries(players).map(([playerName, playerData]) => 
              renderPlayerCard(playerName, playerData)
            )
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No player data available yet. Start recording feedback to see player progress.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default PlayerDashboard; 