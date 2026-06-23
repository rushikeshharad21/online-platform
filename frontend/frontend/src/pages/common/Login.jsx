import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, resetState } from '../../features/auth/authSlice';
import { 
  Container, Box, Typography, TextField, Button, Card, 
  CardContent, Alert, CircularProgress 
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, isLoading, isError, message } = useSelector((state) => state.auth || {});

  useEffect(() => {
    if (user) {
      navigate(user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard');
    }
    return () => dispatch(resetState());
  }, [user, navigate, dispatch]);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    if (email && password) dispatch(loginUser({ email, password }));
  };

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    color: '#fff',
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Card sx={glassStyle} elevation={0}>
        <CardContent sx={{ p: 4 }}>
          {/* Replaced Avatar with subtle, high-end iconography */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <LockOutlined sx={{ fontSize: 32, color: '#0d6efd', mb: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
              Sign in to continue to your dashboard
            </Typography>
          </Box>

          {isError && (
            <Alert severity="error" sx={{ mb: 3, background: 'rgba(211,47,47,0.15)', color: '#ffb3b3', border: '1px solid rgba(211,47,47,0.3)', borderRadius: 2 }}>
              {message || 'Authentication failed.'}
            </Alert>
          )}

          <Box component="form" onSubmit={onSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              name="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={onChange}
              disabled={isLoading}
              sx={inputStyles}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={password}
              onChange={onChange}
              disabled={isLoading}
              sx={inputStyles}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '1rem', fontWeight: 600, background: '#0d6efd', boxShadow: 'none', '&:hover': { background: '#0b5ed7' } }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button onClick={() => navigate('/register')} sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none', fontSize: '0.9rem' }}>
                Don't have an account? <strong style={{ marginLeft: 5, color: '#fff' }}>Sign Up</strong>
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

// Extracted styles for cleaner logic
const inputStyles = {
  '& .MuiOutlinedInput-root': {
    color: '#fff',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
    '&.Mui-focused fieldset': { borderColor: '#0d6efd' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
};

export default Login;