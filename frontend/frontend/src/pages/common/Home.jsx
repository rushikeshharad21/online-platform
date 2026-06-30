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
          background: 'radial-gradient(circle, rgba(100,255,218,0.08) 0%, transparent 70%)',
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
          background: 'radial-gradient(circle, rgba(79,142,247,0.07) 0%, transparent 70%)',
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
          background: 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)',
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
        background: 'radial-gradient(circle, rgba(100,255,218,0.05) 0%, rgba(167,139,250,0.04) 45%, transparent 70%)',
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

/* ── Meet the Creator section ────────────────────────────────── */
const CREATOR_NAME = 'Rushikesh Harad';
const CREATOR_DESC =
  'Passionate Full Stack Developer focused on building scalable web applications, modern user experiences, and industry-level software solutions.';
// TODO: replace with the real asset path once the image is uploaded
const CREATOR_IMAGE_SRC = '../../assets/rushi.jpeg';

const MeetTheCreator = () => {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const imgWrapRef = useRef(null);
  const ringRef = useRef(null);
  const nameRef = useRef(null);
  const descRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
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

      // continuous gentle float
      floatTween = gsap.to(imgWrap, {
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

      // mouse-reactive tilt, capped
      const handleMove = (e) => {
        const rect = imgWrap.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);

        gsap.to(imgWrap, {
          rotateY: dx * 6,
          rotateX: -dy * 6,
          x: dx * 5,
          duration: 0.5,
          ease: 'power2.out',
          transformPerspective: 700,
        });
      };

      const handleLeave = () => {
        gsap.to(imgWrap, { rotateY: 0, rotateX: 0, x: 0, duration: 0.6, ease: 'elastic.out(1, 0.6)' });
      };

      const handleEnter = () => {
        gsap.to(imgWrap, { scale: 1.05, duration: 0.4, ease: 'power2.out' });
        gsap.to(ring, { opacity: 1, filter: 'brightness(1.3)', duration: 0.4 });
      };

      const handleHoverLeave = () => {
        gsap.to(imgWrap, { scale: 1, duration: 0.5, ease: 'power2.out' });
        gsap.to(ring, { filter: 'brightness(1)', duration: 0.5 });
      };

      section.addEventListener('mousemove', handleMove);
      imgWrap.addEventListener('mouseenter', handleEnter);
      imgWrap.addEventListener('mouseleave', () => {
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
          background: 'radial-gradient(circle at 50% 35%, rgba(100,255,218,0.06) 0%, transparent 60%)',
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
            color: '#64ffda',
            letterSpacing: '0.35em',
            fontWeight: 700,
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
              background: 'radial-gradient(circle, rgba(100,255,218,0.18) 0%, transparent 70%)',
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
              border: '1px dashed rgba(100,255,218,0.15)',
              zIndex: 0,
              animation: prefersReducedMotion() ? 'none' : 'rk-orbit-spin 40s linear infinite',
              '@keyframes rk-orbit-spin': {
                from: { transform: 'rotate(0deg)' },
                to: { transform: 'rotate(360deg)' },
              },
            }}
          />

          {/* animated gradient ring */}
          <Box
            ref={ringRef}
            aria-hidden="true"
            sx={{
              position: 'absolute', inset: '-8px',
              borderRadius: '50%',
              padding: '3px',
              background: 'conic-gradient(from 0deg, #64ffda, #4f8ef7, #a78bfa, #64ffda)',
              WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              zIndex: 1,
            }}
          />

          {/* circular image, floats + tilts */}
          <Box
            ref={imgWrapRef}
            sx={{
              position: 'relative',
              zIndex: 2,
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 20px 45px rgba(0,0,0,0.45)',
              transformStyle: 'preserve-3d',
              willChange: 'transform',
              background: 'rgba(16,28,45,0.65)',
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

        {/* name */}
        <Typography
          ref={nameRef}
          variant="h3"
          sx={{
            color: '#fff',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            fontSize: { xs: '1.5rem', sm: '1.9rem', md: '2.3rem' },
            mb: 2,
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
            color: 'rgba(255,255,255,0.6)',
            maxWidth: '560px',
            mx: 'auto',
            lineHeight: 1.8,
            fontSize: { xs: '0.9rem', md: '1rem' },
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
            color: 'rgba(255,255,255,0.55)',
            fontWeight: 600,
            fontSize: { xs: '0.95rem', md: '1.1rem' },
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
            transition: 'color 0.3s ease',
            '&:hover': { color: '#64ffda' },
          }}
        >
          {skill}
        </Typography>
        <Box
          component="span"
          aria-hidden="true"
          sx={{
            width: 6, height: 6, borderRadius: '50%',
            mx: { xs: 2.5, md: 4 },
            background: '#64ffda',
            boxShadow: '0 0 8px rgba(100,255,218,0.6)',
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
      <CursorGlow />
      <FloatingBackground />

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
              <MagneticButton
                variant="contained" size="large"
                onClick={() => navigate(user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard')}
                sx={{
                  borderRadius: 4, px: { xs: 4, sm: 6 }, py: 2,
                  textTransform: 'none',
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  background: '#64ffda', color: '#050b16', fontWeight: 700,
                  boxShadow: '0 10px 25px rgba(100,255,218,0.2)',
                  width: { xs: '100%', sm: 'auto' },
                  transition: 'box-shadow 0.3s ease, background 0.3s ease',
                  '&:hover': {
                    background: '#4eedc4',
                    boxShadow: '0 14px 32px rgba(100,255,218,0.32)',
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
                    borderRadius: 4, px: { xs: 4, sm: 5 }, py: 2,
                    background: '#64ffda', color: '#050b16', fontWeight: 700,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    width: { xs: '100%', sm: 'auto' },
                    transition: 'box-shadow 0.3s ease, background 0.3s ease',
                    '&:hover': {
                      background: '#4eedc4',
                      boxShadow: '0 14px 32px rgba(100,255,218,0.32)',
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
                    borderRadius: 4, px: { xs: 4, sm: 5 }, py: 2,
                    color: '#fff', borderColor: 'rgba(255,255,255,0.2)',
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    width: { xs: '100%', sm: 'auto' },
                    transition: 'border-color 0.3s ease, background 0.3s ease',
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.45)',
                      background: 'rgba(255,255,255,0.05)',
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