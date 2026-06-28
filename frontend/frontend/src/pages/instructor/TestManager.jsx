// src/pages/instructor/TestManager.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Button, CircularProgress,
  Alert, Tooltip,
} from '@mui/material';
import AddIcon           from '@mui/icons-material/Add';
import EditOutlinedIcon  from '@mui/icons-material/EditOutlined';
import BarChartIcon      from '@mui/icons-material/BarChart';
import QuizOutlinedIcon  from '@mui/icons-material/QuizOutlined';
import AccessTimeIcon    from '@mui/icons-material/AccessTime';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import {
  fetchCourseTests,
  toggleTestPublish,
} from '../../features/tests/testSlice';

const tk = {
  bg:           '#07111f',
  surface:      'rgba(255,255,255,0.045)',
  surfaceHover: 'rgba(255,255,255,0.07)',
  border:       'rgba(255,255,255,0.08)',
  borderHover:  'rgba(255,255,255,0.16)',
  text1:        '#f0f4ff',
  text2:        'rgba(200,215,240,0.65)',
  text3:        'rgba(160,185,220,0.38)',
  blue:         '#4f8ef7',
  blueBorder:   'rgba(79,142,247,0.28)',
  blueGlow:     'rgba(79,142,247,0.12)',
  green:        '#34d399',
  greenBorder:  'rgba(52,211,153,0.25)',
  greenGlow:    'rgba(52,211,153,0.12)',
  amber:        '#fbbf24',
  amberBorder:  'rgba(251,191,36,0.22)',
  amberGlow:    'rgba(251,191,36,0.10)',
  r:            '14px',
};

const glass = (extra = {}) => ({
  background:     tk.surface,
  border:         `1px solid ${tk.border}`,
  backdropFilter: 'blur(20px)',
  borderRadius:   tk.r,
  ...extra,
});

/* ── Publish Toggle ──────────────────────────────────────────── */
const PublishToggle = ({ published, isPending, onToggle }) => (
  <Tooltip title={published ? 'Unpublish' : 'Publish'} arrow placement="top">
    <Box
      onClick={() => !isPending && onToggle()}
      sx={{
        display: 'flex', alignItems: 'center', gap: '7px',
        px: '10px', py: '6px', borderRadius: '8px',
        border: `1px solid ${published ? tk.greenBorder : tk.amberBorder}`,
        background: published ? tk.greenGlow : tk.amberGlow,
        cursor: isPending ? 'default' : 'pointer',
        opacity: isPending ? 0.5 : 1,
        transition: 'background 0.18s',
        userSelect: 'none', flexShrink: 0,
        '&:hover': {
          background: published
            ? 'rgba(52,211,153,0.22)'
            : 'rgba(251,191,36,0.20)',
        },
      }}
    >
      {/* Track */}
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
      <Typography sx={{
        fontSize: '10px', fontWeight: 600,
        color: published ? tk.green : tk.amber,
        letterSpacing: '0.04em',
      }}>
        {isPending ? '···' : published ? 'Live' : 'Draft'}
      </Typography>
    </Box>
  </Tooltip>
);

/* ── Test Card ───────────────────────────────────────────────── */
const TestCard = ({ test, isPending, onToggle, onResults }) => {
  const published = !!test.isPublished;

  return (
    <Box sx={{
      ...glass(),
      p: '20px',
      display: 'flex', flexDirection: 'column', gap: '16px',
      transition: 'border-color 0.2s, background 0.2s',
      '&:hover': { background: tk.surfaceHover, borderColor: tk.borderHover },
    }}>

      {/* Top row */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <Box sx={{
          width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
          background: published ? tk.greenGlow : tk.amberGlow,
          border: `1px solid ${published ? tk.greenBorder : tk.amberBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <QuizOutlinedIcon sx={{ fontSize: '20px', color: published ? tk.green : tk.amber }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{
            fontSize: '15px', fontWeight: 600, color: tk.text1,
            mb: '4px', lineHeight: 1.3,
          }}>
            {test.title}
          </Typography>
          {test.description && (
            <Typography sx={{
              fontSize: '12px', color: tk.text3, lineHeight: 1.5,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
            }}>
              {test.description}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Stats row */}
      <Box sx={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <AccessTimeIcon sx={{ fontSize: '12px', color: tk.text3 }} />
          <Typography sx={{ fontSize: '11px', color: tk.text2 }}>
            {test.durationSeconds / 60} min
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <QuizOutlinedIcon sx={{ fontSize: '12px', color: tk.text3 }} />
          <Typography sx={{ fontSize: '11px', color: tk.text2 }}>
            {test.questions?.length ?? 0} questions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <PeopleAltOutlinedIcon sx={{ fontSize: '12px', color: tk.text3 }} />
          <Typography sx={{ fontSize: '11px', color: tk.text2 }}>
            {test.attemptCount ?? 0} attempts
          </Typography>
        </Box>
        {test.avgScore !== null && test.avgScore !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <BarChartIcon sx={{ fontSize: '12px', color: tk.text3 }} />
            <Typography sx={{ fontSize: '11px', color: tk.text2 }}>
              Avg {Math.round(test.avgScore)}%
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer actions */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: '8px',
        pt: '12px', borderTop: `1px solid ${tk.border}`,
        flexWrap: 'wrap',
      }}>
        <PublishToggle
          published={published}
          isPending={isPending}
          onToggle={onToggle}
        />
        <Button
          onClick={onResults}
          startIcon={<BarChartIcon sx={{ fontSize: '13px !important' }} />}
          disableElevation disableRipple
          sx={{
            borderRadius: '8px', fontWeight: 600, fontSize: '12px',
            py: '6px', px: '14px',
            background: tk.blueGlow,
            border: `1px solid ${tk.blueBorder}`,
            color: tk.blue,
            transition: 'background 0.18s',
            '&:hover': { background: 'rgba(79,142,247,0.22)' },
          }}
        >
          Results
        </Button>
      </Box>
    </Box>
  );
};

/* ── Page ────────────────────────────────────────────────────── */
export default function TestManager() {
  const { courseId }  = useParams();
  const dispatch      = useDispatch();
  const navigate      = useNavigate();
  const { list: tests, isLoading, isError, message } = useSelector(s => s.tests);
  const [pendingToggles, setPendingToggles] = React.useState({});

  useEffect(() => {
    dispatch(fetchCourseTests(courseId));
  }, [courseId, dispatch]);

  const handleToggle = (test) => {
    if (pendingToggles[test._id]) return;
    setPendingToggles(prev => ({ ...prev, [test._id]: true }));
    dispatch(toggleTestPublish(test._id))
      .finally(() => setPendingToggles(prev => ({ ...prev, [test._id]: false })));
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: tk.bg, pt: 5, pb: 12, px: 2 }}>
      <Box sx={{ maxWidth: '860px', mx: 'auto' }}>

        {/* Header */}
        <Box sx={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', mb: '32px', flexWrap: 'wrap', gap: 2,
        }}>
          <Box>
            <Typography sx={{
              fontSize: 'clamp(1.4rem,3vw,1.8rem)', fontWeight: 700,
              color: tk.text1, letterSpacing: '-0.03em',
            }}>
              Tests
            </Typography>
            <Typography sx={{ fontSize: '13px', color: tk.text2, mt: '4px' }}>
              {tests.length} test{tests.length !== 1 ? 's' : ''} for this course
            </Typography>
          </Box>
          <Button
            component={Link}
            to={`/instructor/courses/${courseId}/tests/create`}
            startIcon={<AddIcon />}
            disableElevation
            sx={{
              background: 'linear-gradient(135deg,#3b7ef6,#5b5ef7)',
              boxShadow: '0 0 0 1px rgba(79,142,247,0.35), 0 8px 24px rgba(59,126,246,0.28)',
              borderRadius: '10px', fontWeight: 600,
              px: '20px', py: '10px', fontSize: '13px', color: '#fff',
              '&:hover': { background: 'linear-gradient(135deg,#2d72f0,#5256f3)' },
            }}
          >
            Create test
          </Button>
        </Box>

        {isError && <Alert severity="error" sx={{ mb: 3 }}>{message}</Alert>}

        {/* Loading */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress sx={{ color: tk.blue }} />
          </Box>

        /* Empty state */
        ) : tests.length === 0 ? (
          <Box sx={{
            ...glass({ border: '1px dashed rgba(255,255,255,0.1)' }),
            textAlign: 'center', py: 14,
          }}>
            <QuizOutlinedIcon sx={{ fontSize: 40, color: tk.text3, mb: 2 }} />
            <Typography sx={{ color: tk.text2, mb: '20px', fontSize: '15px' }}>
              No tests yet. Create your first one.
            </Typography>
            <Button
              component={Link}
              to={`/instructor/courses/${courseId}/tests/create`}
              startIcon={<AddIcon />}
              disableElevation
              sx={{
                background: 'linear-gradient(135deg,#3b7ef6,#5b5ef7)',
                boxShadow: '0 8px 24px rgba(59,126,246,0.28)',
                borderRadius: '10px', fontWeight: 600,
                px: '22px', color: '#fff',
              }}
            >
              Create test
            </Button>
          </Box>

        /* Test list */
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {tests.map((test) => (
              <TestCard
                key={test._id}
                test={test}
                isPending={!!pendingToggles[test._id]}
                onToggle={() => handleToggle(test)}
                onResults={() => navigate(`/instructor/tests/${test._id}/results`)}
              />
            ))}
          </Box>
        )}

      </Box>
    </Box>
  );
}