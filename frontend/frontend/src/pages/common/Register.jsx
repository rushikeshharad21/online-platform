import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, resetState } from '../../features/auth/authSlice';
import { 
  Container, Box, Typography, TextField, Button, Card, 
  CardContent, Alert, MenuItem, CircularProgress, Grid, Snackbar 
} from '@mui/material';
import { PersonAddOutlined } from '@mui/icons-material';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const { name, email, password, confirmPassword, role } = formData;
  const [validationError, setValidationError] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth || {});

  useEffect(() => {
    if (isSuccess || user) {
      setShowPopup(true);
      const timer = setTimeout(() => {
        navigate(user?.role === 'instructor' ? '/instructor/dashboard' : '/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
    return () => { dispatch(resetState()); };
  }, [user, isSuccess, navigate, dispatch]);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    setValidationError('');
    if (!name || !email || !password || !confirmPassword) return setValidationError('Please fill in all fields');
    if (password !== confirmPassword) return setValidationError('Passwords mismatch');
    if (password.length < 6) return setValidationError('Password must be 6+ characters');
    dispatch(registerUser({ name, email, password, role }));
  };

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    color: '#fff',
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      color: '#fff',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
      '&.Mui-focused fieldset': { borderColor: '#0d6efd' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)' },
    '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.4)' },
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Card sx={glassStyle} elevation={0}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <PersonAddOutlined sx={{ fontSize: 32, color: '#0d6efd', mb: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>Create Account</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>Join our learning community today</Typography>
          </Box>

          {(validationError || isError) && (
            <Alert severity="error" sx={{ mb: 3, background: 'rgba(211,47,47,0.15)', color: '#ffb3b3', border: '1px solid rgba(211,47,47,0.3)', borderRadius: 2 }}>
              {validationError || message}
            </Alert>
          )}

          <Box component="form" onSubmit={onSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField required fullWidth label="Full Name" name="name" value={name} onChange={onChange} disabled={isLoading} sx={inputStyles} /></Grid>
              <Grid item xs={12}><TextField required fullWidth label="Email Address" name="email" value={email} onChange={onChange} disabled={isLoading} sx={inputStyles} /></Grid>
              <Grid size= {{xs:12}}>
                <TextField select required fullWidth label="Register As" name="role" value={role} onChange={onChange} disabled={isLoading} sx={inputStyles}>
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="instructor">Instructor</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{xs:12,sm:6}}><TextField required fullWidth name="password" label="Password" type="password" value={password} onChange={onChange} disabled={isLoading} sx={inputStyles} /></Grid>
              <Grid size= {{xs:12, sm:6}}><TextField required fullWidth name="confirmPassword" label="Confirm Password" type="password" value={confirmPassword} onChange={onChange} disabled={isLoading} sx={inputStyles} /></Grid>
            </Grid>

            <Button type="submit" fullWidth variant="contained" size="large" disabled={isLoading} sx={{ mt: 4, py: 1.5, borderRadius: 2, fontWeight: 600, background: '#0d6efd', boxShadow: 'none' }}>
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar open={showPopup} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ width: '100%', borderRadius: 2 }}>🎉 Account Created! Redirecting...</Alert>
      </Snackbar>
    </Container>
  );
}

export default Register;