// src/components/layout/RootLayout.jsx
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar, Toolbar, Typography, Button, Container,
  Box, CssBaseline, ThemeProvider, createTheme,
  IconButton, Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Divider,
} from '@mui/material';
import {
  School, Login, AccountCircle, Logout,
  Menu as MenuIcon, Close as CloseIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { logoutUser } from '../../features/auth/authSlice';

const theme = createTheme({
  palette: {
    primary:    { main: '#4f8ef7' },
    background: { default: 'transparent' },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
});

const BG_IMAGE = 'https://plus.unsplash.com/premium_photo-1701892428860-ca4913e92274?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YmFja2dyb3VuZCUyMHVpJTIwaW1hZ2VzfGVufDB8fDB8fHww';

const tk = {
  navy:       'rgba(5,10,30,0.55)',
  border:     'rgba(255,255,255,0.10)',
  border2:    'rgba(255,255,255,0.18)',
  text1:      '#3490c5',
  text2:      'rgb(170, 148, 148)',
  text3:      'rgba(14, 15, 15, 0.82)',
  blue:       '#4f8ef7',
  blueGlow:   'rgba(79,142,247,0.20)',
  blueBorder: 'rgba(79,142,247,0.35)',
  red:        '#e00e0e',
  redHover:   'rgba(248,113,113,0.12)',
  green:      '#34d399',
};

const navBtnSx = {
  color: tk.text2, fontWeight: 600, fontSize: '13px',
  borderRadius: '8px', px: '14px', py: '7px',
  transition: 'color 0.15s, background 0.15s',
  '&:hover': { color: tk.text1, background: 'rgba(255,255,255,0.07)' },
};

export default function RootLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
    setDrawerOpen(false);
  };

  const handleDashboard = () => {
    navigate(user?.role === 'instructor' ? '/instructor/dashboard' : '/dashboard');
    setDrawerOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* ── Background image — lighter overlay so glass has something to blur ── */}
      <Box sx={{
        position: 'fixed', inset: 0, zIndex: -1,
        backgroundImage: `url(${BG_IMAGE})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        '&::after': {
          content: '""', position: 'absolute', inset: 0,
          // ↓ reduced from 0.72 → 0.52 so image shows through drawer blur
          background: 'rgba(5,10,30,0.52)',
        },
      }} />

      {/* ── Navbar ─────────────────────────────────────────── */}
      <AppBar
        position="sticky" elevation={0}
        sx={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: tk.navy,
          borderBottom: `1px solid ${tk.border}`,
          zIndex: (t) => t.zIndex.appBar,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: '56px', sm: '64px' } }}>

            {/* Brand */}
            <Box
              onClick={() => navigate('/')}
              sx={{
                display: 'flex', alignItems: 'center', gap: '8px',
                cursor: 'pointer', flexShrink: 0,
                '&:hover .brand-icon': { color: '#93c5fd' },
              }}
            >
              <School className="brand-icon" sx={{ color: '#60a5fa', fontSize: '24px', transition: 'color 0.2s' }} />
              <Typography sx={{
                fontWeight: 800, color: tk.text1,
                fontSize: 'clamp(14px,2.5vw,17px)',
                letterSpacing: '-0.3px', lineHeight: 1,
                display: { xs: 'none', sm: 'block' },
              }}>
                Rk Online Platform
              </Typography>
              <Typography sx={{
                fontWeight: 800, color: tk.text1,
                fontSize: '15px', letterSpacing: '-0.3px',
                display: { xs: 'block', sm: 'none' },
              }}>
                RkOP
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Desktop nav */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: '6px' }}>
              {user ? (
                <>
                  <Button
                    startIcon={<AccountCircle sx={{ fontSize: '17px !important' }} />}
                    onClick={handleDashboard} sx={navBtnSx}
                  >
                    Dashboard
                  </Button>
                  <Button
                    startIcon={<Logout sx={{ fontSize: '15px !important' }} />}
                    onClick={handleLogout}
                    sx={{ ...navBtnSx, color: tk.red, '&:hover': { color: '#fca5a5', background: tk.redHover } }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    startIcon={<Login sx={{ fontSize: '15px !important' }} />}
                    onClick={() => navigate('/login')} sx={navBtnSx}
                  >
                    Sign in
                  </Button>
                  <Button
                    variant="contained" onClick={() => navigate('/register')} disableElevation
                    sx={{
                      background: 'linear-gradient(135deg,#3b7ef6,#5b5ef7)',
                      boxShadow: '0 0 0 1px rgba(79,142,247,0.35)',
                      borderRadius: '8px', fontWeight: 700,
                      fontSize: '13px', px: '16px', py: '7px',
                      '&:hover': { background: 'linear-gradient(135deg,#2d72f0,#5256f3)' },
                    }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>

            {/* Mobile hamburger */}
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{
                display: { xs: 'flex', md: 'none' },
                color: tk.text2, ml: '8px',
                border: `1px solid ${tk.border}`,
                borderRadius: '8px', p: '6px',
                '&:hover': { background: 'rgba(255,255,255,0.08)', borderColor: tk.border2 },
              }}
            >
              <MenuIcon sx={{ fontSize: '20px' }} />
            </IconButton>

          </Toolbar>
        </Container>
      </AppBar>

      {/* ── Glassmorphism Drawer ───────────────────────────── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: '285px',
            // ── Core glass ──────────────────────────────────
            background: 'rgba(21, 54, 161, 0.45)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            borderLeft: '1px solid rgba(255,255,255,0.15)',
            boxShadow: [
              'inset 1px 0 0 rgba(255,255,255,0.08)',  // inner left highlight
              '-32px 0 80px rgba(0,0,0,0.35)',          // outer shadow
            ].join(','),
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              // Lighter backdrop so bg image stays visible behind drawer
              background: 'rgba(14, 39, 109, 0.25)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
            },
          },
        }}
      >
        {/* Top blue shimmer */}
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '180px',
          background: 'linear-gradient(180deg, rgba(79,142,247,0.12) 0%, transparent 100%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Bottom purple shimmer */}
        <Box sx={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px',
          background: 'linear-gradient(0deg, rgba(91,94,247,0.10) 0%, transparent 100%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* ── Header ───────────────────────────────────────── */}
        <Box sx={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          px: '20px', py: '18px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          position: 'relative', zIndex: 1,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Box sx={{
              width: '34px', height: '34px', borderRadius: '9px',
              background: 'rgba(46, 100, 194, 0.18)',
              border: '1px solid rgba(79,142,247,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 12px rgba(79,142,247,0.2)',
            }}>
              <School sx={{ color: '#60a5fa', fontSize: '18px' }} />
            </Box>
            <Typography sx={{ fontWeight: 800, color: tk.text1, fontSize: '15px', letterSpacing: '-0.3px' }}>
              RkOP
            </Typography>
          </Box>

          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{
              color: tk.text3,
              width: '32px', height: '32px',
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              transition: 'all 0.15s',
              '&:hover': {
                color: tk.text1,
                background: 'rgba(255,255,255,0.12)',
                borderColor: 'rgba(255,255,255,0.22)',
              },
            }}
          >
            <CloseIcon sx={{ fontSize: '16px' }} />
          </IconButton>
        </Box>

        {/* ── Body ─────────────────────────────────────────── */}
        <Box sx={{ flex: 1, px: '14px', pt: '16px', pb: '12px', position: 'relative', zIndex: 1, overflowY: 'auto' }}>
          {user ? (
            <>
              {/* User card */}
              <Box sx={{
                px: '14px', py: '16px', mb: '14px',
                borderRadius: '14px',
                background: 'rgba(104, 8, 109, 0.98)',
                border: '1px solid rgba(255, 255, 255, 0.51)',
                backdropFilter: 'blur(10px)',
                position: 'relative', overflow: 'hidden',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
              }}>
                {/* Top shimmer line */}
                <Box sx={{
                  position: 'absolute', top: 0, left: '20px', right: '20px', height: '1px',
                  background: `linear-gradient(90deg, transparent, rgba(79,142,247,0.6), transparent)`,
                }} />

                {/* Avatar */}
                <Box sx={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(79,142,247,0.35), rgba(91,94,247,0.35))',
                  border: '1.5px solid rgba(79,142,247,0.45)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mb: '10px',
                  boxShadow: '0 0 16px rgba(79,142,247,0.25)',
                }}>
                  <Typography sx={{ fontSize: '17px', fontWeight: 800, color: '#93c5fd' }}>
                    {(user.name || user.email)?.[0]?.toUpperCase()}
                  </Typography>
                </Box>

                <Typography sx={{ fontSize: '14px', fontWeight: 700, color: tk.text1, mb: '2px' }}>
                  {user.name || 'User'}
                </Typography>
                <Typography sx={{ fontSize: '11px', color: tk.text3, mb: '10px' }}>
                  {user.email}
                </Typography>

                {/* Role pill */}
                <Box sx={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  px: '9px', py: '4px', borderRadius: '6px',
                  background: user.role === 'instructor'
                    ? 'rgba(229, 233, 232, 0.27)'
                    : 'rgba(193, 209, 209, 0.15)',
                  border: `1px solid ${user.role === 'instructor'
                    ? 'rgba(79,142,247,0.35)'
                    : 'rgba(52,211,153,0.35)'}`,
                }}>
                  <Box sx={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: user.role === 'instructor' ? tk.blue : tk.green,
                    boxShadow: `0 0 6px ${user.role === 'instructor' ? tk.blue : tk.green}`,
                  }} />
                  <Typography sx={{
                    fontSize: '10px', fontWeight: 700,
                    color: user.role === 'instructor' ? tk.blue : tk.green,
                    textTransform: 'capitalize', letterSpacing: '0.06em',
                  }}>
                    {user.role}
                  </Typography>
                </Box>
              </Box>

              {/* Dashboard */}
              <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={handleDashboard}
                    sx={{
                      borderRadius: '11px', py: '11px', px: '14px',
                      background: 'rgba(38, 101, 209, 0.47)',
                      border: '1px solid rgba(79,142,247,0.20)',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.15s',
                      '&:hover': {
                        background: 'rgba(79,142,247,0.20)',
                        borderColor: 'rgba(79,142,247,0.40)',
                        boxShadow: '0 0 20px rgba(79,142,247,0.15)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: '36px' }}>
                      <DashboardIcon sx={{ fontSize: '18px', color: tk.blue }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Dashboard"
                      primaryTypographyProps={{ fontSize: '14px', fontWeight: 600, color: tk.text1 }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', my: '12px' }} />

              {/* Logout */}
              <List disablePadding>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={handleLogout}
                    sx={{
                      borderRadius: '11px', py: '11px', px: '14px',
                      background: 'rgba(235, 16, 16, 0.69)',
                      border: '1px solid rgba(248,113,113,0.15)',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.15s',
                      '&:hover': {
                        background: 'rgba(248,113,113,0.15)',
                        borderColor: 'rgba(248,113,113,0.32)',
                        boxShadow: '0 0 20px rgba(248,113,113,0.12)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: '36px' }}>
                      <Logout sx={{ fontSize: '18px', color: tk.red }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Logout"
                      primaryTypographyProps={{ fontSize: '14px', fontWeight: 600, color: tk.red }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </>
          ) : (
            /* Guest */
            <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => { navigate('/login'); setDrawerOpen(false); }}
                  sx={{
                    borderRadius: '11px', py: '12px', px: '14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.15s',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.10)',
                      borderColor: 'rgba(255,255,255,0.20)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <Login sx={{ fontSize: '18px', color: tk.text2 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Sign in"
                    primaryTypographyProps={{ fontSize: '14px', fontWeight: 600, color: tk.text1 }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => { navigate('/register'); setDrawerOpen(false); }}
                  sx={{
                    borderRadius: '11px', py: '12px', px: '14px',
                    background: 'linear-gradient(135deg, rgba(59,126,246,0.22), rgba(91,94,247,0.22))',
                    border: '1px solid rgba(79,142,247,0.32)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                    transition: 'all 0.15s',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(59,126,246,0.35), rgba(91,94,247,0.35))',
                      borderColor: 'rgba(79,142,247,0.55)',
                      boxShadow: '0 0 24px rgba(79,142,247,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: '36px' }}>
                    <AccountCircle sx={{ fontSize: '18px', color: tk.blue }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Register"
                    primaryTypographyProps={{ fontSize: '14px', fontWeight: 700, color: tk.blue }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          )}
        </Box>

        {/* ── Footer ───────────────────────────────────────── */}
        <Box sx={{
          px: '20px', py: '16px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          position: 'relative', zIndex: 1,
        }}>
          <Typography sx={{ fontSize: '11px', color: tk.text3, textAlign: 'center', letterSpacing: '0.04em' }}>
            © 2026 Rk Online Platform
          </Typography>
        </Box>

      </Drawer>

      {/* ── Page content ──────────────────────────────────── */}
      <Box component="main" sx={{ position: 'relative', zIndex: 1, minHeight: 'calc(100vh - 56px)' }}>
        <Outlet />
      </Box>

    </ThemeProvider>
  );
}