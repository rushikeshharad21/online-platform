// src/pages/InstructorDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Box, Typography, Button, CircularProgress, Alert, Tooltip
} from '@mui/material';
import AddIcon                       from '@mui/icons-material/Add';
import EditOutlinedIcon              from '@mui/icons-material/EditOutlined';
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';
import PeopleAltOutlinedIcon         from '@mui/icons-material/PeopleAltOutlined';
import MenuBookOutlinedIcon          from '@mui/icons-material/MenuBookOutlined';
import SchoolOutlinedIcon            from '@mui/icons-material/SchoolOutlined';
import TrendingUpIcon                from '@mui/icons-material/TrendingUp';
import QuizOutlinedIcon              from '@mui/icons-material/QuizOutlined'; // ← NEW
import { fetchMyCourses, togglePublishStatus } from '../features/courses/courseSlice';

/* ─── Tokens ──────────────────────────────────────────────────── */
const tk = {
  bg:           '#07111f',
  surface:      'rgba(255,255,255,0.045)',
  surfaceHover: 'rgba(255,255,255,0.08)',
  border:       'rgba(255,255,255,0.08)',
  borderHover:  'rgba(255,255,255,0.16)',
  blur:         'blur(20px)',
  text1:        '#f0f4ff',
  text2:        'rgba(210,225,248,0.78)',
  text3:        'rgba(190,210,240,0.58)',
  blue:         '#4f8ef7',
  blueGlow:     'rgba(79,142,247,0.18)',
  blueBorder:   'rgba(79,142,247,0.28)',
  green:        '#34d399',
  greenGlow:    'rgba(52,211,153,0.14)',
  greenBorder:  'rgba(52,211,153,0.25)',
  amber:        '#fbbf24',
  amberGlow:    'rgba(251,191,36,0.12)',
  amberBorder:  'rgba(251,191,36,0.22)',
  purple:       '#a78bfa',
  purpleGlow:   'rgba(167,139,250,0.14)',
  purpleBorder: 'rgba(167,139,250,0.25)',
  r:            '14px',
};

/* ─── Background image ───────────────────────────────────────────
   Unsplash+ premium photo — verify you hold an Unsplash+ license
   before shipping this to production; free-tier Unsplash licensing
   does not cover plus.unsplash.com assets.
   Bumped from the supplied w=500&q=60 to w=2400&q=80: the original
   size would visibly pixelate stretched across a full viewport.
──────────────────────────────────────────────────────────────── */
const BG_IMAGE_URL =
  'https://plus.unsplash.com/premium_photo-1701892428860-ca4913e92274?w=2400&auto=format&fit=crop&q=80&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YmFja2dyb3VuZCUyMHVpJTIwaW1hZ2VzfGVufDB8fDB8fHww';

const glass = (extra = {}) => ({
  background:          tk.surface,
  border:              `1px solid ${tk.border}`,
  backdropFilter:      tk.blur,
  WebkitBackdropFilter: tk.blur,
  borderRadius:        tk.r,
  ...extra,
});

/* ─── Stat Tile ───────────────────────────────────────────────── */
const STAT_META = [
  { key: 'courses',  label: 'Total courses', color: tk.blue,   glow: tk.blueGlow,   border: tk.blueBorder,   Icon: SchoolOutlinedIcon    },
  { key: 'pub',      label: 'Published',      color: tk.green,  glow: tk.greenGlow,  border: tk.greenBorder,  Icon: TrendingUpIcon         },
  { key: 'drafts',   label: 'Drafts',          color: tk.amber,  glow: tk.amberGlow,  border: tk.amberBorder,  Icon: EditOutlinedIcon       },
  { key: 'students', label: 'Total students', color: tk.purple, glow: tk.purpleGlow, border: tk.purpleBorder, Icon: PeopleAltOutlinedIcon  },
];

const StatTile = ({ label, value, color, glow, border, Icon }) => (
  <Box sx={{
    ...glass(),
    p: '18px 20px 16px',
    display: 'flex', flexDirection: 'column', gap: '12px',
    position: 'relative', overflow: 'hidden',
    transition: 'border-color 0.2s, background 0.2s',
    '&:hover': { background: tk.surfaceHover, borderColor: tk.borderHover },
    '&::after': {
      content: '""', position: 'absolute',
      top: '-24px', right: '-24px',
      width: '90px', height: '90px', borderRadius: '50%',
      background: glow, pointerEvents: 'none',
    },
    '&::before': {
      content: '""', position: 'absolute',
      top: 0, left: '20px', right: '20px', height: '1px',
      background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      opacity: 0.6,
    },
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography sx={{ fontSize: '10px', fontWeight: 700, color: tk.text3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </Typography>
      <Box sx={{
        width: '30px', height: '30px', borderRadius: '8px',
        background: glow, border: `1px solid ${border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon sx={{ fontSize: '14px', color }} />
      </Box>
    </Box>
    <Typography sx={{
      fontSize: '32px', fontWeight: 700, color: tk.text1,
      lineHeight: 1, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums',
    }}>
      {value}
    </Typography>
  </Box>
);

/* ─── Course Card ─────────────────────────────────────────────── */
const CourseCard = ({ course, isPending, onToggle }) => {
  const published = !!course.isPublished;

  return (
    <Box sx={{
      ...glass(),
      display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden',
      transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.2s',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: `0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px ${tk.borderHover}`,
        borderColor: tk.borderHover,
        '& .card-thumb-img': { transform: 'scale(1.07)' },
        '& .card-edit-btn': {
          background: 'rgba(79,142,247,0.22)',
          borderColor: 'rgba(79,142,247,0.45)',
          color: '#a5c8ff',
        },
      },
    }}>

      {/* Thumbnail */}
      <Box className="card-thumb" sx={{
        width: '100%', aspectRatio: '16 / 9',
        flexShrink: 0, overflow: 'hidden', position: 'relative',
        bgcolor: 'rgba(10,20,48,0.8)',
      }}>
        {course.thumbnailUrl ? (
          <Box
            component="img"
            src={course.thumbnailUrl}
            alt={course.title}
            className="card-thumb-img"
            sx={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center',
              display: 'block', transition: 'transform 0.5s ease',
            }}
          />
        ) : (
          <Box sx={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            <ImageNotSupportedOutlinedIcon sx={{ fontSize: 26, color: tk.text3 }} />
            <Typography sx={{ fontSize: '10px', color: tk.text3, letterSpacing: '0.06em' }}>No thumbnail</Typography>
          </Box>
        )}

        {/* Scrim */}
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(4,10,24,0.72) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />

        {/* Category badge */}
        {course.category && (
          <Box sx={{
            position: 'absolute', bottom: '10px', left: '12px',
            px: '8px', py: '3px', borderRadius: '5px',
            background: 'rgba(7,17,31,0.75)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            border: `1px solid ${tk.border}`,
          }}>
            <Typography sx={{ fontSize: '9px', fontWeight: 700, color: 'rgba(200,220,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
              {course.category}
            </Typography>
          </Box>
        )}

        {/* Status pill */}
        <Box sx={{
          position: 'absolute', top: '10px', right: '10px',
          display: 'flex', alignItems: 'center', gap: '5px',
          px: '8px', py: '4px', borderRadius: '20px',
          background: published ? 'rgba(5,20,12,0.78)' : 'rgba(20,14,5,0.78)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          border: `1px solid ${published ? tk.greenBorder : tk.amberBorder}`,
        }}>
          <Box sx={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: published ? tk.green : tk.amber,
            boxShadow: `0 0 6px ${published ? tk.green : tk.amber}`,
          }} />
          <Typography sx={{ fontSize: '9px', fontWeight: 700, color: published ? tk.green : tk.amber, letterSpacing: '0.07em' }}>
            {published ? 'Live' : 'Draft'}
          </Typography>
        </Box>
      </Box>

      {/* Card body */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', px: '16px', pt: '14px', pb: 0 }}>
        <Typography sx={{
          fontSize: '14px', fontWeight: 600, color: tk.text1, lineHeight: 1.45,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', minHeight: '2.9em', mb: '12px',
        }}>
          {course.title}
        </Typography>
        <Box sx={{ display: 'flex', gap: '16px', mt: 'auto', mb: '14px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <PeopleAltOutlinedIcon sx={{ fontSize: '12px', color: tk.text3 }} />
            <Typography sx={{ fontSize: '11px', color: tk.text2 }}>{course.enrolledCount || 0} students</Typography>
          </Box>
          {course.lessonCount > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <MenuBookOutlinedIcon sx={{ fontSize: '12px', color: tk.text3 }} />
              <Typography sx={{ fontSize: '11px', color: tk.text2 }}>{course.lessonCount} lessons</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: '6px',
        px: '12px', pb: '12px', pt: '10px',
        borderTop: `1px solid ${tk.border}`,
        flexWrap: 'wrap', // ← allows 3 buttons to wrap on small cards
      }}>

        {/* Publish toggle */}
        <Tooltip title={published ? 'Unpublish' : 'Publish'} arrow placement="top">
          <Box
            onClick={() => !isPending && onToggle(course)}
            sx={{
              display: 'flex', alignItems: 'center', gap: '7px',
              px: '10px', py: '6px', borderRadius: '8px',
              border: `1px solid ${published ? tk.greenBorder : tk.amberBorder}`,
              background: published ? tk.greenGlow : tk.amberGlow,
              cursor: isPending ? 'default' : 'pointer',
              opacity: isPending ? 0.5 : 1,
              transition: 'background 0.18s, opacity 0.18s',
              userSelect: 'none', flexShrink: 0,
              '&:hover': { background: published ? 'rgba(52,211,153,0.22)' : 'rgba(251,191,36,0.20)' },
            }}
          >
            <Box sx={{
              width: '28px', height: '16px', borderRadius: '8px',
              background: published ? tk.green : 'rgba(255,255,255,0.12)',
              border: `1px solid ${published ? 'transparent' : 'rgba(255,255,255,0.18)'}`,
              position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}>
              <Box sx={{
                position: 'absolute', top: '2px',
                left: published ? '13px' : '2px',
                width: '10px', height: '10px', borderRadius: '50%',
                background: '#fff', transition: 'left 0.18s ease',
              }} />
            </Box>
            <Typography sx={{ fontSize: '10px', fontWeight: 600, color: published ? tk.green : tk.amber, letterSpacing: '0.04em' }}>
              {isPending ? '···' : published ? 'Published' : 'Draft'}
            </Typography>
          </Box>
        </Tooltip>

        {/* Edit button */}
        <Button
          component={Link}
          to={`/instructor/edit-course/${course._id}`}
          className="card-edit-btn"
          fullWidth
          startIcon={<EditOutlinedIcon sx={{ fontSize: '13px !important' }} />}
          disableElevation
          disableRipple
          sx={{
            borderRadius: '8px', fontWeight: 600, fontSize: '12px',
            py: '6px', letterSpacing: '0.025em',
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${tk.border}`,
            color: 'rgba(190,210,255,0.75)',
            transition: 'background 0.18s, border-color 0.18s, color 0.18s',
            '&:hover': {
              background: 'rgba(79,142,247,0.22)',
              borderColor: 'rgba(79,142,247,0.45)',
              color: '#a5c8ff',
            },
          }}
        >
          Edit
        </Button>

        {/* Tests button ← NEW */}
        <Button
          component={Link}
          to={`/instructor/courses/${course._id}/tests`}
          fullWidth
          startIcon={<QuizOutlinedIcon sx={{ fontSize: '13px !important' }} />}
          disableElevation
          disableRipple
          sx={{
            borderRadius: '8px', fontWeight: 600, fontSize: '12px',
            py: '6px', letterSpacing: '0.025em',
            background: 'rgba(167,139,250,0.08)',
            border: '1px solid rgba(167,139,250,0.22)',
            color: 'rgba(167,139,250,0.85)',
            transition: 'background 0.18s, border-color 0.18s, color 0.18s',
            '&:hover': {
              background: 'rgba(167,139,250,0.18)',
              borderColor: 'rgba(167,139,250,0.4)',
              color: '#c4b5fd',
            },
          }}
        >
          Tests
        </Button>

      </Box>
    </Box>
  );
};

/* ─── Dashboard ───────────────────────────────────────────────── */
const InstructorDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const { courses = [], isLoading, isError, message } = useSelector((state) => state.courses || {});
  const [pendingToggles, setPendingToggles] = useState({});

  useEffect(() => {
    if (user?.token) dispatch(fetchMyCourses());
  }, [dispatch, user]);

  const handleToggle = (course) => {
    if (pendingToggles[course._id]) return;
    setPendingToggles(prev => ({ ...prev, [course._id]: true }));
    dispatch(togglePublishStatus({ courseId: course._id, isPublished: !course.isPublished }))
      .finally(() => setPendingToggles(prev => ({ ...prev, [course._id]: false })));
  };

  const publishedCount = courses.filter(c => c.isPublished).length;
  const draftCount     = courses.length - publishedCount;
  const totalStudents  = courses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);
  const statValues     = { courses: courses.length, pub: publishedCount, drafts: draftCount, students: totalStudents };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: tk.bg, pt: 5, pb: 10, position: 'relative' }}>

      {/* Background image + scrim — layered behind everything, does not
          affect layout/flow of any existing element below. */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${BG_IMAGE_URL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.8,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(7,17,31,0.2) 0%, rgba(7,17,31,0.35) 40%, rgba(7,17,31,0.2) 100%)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: '36px', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{
              fontSize: 'clamp(1.6rem, 3vw, 2rem)', fontWeight: 700,
              color: tk.text1, letterSpacing: '-0.03em', lineHeight: 1.15, mb: '6px',
            }}>
              Instructor panel
            </Typography>
            <Typography sx={{ fontSize: '14px', color: tk.text2 }}>
              Manage your courses and track performance.
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/instructor/create-course"
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}
            disableElevation
            sx={{
              background: 'linear-gradient(135deg, #3b7ef6, #5b5ef7)',
              boxShadow: '0 0 0 1px rgba(79,142,247,0.35), 0 8px 24px rgba(59,126,246,0.28)',
              borderRadius: '10px', fontWeight: 600,
              px: '22px', py: '10px', fontSize: '13px', letterSpacing: '0.01em',
              transition: 'box-shadow 0.2s, transform 0.15s',
              '&:hover': {
                background: 'linear-gradient(135deg, #2d72f0, #5256f3)',
                boxShadow: '0 0 0 1px rgba(79,142,247,0.5), 0 12px 32px rgba(59,126,246,0.4)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Create new course
          </Button>
        </Box>

        {/* Stats */}
        {!isLoading && !isError && (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: '12px', mb: '32px',
          }}>
            {STAT_META.map(({ key, label, color, glow, border, Icon }) => (
              <StatTile key={key} label={label} value={statValues[key]} color={color} glow={glow} border={border} Icon={Icon} />
            ))}
          </Box>
        )}

        {isError && <Alert severity="error" sx={{ mb: 3 }}>{message}</Alert>}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress sx={{ color: tk.blue }} />
          </Box>

        ) : courses.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 14, ...glass({ border: '1px dashed rgba(255,255,255,0.1)' }) }}>
            <SchoolOutlinedIcon sx={{ fontSize: 40, color: tk.text3, mb: 2 }} />
            <Typography sx={{ color: tk.text2, mb: '20px', fontSize: '15px' }}>
              No courses yet. Create your first one.
            </Typography>
            <Button
              component={Link} to="/instructor/create-course"
              variant="contained" startIcon={<AddIcon />} disableElevation
              sx={{
                background: 'linear-gradient(135deg, #3b7ef6, #5b5ef7)',
                boxShadow: '0 8px 24px rgba(59,126,246,0.28)',
                borderRadius: '10px', fontWeight: 600, px: '22px',
              }}
            >
              Create course
            </Button>
          </Box>

        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0,1fr))', lg: 'repeat(3, minmax(0,1fr))' },
            gap: '20px', alignItems: 'stretch',
          }}>
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                isPending={!!pendingToggles[course._id]}
                onToggle={handleToggle}
              />
            ))}
          </Box>
        )}

      </Container>
    </Box>
  );
};

export default InstructorDashboard;