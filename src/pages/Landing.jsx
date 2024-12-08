import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
} from '@mui/material';
import {
  Timeline,
  SportsSoccer,
  School,
  TrendingUp,
  Group,
  Psychology,
  Speed,
  Mic,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@mui/system';

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const FeatureSection = ({ title, description, icon, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Fade in={isVisible} timeout={1000}>
      <Card 
        sx={{ 
          height: '100%',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-8px)',
            background: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
          }
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Box 
            sx={{ 
              animation: `${pulseAnimation} 2s infinite ease-in-out`,
              mb: 2 
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'white' }}>
            {title}
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            {description}
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  );
};

const ValueProposition = ({ title, points, icon, align = 'left', delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Slide direction={align === 'left' ? 'right' : 'left'} in={isVisible} timeout={1000}>
      <Box 
        sx={{ 
          mb: 12,
          textAlign: align,
          '&:hover': {
            '& .icon-container': {
              transform: 'scale(1.1) rotate(5deg)',
            }
          }
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            justifyContent: align === 'left' ? 'flex-start' : 'flex-end' 
          }}
        >
          {align === 'right' && <Typography variant="h4" sx={{ mr: 2, color: 'white' }}>{title}</Typography>}
          <Box 
            className="icon-container"
            sx={{ 
              transition: 'transform 0.3s ease-in-out',
              background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
              borderRadius: '50%',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          {align === 'left' && <Typography variant="h4" sx={{ ml: 2, color: 'white' }}>{title}</Typography>}
        </Box>
        {points.map((point, index) => (
          <Typography 
            key={index} 
            variant="h6" 
            sx={{ 
              mb: 2,
              fontWeight: 300,
              maxWidth: '600px',
              ml: align === 'left' ? 0 : 'auto',
              mr: align === 'right' ? 0 : 'auto',
              color: 'rgba(255, 255, 255, 0.8)',
              transition: 'color 0.3s ease-in-out',
              '&:hover': {
                color: 'white',
              }
            }}
          >
            {point}
          </Typography>
        ))}
      </Box>
    </Slide>
  );
};

const Landing = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/app/record');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(-45deg, #000000, #1a1a1a, #2C3E50, #000000)',
      backgroundSize: '400% 400%',
      animation: `${gradientAnimation} 15s ease infinite`,
      color: 'white',
      pt: 8,
      overflow: 'hidden',
    }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 15 }}>
          <Fade in={true} timeout={1000}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '3rem', md: '5rem' },
                fontWeight: 800,
                mb: 3,
                background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
                backgroundSize: '200% 200%',
                animation: `${gradientAnimation} 3s ease infinite`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(255,107,107,0.3)',
              }}
            >
              Scout Hub
            </Typography>
          </Fade>
          <Fade in={true} timeout={1500}>
            <Typography 
              variant="h4" 
              sx={{ 
                mb: 6,
                fontWeight: 300,
                color: 'rgba(255, 255, 255, 0.9)',
                maxWidth: '800px',
                mx: 'auto',
                lineHeight: 1.4,
              }}
            >
              Revolutionize Your Coaching Game with AI-Powered Insights
            </Typography>
          </Fade>
          <Button 
            variant="contained" 
            size="large"
            onClick={handleStart}
            startIcon={<Mic />}
            sx={{
              background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
              backgroundSize: '200% 200%',
              animation: `${gradientAnimation} 3s ease infinite`,
              color: 'white',
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              borderRadius: '50px',
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 6px 20px rgba(255, 107, 107, 0.6)',
              }
            }}
          >
            Start Your Journey
          </Button>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4} sx={{ mb: 15 }}>
          <Grid item xs={12} md={4}>
            <FeatureSection
              title="Instant Voice Analysis"
              description="Transform your courtside observations into actionable insights in real-time. Just speak, and let AI do the heavy lifting."
              icon={<Speed sx={{ fontSize: 48, color: '#FF6B6B' }} />}
              delay={200}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureSection
              title="Smart Player Development"
              description="Track progress with precision metrics and visualize improvement paths for each player's unique journey."
              icon={<Timeline sx={{ fontSize: 48, color: '#4ECDC4' }} />}
              delay={400}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureSection
              title="AI-Powered Strategy"
              description="Get deep insights and personalized recommendations to optimize your team's performance."
              icon={<Psychology sx={{ fontSize: 48, color: '#FFE66D' }} />}
              delay={600}
            />
          </Grid>
        </Grid>

        {/* Value Propositions */}
        <ValueProposition
          title="For Coaches"
          icon={<SportsSoccer sx={{ fontSize: 48, color: 'white' }} />}
          points={[
            "Spend more time coaching, less time note-taking",
            "Get AI-powered insights during practice and games",
            "Make data-driven decisions with confidence",
          ]}
          align="left"
          delay={800}
        />

        <ValueProposition
          title="For Parents"
          icon={<Group sx={{ fontSize: 48, color: 'white' }} />}
          points={[
            "Watch your athlete's growth with detailed progress tracking",
            "Understand their strengths and areas for improvement",
            "Stay connected with their development journey",
          ]}
          align="right"
          delay={1000}
        />

        <ValueProposition
          title="For Schools"
          icon={<School sx={{ fontSize: 48, color: 'white' }} />}
          points={[
            "Elevate your athletic program with professional-grade analytics",
            "Create comprehensive player development roadmaps",
            "Boost college recruitment opportunities",
          ]}
          align="left"
          delay={1200}
        />

        <ValueProposition
          title="For Scouts"
          icon={<TrendingUp sx={{ fontSize: 48, color: 'white' }} />}
          points={[
            "Access detailed performance analytics and trends",
            "Compare players across multiple metrics",
            "Make confident recruitment decisions",
          ]}
          align="right"
          delay={1400}
        />

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center', py: 12 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              mb: 4, 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Ready to Transform Your Coaching?
          </Typography>
          <Button 
            variant="contained"
            size="large"
            onClick={handleStart}
            sx={{
              background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
              backgroundSize: '200% 200%',
              animation: `${gradientAnimation} 3s ease infinite`,
              color: 'white',
              px: 8,
              py: 2,
              fontSize: '1.2rem',
              borderRadius: '50px',
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-3px) scale(1.05)',
                boxShadow: '0 6px 20px rgba(255, 107, 107, 0.6)',
              }
            }}
          >
            Get Started Now
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Landing; 