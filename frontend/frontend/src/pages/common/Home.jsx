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
import Lenis from 'lenis';
import creatorPhoto from '../../assets/rushi.jpeg';

gsap.registerPlugin(ScrollTrigger);

/* ── Design tokens ────────────────────────────────────────────
   One accent family (mint) drives all interactive/primary
   moments. Blue and violet are kept ONLY as desaturated tonal
   siblings to differentiate the three feature cards from each
   other — they never appear on buttons, links, or focus states.
──────────────────────────────────────────────────────────────── */
const tokens = {
  bg: '#07101d',
  surface: 'rgba(16,26,42,0.6)',
  surfaceElevated: 'rgba(20,32,50,0.75)',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',
  textPrimary: 'rgba(245,247,250,0.92)',
  textSecondary: 'rgba(245,247,250,0.62)',
  textMuted: 'rgba(245,247,250,0.4)',
  accent: '#5EEAD4',
  accentHover: '#7FF3E0',
  accentSoft: 'rgba(94,234,212,0.12)',
  accentGlow: 'rgba(94,234,212,0.18)',
};

const FEATURES = [
  {
    icon: MenuBook,
    title: 'Mastery Paths',
    desc: 'Curated curriculum designed to take you from foundational basics to expert-level industry mastery.',
    accent: '#5EEAD4',
    glow: 'rgba(94,234,212,0.10)',
    delay: 0,
  },
  {
    icon: ElectricBolt,
    title: 'Adaptive Quizzes',
    desc: 'Dynamic assessment engines that evolve with your progress, ensuring 100% conceptual retention.',
    accent: '#7DD3E8',
    glow: 'rgba(125,211,232,0.10)',
    delay: 0.15,
  },
  {
    icon: Security,
    title: 'Ironclad Security',
    desc: 'End-to-end encryption for your intellectual property, research, and personal progress data.',
    accent: '#A5B4E0',
    glow: 'rgba(165,180,224,0.10)',
    delay: 0.3,
  },
];

/* ── Reduced motion helper ───────────────────────────────────── */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Lenis smooth scroll (lightweight, single instance) ──────── */
const useLenis = () => {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);
};

/* ── Subtle magnetic hover for buttons ───────────────────────── */
const useMagnetic = (strength = 14) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return undefined;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, {
        x: (x / rect.width) * strength,
        y: (y / rect.height) * strength,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);

    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [strength]);

  return ref;
};

/* ── Floating, mouse-reactive background blobs ───────────────── */
const FloatingBackground = () => {
  const wrapRef = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);
  const blob3Ref = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const blobs = [blob1Ref.current, blob2Ref.current, blob3Ref.current];

    // slow ambient drift, independent of mouse
    const driftTweens = blobs.map((el, i) =>
      gsap.to(el, {
        x: `+=${20 + i * 8}`,
        y: `+=${15 + i * 6}`,
        duration: 8 + i * 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    );

    // gentle parallax toward cursor, max ~8px
    const handleMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const nx = e.clientX / innerWidth - 0.5;
      const ny = e.clientY / innerHeight - 0.5;

      blobs.forEach((el, i) => {
        const depth = (i + 1) * 2.6; // max ~8px on outer blob
        gsap.to(el, {
          x: nx * depth,
          y: ny * depth,
          duration: 1,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
    };

    window.addEventListener('mousemove', handleMove);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      driftTweens.forEach((t) => t.kill());
    };
  }, []);

  return (
    <Box
      ref={wrapRef}
      aria-hidden="true"
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <Box
        ref={blob1Ref}
        sx={{
          position: 'absolute', top: '8%', left: '12%',
          width: { xs: 200, md: 360 }, height: { xs: 200, md: 360 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${tokens.accentGlow} 0%, transparent 70%)`,
          filter: 'blur(40px)',
          willChange: 'transform',
        }}
      />
      <Box
        ref={blob2Ref}
        sx={{
          position: 'absolute', top: '35%', right: '8%',
          width: { xs: 180, md: 320 }, height: { xs: 180, md: 320 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(125,211,232,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
          willChange: 'transform',
        }}
      />
      <Box
        ref={blob3Ref}
        sx={{
          position: 'absolute', bottom: '5%', left: '40%',
          width: { xs: 160, md: 280 }, height: { xs: 160, md: 280 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(165,180,224,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
          willChange: 'transform',
        }}
      />
    </Box>
  );
};

/* ── Soft cursor glow, desktop-only ──────────────────────────── */
const CursorGlow = () => {
  const glowRef = useRef(null);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch || prefersReducedMotion()) return undefined;

    const el = glowRef.current;
    const handleMove = (e) => {
      gsap.to(el, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.6,
        ease: 'power3.out',
      });
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <Box
      ref={glowRef}
      aria-hidden="true"
      sx={{
        position: 'fixed', top: 0, left: 0,
        width: 420, height: 420,
        marginLeft: '-210px', marginTop: '-210px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${tokens.accentGlow} 0%, rgba(125,211,232,0.03) 45%, transparent 70%)`,
        pointerEvents: 'none',
        zIndex: 0,
        willChange: 'transform',
      }}
    />
  );
};

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
    const reduced = prefersReducedMotion();

    // ── Entry animation on scroll ─────────────────────────
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        once: true,
      },
    });

    if (reduced) {
      tl.set([card, icon, line, title, desc], { opacity: 1, y: 0, scale: 1, rotation: 0, scaleX: 1 });
    } else {
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
    }

    if (reduced) {
      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    }

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
        borderRadius: '20px',
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
          borderRadius: '28px',
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
          background: tokens.surface,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${tokens.border}`,
          borderRadius: '20px',
          padding: { xs: '28px', sm: '36px', md: '40px' },
          height: '100%',
          overflow: 'hidden',
          boxShadow: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 20px 40px -24px rgba(0,0,0,0.5)',
          transition: 'border-color 0.3s ease',
          '&:hover': {
            borderColor: tokens.borderStrong,
          },
          // Top shimmer line
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: '10%', right: '10%', height: '1px',
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            opacity: 0.5,
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
            width: { xs: 50, md: 58 },
            height: { xs: 50, md: 58 },
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${accent}2A`,
            flexShrink: 0,
            willChange: 'transform',
          }}
        >
          <Icon sx={{ fontSize: { xs: 24, md: 28 }, color: accent }} />
        </Box>

        {/* Accent line */}
        <Box
          ref={lineRef}
          sx={{
            width: '32px', height: '2px',
            borderRadius: '2px',
            background: `linear-gradient(90deg, ${accent}, transparent)`,
            mb: '18px',
            transformOrigin: 'left',
          }}
        />

        {/* Title */}
        <Typography
          ref={titleRef}
          variant="h4"
          sx={{
            color: tokens.textPrimary, fontWeight: 650, mb: 1.5,
            fontSize: { xs: '1.15rem', md: '1.3rem' },
            letterSpacing: '-0.015em',
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
              color: tokens.textSecondary,
              lineHeight: 1.7,
              fontSize: { xs: '0.875rem', md: '0.925rem' },
              maxWidth: '38ch',
            }}
          >
            {desc}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

/* ── Meet the Creator section ────────────────────────────────── */
const CREATOR_NAME = 'Rushikesh Harad';
const CREATOR_DESC =
  'Passionate Full Stack Developer focused on building scalable web applications, modern user experiences, and industry-level software solutions.';
// Update this import path above if your file structure differs
const CREATOR_IMAGE_SRC = creatorPhoto;

const MeetTheCreator = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const groupRef = useRef(null);
  const imgWrapRef = useRef(null);
  const ringRef = useRef(null);
  const nameRef = useRef(null);
  const descRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const group = groupRef.current;
    const imgWrap = imgWrapRef.current;
    const ring = ringRef.current;
    const name = nameRef.current;
    const desc = descRef.current;
    const reduced = prefersReducedMotion();

    let floatTween;
    let pulseTween;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 85%', once: true },
    });

    if (reduced) {
      tl.set([heading, imgWrap, ring, name, desc], { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', rotation: 0 });
    } else {
      // 1. heading chars, already split into spans in render
      tl.fromTo(
        heading.querySelectorAll('span'),
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.02, ease: 'power2.out' }
      )
        // 2. image entrance
        .fromTo(
          imgWrap,
          { opacity: 0, scale: 0.6, rotation: 8, filter: 'blur(15px)' },
          { opacity: 1, scale: 1, rotation: 0, filter: 'blur(0px)', duration: 1, ease: 'power4.out' },
          '-=0.1'
        )
        // ring draws in
        .fromTo(
          ring,
          { opacity: 0, rotation: -90, scale: 0.85 },
          { opacity: 1, rotation: 0, scale: 1, duration: 0.9, ease: 'power3.out' },
          '-=0.7'
        )
        // 3. name mask reveal
        .fromTo(
          name.querySelectorAll('span'),
          { opacity: 0, y: 24, rotateX: 40 },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.5, stagger: 0.03, ease: 'power3.out' },
          '-=0.3'
        )
        // 4. description fade up
        .fromTo(desc, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2');

      // continuous gentle float — moves ring + photo together
      floatTween = gsap.to(group, {
        y: 6,
        duration: 4.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // soft periodic ring pulse
      pulseTween = gsap.to(ring, {
        scale: 1.04,
        opacity: 0.85,
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        repeatDelay: 2.2,
        ease: 'sine.inOut',
      });

      // mouse-reactive tilt, capped — moves ring + photo together
      const handleMove = (e) => {
        const rect = group.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);

        gsap.to(group, {
          rotateY: dx * 6,
          rotateX: -dy * 6,
          x: dx * 5,
          duration: 0.5,
          ease: 'power2.out',
          transformPerspective: 700,
        });
      };

      const handleLeave = () => {
        gsap.to(group, { rotateY: 0, rotateX: 0, x: 0, duration: 0.6, ease: 'elastic.out(1, 0.6)' });
      };

      const handleEnter = () => {
        gsap.to(group, { scale: 1.05, duration: 0.4, ease: 'power2.out' });
        gsap.to(ring, { opacity: 1, filter: 'brightness(1.3)', duration: 0.4 });
      };

      const handleHoverLeave = () => {
        gsap.to(group, { scale: 1, duration: 0.5, ease: 'power2.out' });
        gsap.to(ring, { filter: 'brightness(1)', duration: 0.5 });
      };

      section.addEventListener('mousemove', handleMove);
      group.addEventListener('mouseenter', handleEnter);
      group.addEventListener('mouseleave', () => {
        handleLeave();
        handleHoverLeave();
      });

      return () => {
        floatTween?.kill();
        pulseTween?.kill();
        section.removeEventListener('mousemove', handleMove);
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    }

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <Box
      ref={sectionRef}
      sx={{
        position: 'relative',
        textAlign: 'center',
        mt: { xs: 8, sm: 10, md: 14 },
        mb: { xs: 6, sm: 8, md: 10 },
        py: { xs: 4, md: 6 },
      }}
    >
      {/* decorative background */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: `radial-gradient(circle at 50% 35%, ${tokens.accentGlow} 0%, transparent 60%)`,
          filter: 'blur(30px)',
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* heading */}
        <Typography
          ref={headingRef}
          variant="overline"
          sx={{
            display: 'block',
            color: tokens.accent,
            letterSpacing: '0.3em',
            fontWeight: 650,
            fontSize: { xs: '10px', sm: '12px' },
            mb: { xs: 4, md: 5 },
          }}
        >
          {'MEET THE CREATOR'.split('').map((ch, i) => (
            <span key={i} style={{ display: 'inline-block' }}>
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ))}
        </Typography>

        {/* image + ring + glow */}
        <Box
          sx={{
            position: 'relative',
            width: { xs: 140, sm: 170, md: 200 },
            height: { xs: 140, sm: 170, md: 200 },
            mx: 'auto',
            mb: { xs: 4, md: 5 },
          }}
        >
          {/* glow behind image */}
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute', inset: '-30px',
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(94,234,212,0.14) 0%, transparent 70%)`,
              filter: 'blur(20px)',
              zIndex: 0,
            }}
          />

          {/* slow orbit dots */}
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute', inset: '-18px',
              borderRadius: '50%',
              border: '1px dashed rgba(94,234,212,0.14)',
              zIndex: 0,
              animation: prefersReducedMotion() ? 'none' : 'rk-orbit-spin 40s linear infinite',
              '@keyframes rk-orbit-spin': {
                from: { transform: 'rotate(0deg)' },
                to: { transform: 'rotate(360deg)' },
              },
            }}
          />

          {/* shared transform group: ring + photo move together */}
          <Box
            ref={groupRef}
            sx={{
              position: 'absolute',
              inset: 0,
              transformStyle: 'preserve-3d',
              willChange: 'transform',
            }}
          >
            {/* animated gradient ring */}
            <Box
              ref={ringRef}
              aria-hidden="true"
              sx={{
                position: 'absolute', inset: '-8px',
                borderRadius: '50%',
                padding: '2px',
                background: `conic-gradient(from 0deg, ${tokens.accent}, #7DD3E8, #A5B4E0, ${tokens.accent})`,
                WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                zIndex: 1,
              }}
            />

            {/* circular image */}
            <Box
              ref={imgWrapRef}
              sx={{
                position: 'relative',
                zIndex: 2,
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
                background: tokens.surface,
              }}
            >
              <Box
                component="img"
                src={CREATOR_IMAGE_SRC}
                alt={CREATOR_NAME}
                loading="lazy"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* name */}
        <Typography
          ref={nameRef}
          variant="h3"
          sx={{
            color: tokens.textPrimary,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            fontSize: { xs: '1.5rem', sm: '1.9rem', md: '2.2rem' },
            mb: 1.5,
            perspective: '600px',
          }}
        >
          {CREATOR_NAME.split('').map((ch, i) => (
            <span key={i} style={{ display: 'inline-block' }}>
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ))}
        </Typography>

        {/* description */}
        <Typography
          ref={descRef}
          variant="body1"
          sx={{
            color: tokens.textSecondary,
            maxWidth: '520px',
            mx: 'auto',
            lineHeight: 1.75,
            fontSize: { xs: '0.9rem', md: '0.975rem' },
            px: { xs: 2, sm: 0 },
          }}
        >
          {CREATOR_DESC}
        </Typography>
      </Box>
    </Box>
  );
};

/* ── Skills marquee ───────────────────────────────────────────── */
const SKILLS = [
  'React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS',
  'Material UI', 'Node.js', 'Express.js', 'MongoDB', 'REST API', 'JWT',
  'Git', 'GitHub', 'Docker', 'Redis', 'GSAP',
];

const SkillsMarquee = () => {
  const trackRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || prefersReducedMotion()) return undefined;

    // track contains the list twice back-to-back; loop exactly -50%
    const isMobile = window.innerWidth < 600;
    const tween = gsap.to(track, {
      xPercent: -50,
      duration: isMobile ? 38 : 28,
      ease: 'none',
      repeat: -1,
    });

    const wrap = wrapRef.current;
    const handleEnter = () => gsap.to(tween, { timeScale: 0, duration: 0.4, overwrite: true });
    const handleLeave = () => gsap.to(tween, { timeScale: 1, duration: 0.6, overwrite: true });

    wrap?.addEventListener('mouseenter', handleEnter);
    wrap?.addEventListener('mouseleave', handleLeave);

    return () => {
      tween.kill();
      wrap?.removeEventListener('mouseenter', handleEnter);
      wrap?.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  const renderItems = (keyPrefix) =>
    SKILLS.map((skill) => (
      <Box
        key={`${keyPrefix}-${skill}`}
        component="span"
        sx={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
      >
        <Typography
          component="span"
          sx={{
            color: tokens.textMuted,
            fontWeight: 550,
            fontSize: { xs: '0.95rem', md: '1.05rem' },
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
            transition: 'color 0.3s ease',
            '&:hover': { color: tokens.accent },
          }}
        >
          {skill}
        </Typography>
        <Box
          component="span"
          aria-hidden="true"
          sx={{
            width: 5, height: 5, borderRadius: '50%',
            mx: { xs: 2.5, md: 4 },
            background: tokens.accent,
            boxShadow: `0 0 6px ${tokens.accentGlow}`,
            flexShrink: 0,
          }}
        />
      </Box>
    ));

  return (
    <Box
      ref={wrapRef}
      sx={{
        mt: { xs: 8, sm: 10, md: 14 },
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        py: { xs: 2, md: 3 },
        maskImage: 'linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)',
      }}
    >
      <Box
        ref={trackRef}
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: 'max-content',
          willChange: 'transform',
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          '@media (prefers-reduced-motion: reduce)': {
            width: '100%',
            flexWrap: 'wrap',
            justifyContent: 'center',
          },
        }}
      >
        {renderItems('a')}
        <Box
          aria-hidden="true"
          sx={{
            display: 'inline-flex',
            '@media (prefers-reduced-motion: reduce)': { display: 'none' },
          }}
        >
          {renderItems('b')}
        </Box>
      </Box>
    </Box>
  );
};

/* ── Premium magnetic button wrapper ─────────────────────────── */
const MagneticButton = React.forwardRef(({ children, ...props }, _forwardedRef) => {
  const magRef = useMagnetic(10);
  return (
    <Button ref={magRef} {...props}>
      {children}
    </Button>
  );
});
MagneticButton.displayName = 'MagneticButton';

/* ── Page ────────────────────────────────────────────────────── */
function Home() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const heroRef  = useRef(null);
  const tagRef   = useRef(null);
  const titleRef = useRef(null);
  const subRef   = useRef(null);
  const btnRef   = useRef(null);

  useLenis();

  // ── Hero entrance animation ─────────────────────────────────
  useEffect(() => {
    if (prefersReducedMotion()) {
      gsap.set([tagRef.current, titleRef.current, subRef.current, btnRef.current], {
        opacity: 1, y: 0,
      });
      return;
    }

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
      background: `radial-gradient(120% 80% at 50% -10%, #0c1a2c 0%, ${tokens.bg} 55%)`,
      position: 'relative', overflow: 'hidden',
      '&::before': {
        content: '""', position: 'absolute',
        top: '-10%', left: { xs: '-10%', md: '20%' },
        width: { xs: '300px', md: '600px' },
        height: { xs: '300px', md: '600px' },
        background: `radial-gradient(circle, ${tokens.accentGlow} 0%, transparent 70%)`,
        zIndex: 0,
      },
    }}>
      <CursorGlow />
      <FloatingBackground />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>

        {/* ── Hero ─────────────────────────────────────────── */}
        <Box ref={heroRef} sx={{ textAlign: 'center', mb: { xs: 8, sm: 10, md: 16 } }}>

          <Typography
            ref={tagRef}
            variant="overline"
            sx={{
              color: tokens.accent, letterSpacing: '0.18em',
              fontWeight: 650, opacity: 0.9,
              fontSize: { xs: '10px', sm: '12px' },
            }}
          >
            Next-Gen Learning
          </Typography>

          <Typography
            ref={titleRef}
            variant="h1"
            sx={{
              fontSize: { xs: '2rem', sm: '2.6rem', md: '3.4rem', lg: '4rem' },
              fontWeight: 700, color: tokens.textPrimary,
              mb: 3, letterSpacing: '-0.035em',
              lineHeight: { xs: 1.15, md: 1.08 },
            }}
          >
            Rk.learning.<Box component="span" sx={{ color: tokens.accent }}>platform</Box>
          </Typography>

          <Typography
            ref={subRef}
            variant="h5"
            sx={{
              color: tokens.textSecondary,
              maxWidth: '640px', mx: 'auto',
              lineHeight: 1.65, mb: 6,
              fontWeight: 400,
              fontSize: { xs: '1rem', sm: '1.05rem', md: '1.15rem' },
              px: { xs: 2, sm: 0 },
            }}
          >
            The definitive platform made by Rushikesh Harad. Master complex concepts with
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
              <MagneticButton
                variant="contained" size="large"
                onClick={() => navigate(user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard')}
                sx={{
                  borderRadius: 3, px: { xs: 4, sm: 6 }, py: 1.75,
                  textTransform: 'none',
                  fontSize: { xs: '0.95rem', sm: '1.02rem' },
                  fontWeight: 600,
                  background: tokens.accent, color: '#04120f',
                  boxShadow: `0 8px 20px -6px ${tokens.accentGlow}`,
                  width: { xs: '100%', sm: 'auto' },
                  transition: 'box-shadow 0.3s ease, background 0.3s ease, transform 0.2s ease',
                  '&:hover': {
                    background: tokens.accentHover,
                    boxShadow: `0 12px 28px -6px rgba(94,234,212,0.32)`,
                  },
                }}
              >
                Access Dashboard
              </MagneticButton>
            ) : (
              <>
                <MagneticButton
                  variant="contained" size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderRadius: 3, px: { xs: 4, sm: 5 }, py: 1.75,
                    background: tokens.accent, color: '#04120f', fontWeight: 600,
                    fontSize: { xs: '0.95rem', sm: '1.02rem' },
                    textTransform: 'none',
                    width: { xs: '100%', sm: 'auto' },
                    boxShadow: `0 8px 20px -6px ${tokens.accentGlow}`,
                    transition: 'box-shadow 0.3s ease, background 0.3s ease',
                    '&:hover': {
                      background: tokens.accentHover,
                      boxShadow: `0 12px 28px -6px rgba(94,234,212,0.32)`,
                    },
                  }}
                >
                  Get Started
                </MagneticButton>
                <MagneticButton
                  variant="outlined" size="large"
                  onClick={() => navigate('/register')}
                  endIcon={<ArrowForward />}
                  sx={{
                    borderRadius: 3, px: { xs: 4, sm: 5 }, py: 1.75,
                    color: tokens.textPrimary, borderColor: tokens.border,
                    fontSize: { xs: '0.95rem', sm: '1.02rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    width: { xs: '100%', sm: 'auto' },
                    transition: 'border-color 0.3s ease, background 0.3s ease',
                    '&:hover': {
                      borderColor: tokens.borderStrong,
                      background: 'rgba(255,255,255,0.03)',
                    },
                  }}
                >
                  Explore Programs
                </MagneticButton>
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

        {/* ── Meet the Creator ───────────────────────────────── */}
        <MeetTheCreator />

        {/* ── Skills marquee ─────────────────────────────────── */}
        <SkillsMarquee />

      </Container>
    </Box>
  );
}

export default Home;