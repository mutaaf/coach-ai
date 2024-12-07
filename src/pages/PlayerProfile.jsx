import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';

const mockPlayerData = {
  1: {
    id: 1,
    name: 'John Smith',
    number: '23',
    position: 'Point Guard',
    height: "6'2\"",
    weight: '185 lbs',
    age: 19,
    team: 'Eagles Basketball',
    feedback: [
      {
        id: 1,
        date: '2024-01-05',
        type: 'Practice',
        notes: 'Great ball handling skills shown today. Need to work on left-hand layups.',
        audioUrl: null,
      },
      {
        id: 2,
        date: '2024-01-03',
        type: 'Game',
        notes: 'Excellent court vision, made several key assists. Defense needs improvement.',
        audioUrl: null,
      },
    ],
  },
  2: {
    id: 2,
    name: 'Mike Johnson',
    number: '34',
    position: 'Center',
    height: "6'10\"",
    weight: '240 lbs',
    age: 20,
    team: 'Eagles Basketball',
    feedback: [
      {
        id: 3,
        date: '2024-01-04',
        type: 'Combine',
        notes: 'Strong presence in the paint. Showed good footwork during post-up drills.',
        audioUrl: null,
      },
    ],
  },
};

const PlayerProfile = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    // In a real app, this would be an API call
    setPlayer(mockPlayerData[id]);
  }, [id]);

  if (!player) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Player Info Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: '3rem',
                  mb: 2,
                }}
              >
                {player.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {player.name}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                #{player.number} | {player.position}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Personal Information
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Height</Typography>
                  <Typography>{player.height}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Weight</Typography>
                  <Typography>{player.weight}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Age</Typography>
                  <Typography>{player.age}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Team</Typography>
                  <Typography>{player.team}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Feedback History */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Feedback History
            </Typography>
            <List>
              {player.feedback.map((feedback, index) => (
                <ListItem
                  key={feedback.id}
                  alignItems="flex-start"
                  divider={index < player.feedback.length - 1}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle1">
                          {new Date(feedback.date).toLocaleDateString()}
                        </Typography>
                        <Chip
                          label={feedback.type}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="textPrimary"
                          sx={{ display: 'block', mb: 1 }}
                        >
                          {feedback.notes}
                        </Typography>
                        {feedback.audioUrl && (
                          <audio controls src={feedback.audioUrl} style={{ width: '100%' }} />
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PlayerProfile; 