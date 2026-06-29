// src/pages/common/Home.jsx
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container, Typography, Button, Stack,
  Card, Box, Grid,
} from '@mui/material';
import { MenuBook, ElectricBolt, Security, ArrowForward } from '@mui/icons-material';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: MenuBook,
    title: 'Mastery Paths',
    desc: 'Curated curriculum designed to take you from foundational basics to expert-level industry mastery.',
    accent: '#64ffda',
    glow: 'rgba(100,255,218,0.15)',
    delay: 0,
  },
  {
    icon: ElectricBolt,
    title: 'Adaptive Quizzes',
    desc: 'Dynamic assessment engines that evolve with your progress, ensuring 100% conceptual retention.',
    accent: '#4f8ef7',
    glow: 'rgba(79,142,247,0.15)',
    delay: 0.15,
  },
  {
    icon: Security,
    title: 'Ironclad Security',
    desc: 'End-to-end encryption for your intellectual property, research, and personal progress data.',
    accent: '#a78bfa',
    glow: 'rgba(167,139,250,0.15)',
    delay: 0.3,
  },
];

/* ── Animated Feature Card ───────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, desc, accent, glow, delay, index }) => {
  const cardRef    = useRef(null);
  const iconRef    = useRef(null);
  const titleRef   = useRef(null);
  const descRef    = useRef(null);
  const glowRef    = useRef(null);
  const lineRef    = useRef(null);

  useEffect(() => {
    const card  = cardRef.current;
    const icon  = iconRef.current;
    const title = titleRef.current;
    const desc  = descRef.current;
    const glow  = glowRef.current;
    const line  = lineRef.current;

    // ── Entry animation on scroll ─────────────────────────
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        once: true,
      },
    });

    tl.fromTo(card,
      { y: 60, opacity: 0, scale: 0.94 },
      { y: 0,  opacity: 1, scale: 1, duration: 0.7, delay, ease: 'power3.out' }
    )
    .fromTo(icon,
      { scale: 0.6, opacity: 0, rotation: -15 },
      { scale: 1,   opacity: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.7)' },
      '-=0.3'
    )
    .fromTo(line,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.5, ease: 'power2.out', transformOrigin: 'left' },
      '-=0.2'
    )
    .fromTo(title,
      { y: 16, opacity: 0 },
      { y: 0,  opacity: 1, duration: 0.4, ease: 'power2.out' },
      '-=0.3'
    )
    .fromTo(desc,
      { y: 12, opacity: 0 },
      { y: 0,  opacity: 1, duration: 0.4, ease: 'power2.out' },
      '-=0.2'
    );

    // ── Hover: magnetic tilt ──────────────────────────────
    const handleMove = (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);

      gsap.to(card, {
        rotateY:  dx * 8,
        rotateX: -dy * 8,
        scale: 1.03,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 800,
      });

      gsap.to(glow, {
        opacity: 1,
        x: dx * 20,
        y: dy * 20,
        duration: 0.4,
        ease: 'power2.out',
      });

      gsap.to(icon, {
        x: dx * 6,
        y: dy * 6,
        duration: 0.4,
        ease: 'power2.out',
      });
    };

    const handleLeave = () => {
      gsap.to(card, {
        rotateY: 0, rotateX: 0, scale: 1,
        duration: 0.5, ease: 'elastic.out(1, 0.6)',
      });
      gsap.to(glow, {
        opacity: 0, x: 0, y: 0,
        duration: 0.4, ease: 'power2.out',
      });
      gsap.to(icon, {
        x: 0, y: 0,
        duration: 0.5, ease: 'elastic.out(1, 0.6)',
      });
    };

    // ── Icon pulse on hover ───────────────────────────────
    const handleEnter = () => {
      gsap.to(icon, {
        scale: 1.15,
        duration: 0.3,
        ease: 'back.out(2)',
      });
    };

    const handleIconLeave = () => {
      gsap.to(icon, {
        scale: 1,
        duration: 0.4,
        ease: 'elastic.out(1, 0.5)',
      });
    };

    card.addEventListener('mousemove',  handleMove);
    card.addEventListener('mouseleave', handleLeave);
    card.addEventListener('mouseenter', handleEnter);
    card.addEventListener('mouseleave', handleIconLeave);

    return () => {
      card.removeEventListener('mousemove',  handleMove);
      card.removeEventListener('mouseleave', handleLeave);
      card.removeEventListener('mouseenter', handleEnter);
      card.removeEventListener('mouseleave', handleIconLeave);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [delay]);

  return (
    <Box
      ref={cardRef}
      sx={{
        position: 'relative',
        borderRadius: '24px',
        height: '100%',
        cursor: 'default',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        opacity: 0, // starts hidden, GSAP reveals
      }}
    >
      {/* ── Glow blob ──────────────────────────────────── */}
      <Box
        ref={glowRef}
        sx={{
          position: 'absolute',
          inset: '-20px',
          borderRadius: '32px',
          background: `radial-gradient(circle at center, ${glow} 0%, transparent 70%)`,
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(12px)',
        }}
      />

      {/* ── Card body ──────────────────────────────────── */}
      <Card
        elevation={0}
        sx={{
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column',
          background: 'rgba(16,28,45,0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: `1px solid rgba(255,255,255,0.08)`,
          borderRadius: '24px',
          padding: { xs: '28px', sm: '36px', md: '40px' },
          height: '100%',
          overflow: 'hidden',
          // Top shimmer line
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: '10%', right: '10%', height: '1px',
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            opacity: 0.6,
          },
          // Corner glow
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-40px', right: '-40px',
            width: '120px', height: '120px',
            borderRadius: '50%',
            background: glow,
            pointerEvents: 'none',
          },
        }}
      >
        {/* Icon box */}
        <Box
          ref={iconRef}
          sx={{
            mb: { xs: 3, md: 4 },
            width: { xs: 54, md: 64 },
            height: { xs: 54, md: 64 },
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '16px',
            background: `rgba(255,255,255,0.05)`,
            border: `1px solid ${accent}30`,
            flexShrink: 0,
            willChange: 'transform',
          }}
        >
          <Icon sx={{ fontSize: { xs: 26, md: 32 }, color: accent }} />
        </Box>

        {/* Accent line */}
        <Box
          ref={lineRef}
          sx={{
            width: '40px', height: '3px',
            borderRadius: '2px',
            background: `linear-gradient(90deg, ${accent}, transparent)`,
            mb: '16px',
            transformOrigin: 'left',
          }}
        />

        {/* Title */}
        <Typography
          ref={titleRef}
          variant="h4"
          sx={{
            color: '#fff', fontWeight: 700, mb: 2,
            fontSize: { xs: '1.2rem', md: '1.45rem' },
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </Typography>

        {/* Desc */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            ref={descRef}
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.8,
              fontSize: { xs: '0.875rem', md: '0.95rem' },
            }}
          >
            {desc}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

/* ── Page ────────────────────────────────────────────────────── */
function Home() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const heroRef  = useRef(null);
  const tagRef   = useRef(null);
  const titleRef = useRef(null);
  const subRef   = useRef(null);
  const btnRef   = useRef(null);

  // ── Hero entrance animation ─────────────────────────────────
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(tagRef.current,
      { y: 20, opacity: 0 },
      { y: 0,  opacity: 1, duration: 0.6 }
    )
    .fromTo(titleRef.current,
      { y: 40, opacity: 0 },
      { y: 0,  opacity: 1, duration: 0.7 },
      '-=0.3'
    )
    .fromTo(subRef.current,
      { y: 24, opacity: 0 },
      { y: 0,  opacity: 1, duration: 0.6 },
      '-=0.4'
    )
    .fromTo(btnRef.current,
      { y: 16, opacity: 0 },
      { y: 0,  opacity: 1, duration: 0.5 },
      '-=0.3'
    );
  }, []);

  return (
    <Box sx={{
      width: '100%', minHeight: '100vh',
      py: { xs: 8, sm: 10, md: 15 },
      background: '#050b16',
      position: 'relative', overflow: 'hidden',
      '&::before': {
        content: '""', position: 'absolute',
        top: '-10%', left: { xs: '-10%', md: '20%' },
        width: { xs: '300px', md: '600px' },
        height: { xs: '300px', md: '600px' },
        background: 'radial-gradient(circle, rgba(100,255,218,0.06) 0%, transparent 70%)',
        zIndex: 0,
      },
    }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>

        {/* ── Hero ─────────────────────────────────────────── */}
        <Box ref={heroRef} sx={{ textAlign: 'center', mb: { xs: 8, sm: 10, md: 16 } }}>

          <Typography
            ref={tagRef}
            variant="overline"
            sx={{
              color: '#64ffda', letterSpacing: '0.2em',
              fontWeight: 700, opacity: 0.8,
              fontSize: { xs: '10px', sm: '12px' },
            }}
          >
            Next-Gen Learning
          </Typography>

          <Typography
            ref={titleRef}
            variant="h1"
            sx={{
              fontSize: { xs: '1.7rem', sm: '2.4rem', md: '3.2rem', lg: '4.2rem' },
              fontWeight: 800, color: '#fff',
              mb: 3, letterSpacing: '-0.04em',
              lineHeight: { xs: 1.15, md: 1.1 },
            }}
          >
            Rk.learning.<span style={{ color: '#64ffda' }}>platform</span>
          </Typography>

          <Typography
            ref={subRef}
            variant="h5"
            sx={{
              color: 'rgba(255,255,255,0.6)',
              maxWidth: '700px', mx: 'auto',
              lineHeight: 1.6, mb: 6,
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
              px: { xs: 2, sm: 0 },
            }}
          >
            The definitive platform made by Rushikesh harad. Master complex concepts with
            structured paths, real-time analytics, and enterprise-grade security.
          </Typography>

          <Stack
            ref={btnRef}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 3 }}
            justifyContent="center"
            alignItems="center"
          >
            {user ? (
              <Button
                variant="contained" size="large"
                onClick={() => navigate(user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard')}
                sx={{
                  borderRadius: 4, px: { xs: 4, sm: 6 }, py: 2,
                  textTransform: 'none',
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  background: '#64ffda', color: '#050b16', fontWeight: 700,
                  boxShadow: '0 10px 25px rgba(100,255,218,0.2)',
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': { background: '#4eedc4' },
                }}
              >
                Access Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="contained" size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderRadius: 4, px: { xs: 4, sm: 5 }, py: 2,
                    background: '#64ffda', color: '#050b16', fontWeight: 700,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': { background: '#4eedc4' },
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined" size="large"
                  onClick={() => navigate('/register')}
                  endIcon={<ArrowForward />}
                  sx={{
                    borderRadius: 4, px: { xs: 4, sm: 5 }, py: 2,
                    color: '#fff', borderColor: 'rgba(255,255,255,0.2)',
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.45)',
                      background: 'rgba(255,255,255,0.05)',
                    },
                  }}
                >
                  Explore Programs
                </Button>
              </>
            )}
          </Stack>
        </Box>

        {/* ── Feature cards ─────────────────────────────────── */}
        <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">
          {FEATURES.map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx} sx={{ display: 'flex' }}>
              <FeatureCard {...item} index={idx} />
            </Grid>
          ))}
        </Grid>

      </Container>
    </Box>
  );
}

export default Home;