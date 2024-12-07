import { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const mockPlayers = [
  {
    id: 1,
    name: 'John Smith',
    position: 'Point Guard',
    number: '23',
    recentFeedback: [
      { id: 1, date: '2024-01-05', type: 'Practice' },
      { id: 2, date: '2024-01-03', type: 'Game' },
    ],
  },
  {
    id: 2,
    name: 'Mike Johnson',
    position: 'Center',
    number: '34',
    recentFeedback: [
      { id: 3, date: '2024-01-04', type: 'Combine' },
    ],
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [players] = useState(mockPlayers);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Player Dashboard
      </Typography>
      <Grid container spacing={3}>
        {players.map((player) => (
          <Grid item xs={12} sm={6} md={4} key={player.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { boxShadow: 6 }
              }}
              onClick={() => navigate(`/player/${player.id}`)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ width: 56, height: 56, mr: 2 }}>
                    {player.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{player.name}</Typography>
                    <Typography color="textSecondary">
                      #{player.number} | {player.position}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="subtitle2" gutterBottom>
                  Recent Feedback
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {player.recentFeedback.map((feedback) => (
                    <Chip
                      key={feedback.id}
                      label={`${feedback.type} - ${feedback.date}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard; 