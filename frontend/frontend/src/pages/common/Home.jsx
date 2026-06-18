import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Typography, Button, Stack, Card, CardContent, Grid } from '@mui/material';
import { MenuBook, ElectricBolt, Security } from '@mui/icons-material';

function Home() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}>
      {/* Hero Section */}
      <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 800, color: 'primary.main' }}>
        Welcome to rk platform
      </Typography>
      
      <Typography variant="h6" color="textSecondary" paragraph sx={{ mb: 4, lineHeight: 1.6 }}>
        Your comprehensive digital gateway to interactive courses, expert instruction, and structured learning management.
      </Typography>

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 6 }}>
        {user ? (
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => navigate(user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard')}
          >
            Go to Your Dashboard
          </Button>
        ) : (
          <>
            <Button variant="contained" size="large" onClick={() => navigate('/login')}>
              Sign In to Learn
            </Button>
            <Button variant="outlined" size="large" onClick={() => navigate('/register')}>
              Create Account
            </Button>
          </>
        )}
      </Stack>

      {/* Feature Cards Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card elevation={1} sx={{ height: '100%', p: 2 }}>
            <CardContent>
              <MenuBook color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Structured Courses
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Access comprehensively arranged educational material tailored down to specific module chapters.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card elevation={1} sx={{ height: '100%', p: 2 }}>
            <CardContent>
              <ElectricBolt color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Real-time Quizzes
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Take interactive quizzes generated seamlessly to test your core conceptual knowledge retention.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card elevation={1} sx={{ height: '100%', p: 2 }}>
            <CardContent>
              <Security color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                Secure Platform
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Your research data, course configurations, and account sessions are safely locked using modern security protocols.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Home;