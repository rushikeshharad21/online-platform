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

const theme = createTheme({
  palette: {
    primary: { main: '#0d6efd' },
    background: { default: 'transparent' }, // Let our bg show through
  },
});

const BG_IMAGE = 'https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?w=1600&auto=format&fit=crop&q=80';

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
      <CssBaseline />

      {/* ── Full-app background layer ───────────────────────────────────────
          position: fixed keeps the image pinned while content scrolls.
          The ::before overlay tints it dark so every page's text is readable.
          All page content must have position: relative + zIndex >= 1 to sit
          above this overlay — Container in each page handles that.
      ──────────────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,                          // Behind everything
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'rgba(5, 10, 30, 0.72)', // Navy tint — matches image's blue tones
          },
        }}
      />

      {/* ── Navbar ─────────────────────────────────────────────────────────
          backdrop-filter gives the frosted glass effect so the bg shows
          through subtly rather than being blocked by a solid white bar.
      ──────────────────────────────────────────────────────────────────── */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          background: 'rgba(5, 10, 30, 0.55)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <School sx={{ mr: 1, color: '#60a5fa' }} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              onClick={() => navigate('/')}
              sx={{
                flexGrow: 1,
                cursor: 'pointer',
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.3px',
              }}
            >
              Rk online platform
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {user ? (
                <>
                  <Button
                    startIcon={<AccountCircle />}
                    onClick={() => navigate(user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard')}
                    sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.08)' } }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    startIcon={<Logout />}
                    onClick={handleLogout}
                    sx={{ color: '#f87171', '&:hover': { background: 'rgba(248,113,113,0.1)' } }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    startIcon={<Login />}
                    onClick={() => navigate('/login')}
                    sx={{ color: 'rgba(194, 13, 13, 0.85)', '&:hover': { color: '#ebe3e3c5', background: 'rgba(180, 33, 33, 0.08)' } }}
                  >
                    Sign in
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/register')}
                    sx={{ background: '#0d6efd', '&:hover': { background: '#0b5ed7' } }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ── Page content ───────────────────────────────────────────────────
          position: relative + zIndex: 1 lifts all child pages above the
          fixed background overlay. Each page's own Container inherits this.
      ──────────────────────────────────────────────────────────────────── */}
      <Box
        component="main"
        sx={{ position: 'relative', zIndex: 1, minHeight: 'calc(100vh - 64px)' }}
      >
        <Outlet />
      </Box>

    </ThemeProvider>
  );
}

export default RootLayout;