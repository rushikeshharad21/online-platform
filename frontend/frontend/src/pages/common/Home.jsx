import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Typography, Button, Stack, Card, Box, Grid } from '@mui/material';
import { MenuBook, ElectricBolt, Security, ArrowForward } from '@mui/icons-material';

function Home() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});

  const featureCard = {
    position: 'relative',
    display: 'flex',            // Added to control layout
    flexDirection: 'column',    // Ensures children stack
    background: 'rgba(16, 28, 45, 0.6)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '40px',
    height: '100%',             // Forces uniform height
    transition: 'all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)',
    '&:hover': {
      borderColor: 'rgba(100, 255, 218, 0.3)',
      transform: 'translateY(-12px)',
      boxShadow: '0 30px 60px -15px rgba(0,0,0,0.5)',
      '& .icon-box': { background: 'rgba(100, 255, 218, 0.2)', transform: 'scale(1.1)' }
    }
  };

  return (
    <Box sx={{ 
      width: '100%', minHeight: '100vh', py: 15, 
      background: '#050b16',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""', position: 'absolute', top: '-10%', left: '20%', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(100, 255, 218, 0.06) 0%, transparent 70%)', zIndex: 0
      }
    }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 16 }}>
          <Typography variant="overline" sx={{ color: '#64ffda', letterSpacing: '0.2em', fontWeight: 700, opacity: 0.8 }}>
            Next-Gen Learning
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: '3rem', md: '5rem' }, fontWeight: 800, color: '#fff', mb: 3, letterSpacing: '-0.04em' }}>
            Rk.learning.<span style={{ color: '#64ffda' }}>platform</span>
          </Typography>
          <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: '700px', mx: 'auto', lineHeight: 1.6, mb: 6 }}>
            The definitive platform for professionals. Master complex concepts with structured paths, real-time analytics, and enterprise-grade security.
          </Typography>

          <Stack direction="row" spacing={3} justifyContent="center">
            {user ? (
              <Button variant="contained" size="large" onClick={() => navigate(user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard')}
                sx={{ borderRadius: 4, px: 6, py: 2, textTransform: 'none', fontSize: '1.1rem', background: '#64ffda', color: '#050b16', fontWeight: 700, boxShadow: '0 10px 25px rgba(100, 255, 218, 0.2)' }}>
                Access Dashboard
              </Button>
            ) : (
              <>
                <Button variant="contained" size="large" onClick={() => navigate('/login')} sx={{ borderRadius: 4, px: 5, py: 2, background: '#64ffda', color: '#050b16', fontWeight: 700, fontSize: '1.1rem' }}>
                  Get Started
                </Button>
                <Button variant="outlined" size="large" onClick={() => navigate('/register')} endIcon={<ArrowForward />} sx={{ borderRadius: 4, px: 5, py: 2, color: '#fff', borderColor: 'rgba(255,255,255,0.2)', fontSize: '1.1rem' }}>
                  Explore Programs
                </Button>
              </>
            )}
          </Stack>
        </Box>

        <Grid container spacing={4} alignItems="stretch"> {/* alignItems="stretch" ensures all cards match the tallest */}
          {[
            { icon: MenuBook, title: 'Mastery Paths', desc: 'Curated curriculum designed to take you from foundational basics to expert-level industry mastery.' },
            { icon: ElectricBolt, title: 'Adaptive Quizzes', desc: 'Dynamic assessment engines that evolve with your progress, ensuring 100% conceptual retention.' },
            { icon: Security, title: 'Ironclad Security', desc: 'End-to-end encryption for your intellectual property, research, and personal progress data.' }
          ].map((item, idx) => (
            <Grid item xs={12} sm={4} key={idx} sx={{ display: 'flex' }}>
              <Card sx={featureCard}>
                <Box className="icon-box" sx={{ mb: 4, width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, background: 'rgba(255,255,255,0.05)', transition: 'all 0.4s' }}>
                  <item.icon sx={{ fontSize: 32, color: '#64ffda' }} />
                </Box>
                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 2, fontSize: '1.5rem' }}>{item.title}</Typography>
                <Box sx={{ flexGrow: 1 }}> {/* Pushes content to fill the card */}
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>{item.desc}</Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default Home;