import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Timeline,
  Assessment,
  TrendingUp,
  Close,
  OpenInNew,
} from '@mui/icons-material';
import { getAllPlayers, getPlayerFeedbackHistory } from '../services/storageService';

const PlayerDetailDialog = ({ player, open, onClose }) => {
  const [currentTab, setCurrentTab] = useState(0);

  if (!player) return null;

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const renderProgressCard = (title, data, type = 'skills') => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {Object.entries(data).map(([key, value]) => (
          <Box key={key} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">{key}</Typography>
              <Typography variant="body2" color="text.secondary">
                {value} {type === 'skills' ? 'mentions' : '%'}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={type === 'skills' ? (value / Object.values(data).reduce((a, b) => a + b, 0)) * 100 : value}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        ))}
      </CardContent>
    </Card>
  );

  const renderFeedbackTimeline = () => (
    <List>
      {player.feedback
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .map((feedback, index) => (
          <ListItem key={index} alignItems="flex-start">
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">
                    {feedback.analysis.session_type} Session
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(feedback.timestamp).toLocaleDateString()}
                  </Typography>
                </Box>
              }
              secondary={
                <>
                  {feedback.analysis.key_takeaways.map((takeaway, idx) => (
                    <Chip
                      key={idx}
                      label={takeaway}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </>
              }
            />
          </ListItem>
        ))}
    </List>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">{player.name}</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab icon={<Assessment />} label="Overview" />
          <Tab icon={<Timeline />} label="Progress" />
          <Tab icon={<TrendingUp />} label="Analytics" />
        </Tabs>

        {currentTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {renderProgressCard('Skills Distribution', player.stats.skillFrequency)}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderProgressCard('Recent Improvements', player.stats.improvementAreas, 'improvement')}
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Highlights
                  </Typography>
                  <List>
                    {player.stats.recentHighlights.map((highlight, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={highlight.highlight}
                          secondary={new Date(highlight.timestamp).toLocaleDateString()}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {currentTab === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Feedback Timeline
            </Typography>
            {renderFeedbackTimeline()}
          </Box>
        )}

        {currentTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Session Distribution
                  </Typography>
                  {Object.entries(player.stats.sessionTypes).map(([type, count]) => (
                    <Box key={type} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>{type}</Typography>
                        <Typography color="text.secondary">{count} sessions</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(count / player.stats.totalSessions) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
};

const Players = () => {
  const [players, setPlayers] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = () => {
    const playerData = getAllPlayers();
    setPlayers(playerData);
  };

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Players
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Total Sessions</TableCell>
              <TableCell>Last Feedback</TableCell>
              <TableCell>Top Skills</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.values(players).map((player) => (
              <TableRow
                key={player.name}
                sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
              >
                <TableCell>{player.name}</TableCell>
                <TableCell>{player.stats.totalSessions}</TableCell>
                <TableCell>
                  {new Date(player.stats.lastFeedback).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {Object.entries(player.stats.skillFrequency)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 2)
                      .map(([skill]) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handlePlayerClick(player)}
                  >
                    <OpenInNew />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <PlayerDetailDialog
        player={selectedPlayer}
        open={Boolean(selectedPlayer)}
        onClose={() => setSelectedPlayer(null)}
      />
    </Box>
  );
};

export default Players; 