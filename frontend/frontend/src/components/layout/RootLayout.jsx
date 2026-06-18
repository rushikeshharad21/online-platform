import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box, 
  CssBaseline, 
  ThemeProvider, 
  createTheme 
} from '@mui/material';
import { School, Login, AccountCircle, Logout } from '@mui/icons-material';
import { logoutUser } from '../../features/auth/authSlice';

// Create a modern theme profile
const theme = createTheme({
  palette: {
    primary: { main: '#0d6efd' },
    background: { default: '#f8f9fa' }
  },
});

function RootLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Resets global margins and sets correct background scaling */}
      
      <AppBar position="static" elevation={1} color="inherit">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <School sx={{ display: 'flex', mr: 1, color: 'primary.main' }} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              onClick={() => navigate('/')}
              sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 700, color: 'text.primary' }}
            >
              Rk online platform 
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {user ? (
                <>
                  <Button 
                    startIcon={<AccountCircle />}
                    onClick={() => navigate(user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    color="error" 
                    startIcon={<Logout />} 
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button startIcon={<Login />} onClick={() => navigate('/login')}>
                    Sign In
                  </Button>
                  <Button variant="contained" onClick={() => navigate('/register')}>
                    Register
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* This renders our pages below the navigation panel */}
      <Box component="main" sx={{ py: 4 }}>
        <Outlet />
      </Box>
    </ThemeProvider>
  );
}

export default RootLayout;