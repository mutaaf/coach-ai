import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Button,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  Group,
  Speed,
  EmojiEvents,
  Timeline,
  Assignment,
  InfoOutlined,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { getAllPlayers } from '../services/storageService';

const SkillProgressCard = ({ title, skills, icon }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ height: '100%', bgcolor: 'background.dark' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1, color: 'white' }}>
            {title}
          </Typography>
        </Box>
        {skills.map((skill) => (
          <Box key={skill.name} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {skill.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {skill.value}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={skill.value}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: skill.trend === 'up' ? theme.palette.success.main : theme.palette.error.main,
                }
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              {skill.trend === 'up' ? (
                <ArrowUpward sx={{ fontSize: 16, color: theme.palette.success.main }} />
              ) : (
                <ArrowDownward sx={{ fontSize: 16, color: theme.palette.error.main }} />
              )}
              <Typography variant="caption" sx={{ ml: 0.5, color: 'rgba(255, 255, 255, 0.5)' }}>
                {skill.trend === 'up' ? '+' : '-'}{skill.change}% this month
              </Typography>
            </Box>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

const DevelopmentCard = ({ title, items }) => (
  <Card sx={{ height: '100%', bgcolor: 'background.dark' }}>
    <CardContent>
      <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
        {title}
      </Typography>
      <List>
        {items.map((item, index) => (
          <ListItem 
            key={index}
            sx={{ 
              borderLeft: '3px solid',
              borderColor: item.priority === 'high' ? 'error.main' : 
                         item.priority === 'medium' ? 'warning.main' : 'success.main',
              mb: 1,
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '4px',
            }}
          >
            <ListItemText
              primary={
                <Typography variant="body1" sx={{ color: 'white' }}>
                  {item.text}
                </Typography>
              }
              secondary={
                <Box sx={{ mt: 1 }}>
                  {item.tags.map((tag, idx) => (
                    <Chip
                      key={idx}
                      label={tag}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5, bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                    />
                  ))}
                </Box>
              }
            />
            <Tooltip title="View Details">
              <IconButton size="small" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                <InfoOutlined />
              </IconButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
);

const Analytics = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const theme = useTheme();

  // In a real app, this would come from an API or analytics service
  const teamSkills = [
    { name: 'Team Chemistry', value: 78, trend: 'up', change: 5 },
    { name: 'Offensive Execution', value: 65, trend: 'up', change: 8 },
    { name: 'Defensive Coordination', value: 82, trend: 'down', change: 3 },
    { name: 'Fast Break Efficiency', value: 70, trend: 'up', change: 12 },
  ];

  const individualSkills = [
    { name: 'Shooting Form', value: 75, trend: 'up', change: 7 },
    { name: 'Ball Handling', value: 68, trend: 'up', change: 4 },
    { name: 'Court Awareness', value: 80, trend: 'down', change: 2 },
    { name: 'Defensive Stance', value: 72, trend: 'up', change: 6 },
  ];

  const developmentAreas = [
    {
      text: 'Implement advanced pick-and-roll variations',
      priority: 'high',
      tags: ['Offense', 'Team Play', 'Strategy'],
    },
    {
      text: 'Focus on transition defense drills',
      priority: 'medium',
      tags: ['Defense', 'Conditioning'],
    },
    {
      text: 'Individual shooting form refinement needed',
      priority: 'medium',
      tags: ['Fundamentals', 'Skill Development'],
    },
  ];

  const curriculumUpdates = [
    {
      text: 'New zone defense patterns based on recent game analysis',
      priority: 'high',
      tags: ['Defense', 'Strategy Update'],
    },
    {
      text: 'Modified conditioning program for guards',
      priority: 'medium',
      tags: ['Conditioning', 'Position Specific'],
    },
    {
      text: 'Advanced ball movement drills added',
      priority: 'low',
      tags: ['Offense', 'Team Development'],
    },
  ];

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 4 }}>
        Team Analytics & Development
      </Typography>

      <Tabs 
        value={currentTab} 
        onChange={(e, newValue) => setCurrentTab(newValue)}
        sx={{ 
          mb: 4,
          '& .MuiTab-root': { color: 'rgba(255, 255, 255, 0.7)' },
          '& .Mui-selected': { color: 'white' },
        }}
      >
        <Tab icon={<Timeline />} label="Progress Tracking" />
        <Tab icon={<Assignment />} label="Development Plan" />
        <Tab icon={<EmojiEvents />} label="Achievements" />
      </Tabs>

      {currentTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <SkillProgressCard
              title="Team Performance Metrics"
              skills={teamSkills}
              icon={<Group sx={{ color: theme.palette.primary.main }} />}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SkillProgressCard
              title="Individual Skills Progress"
              skills={individualSkills}
              icon={<Speed sx={{ color: theme.palette.secondary.main }} />}
            />
          </Grid>
          <Grid item xs={12}>
            <DevelopmentCard
              title="Focus Areas This Week"
              items={developmentAreas}
            />
          </Grid>
        </Grid>
      )}

      {currentTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <DevelopmentCard
              title="Curriculum Updates"
              items={curriculumUpdates}
            />
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ bgcolor: 'background.dark' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Recommended Practice Plan
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  Generate Custom Practice Plan
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {currentTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ bgcolor: 'background.dark' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Team Achievements
                </Typography>
                {/* Achievement content will go here */}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Analytics; 