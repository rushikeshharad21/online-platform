import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, resetState } from '../../features/auth/authSlice';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Avatar, 
  Alert,
  CircularProgress
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Access global security states inside your Redux slices blueprint
  const { user, isLoading, isError, message } = useSelector((state) => state.auth || {});

  useEffect(() => {
    if (user) {
      // Fluid route authorization handshakes matching your directory access nodes
      if (user.role === 'instructor') {
        navigate('/instructor/dashboard');
      } else {
        navigate('/dashboard');
      }
    }

    // Clean up states when navigating away from the authorization node
    return () => {
      if (dispatch && resetState) {
        dispatch(resetState());
      }
    };
  }, [user, navigate, dispatch]);

  const onChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      dispatch(loginUser({ email, password }));
    }
  };

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          marginTop: { xs: 4, sm: 8 }, // Fluid margins: tighter on mobile, spacious on screens
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        <Card 
          elevation={3} 
          sx={{ 
            width: '100%', 
            borderRadius: 3,
            p: { xs: 1, sm: 3 } // Dynamic interior padding based on device scale
          }}
        >
          <CardContent>
            {/* Header Icon & Branding Typography */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
                <LockOutlined fontSize="large" />
              </Avatar>
              <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                Sign In
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                Access your personalized LMS workspace
              </Typography>
            </Box>

            {/* Error alerts from API Handshakes */}
            {isError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {message || 'Authentication failed. Please verify credentials.'}
              </Alert>
            )}

            {/* Interactive Forms Processing Block */}
            <Box component="form" onSubmit={onSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={onChange}
                disabled={isLoading}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={onChange}
                disabled={isLoading}
                sx={{ mb: 3 }}
              />

              {/* Action Submit Dispatch Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ 
                  py: 1.5, 
                  borderRadius: 2, 
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none'
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>

              {/* Bottom Navigation Anchors */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button 
                  color="primary" 
                  sx={{ textTransform: 'none', fontWeight: 500 }} 
                  onClick={() => navigate('/register')}
                >
                  Don't have an account? Sign Up
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default Login;