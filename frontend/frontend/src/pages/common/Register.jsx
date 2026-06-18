import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, resetState } from '../../features/auth/authSlice';
import { Container, Box, Typography, TextField, Button, Card, CardContent, Avatar, Alert, MenuItem, CircularProgress, Grid, Snackbar } from '@mui/material';
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

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Card elevation={3} sx={{ width: '100%', borderRadius: 3, p: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}><PersonAddOutlined fontSize="large" /></Avatar>
              <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mt: 1 }}>Create Account</Typography>
            </Box>

            {(validationError || isError) && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{validationError || message}</Alert>}

            <Box component="form" onSubmit={onSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12}><TextField required fullWidth label="Full Name" name="name" value={name} onChange={onChange} disabled={isLoading} /></Grid>
                <Grid item xs={12}><TextField required fullWidth label="Email Address" name="email" value={email} onChange={onChange} disabled={isLoading} /></Grid>
                <Grid item xs={12}>
                  <TextField required fullWidth select label="Register As" name="role" value={role} onChange={onChange} disabled={isLoading}>
                    <MenuItem value="student">🎓 Student</MenuItem>
                    <MenuItem value="instructor">👨‍🏫 Instructor</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}><TextField required fullWidth name="password" label="Password" type="password" value={password} onChange={onChange} disabled={isLoading} /></Grid>
                <Grid item xs={12} sm={6}><TextField required fullWidth name="confirmPassword" label="Confirm Password" type="password" value={confirmPassword} onChange={onChange} disabled={isLoading} /></Grid>
              </Grid>
              <Button type="submit" fullWidth variant="contained" size="large" disabled={isLoading} sx={{ mt: 4, py: 1.5, borderRadius: 2, fontWeight: 600 }}>
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Snackbar open={showPopup} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ width: '100%', borderRadius: 2 }}>🎉 Account Created! Redirecting...</Alert>
      </Snackbar>
    </Container>
  );
}

export default Register;