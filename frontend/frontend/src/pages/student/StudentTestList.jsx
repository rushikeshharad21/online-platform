// src/pages/student/StudentTestList.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import AccessTimeIcon    from '@mui/icons-material/AccessTime';
import CheckCircleIcon   from '@mui/icons-material/CheckCircle';
import QuizOutlinedIcon  from '@mui/icons-material/QuizOutlined';
import { fetchStudentTests } from '../../features/tests/testSlice';

const tk = {
  bg:          '#07111f',
  surface:     'rgba(255,255,255,0.045)',
  border:      'rgba(255,255,255,0.08)',
  borderHover: 'rgba(255,255,255,0.16)',
  text1:       '#f0f4ff',
  text2:       'rgba(200,215,240,0.65)',
  text3:       'rgba(160,185,220,0.38)',
  blue:        '#4f8ef7',
  blueBorder:  'rgba(79,142,247,0.28)',
  blueGlow:    'rgba(79,142,247,0.12)',
  green:       '#34d399',
  greenBorder: 'rgba(52,211,153,0.25)',
  greenGlow:   'rgba(52,211,153,0.12)',
  amber:       '#fbbf24',
  red:         '#f87171',
  r:           '14px',
};

const pctColor = (p) => p >= 70 ? tk.green : p >= 40 ? tk.amber : tk.red;

export default function StudentTestList() {
  const { courseId } = useParams();
  const dispatch     = useDispatch();
  const navigate     = useNavigate();
  const { list: tests, isLoading } = useSelector(s => s.tests);

  useEffect(() => {
    dispatch(fetchStudentTests(courseId));
  }, [courseId, dispatch]);

  if (isLoading) return (
    <Box sx={{
      minHeight: '100vh', bgcolor: tk.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <CircularProgress sx={{ color: tk.blue }} />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: tk.bg, pt: 5, pb: 12, px: 2 }}>
      <Box sx={{ maxWidth: '760px', mx: 'auto' }}>

        {/* Header */}
        <Typography sx={{
          fontSize: 'clamp(1.3rem,3vw,1.8rem)', fontWeight: 700,
          color: tk.text1, letterSpacing: '-0.03em', mb: '6px',
        }}>
          Tests
        </Typography>
        <Typography sx={{ fontSize: '13px', color: tk.text2, mb: '28px' }}>
          {tests.length} test{tests.length !== 1 ? 's' : ''} available
        </Typography>

        {/* Empty state */}
        {tests.length === 0 && (
          <Box sx={{
            background: tk.surface,
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: tk.r, py: '60px', textAlign: 'center',
          }}>
            <QuizOutlinedIcon sx={{ fontSize: 36, color: tk.text3, mb: '12px' }} />
            <Typography sx={{ color: tk.text2 }}>No tests available yet.</Typography>
          </Box>
        )}

        {/* Test list */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {tests.map((test) => {
            const done = !!test.attempt;
            const pct  = test.attempt?.percentage;

            return (
              <Box key={test._id} sx={{
                background: tk.surface,
                border: `1px solid ${tk.border}`,
                backdropFilter: 'blur(20px)',
                borderRadius: tk.r,
                p: '22px',
                display: 'flex', alignItems: 'center',
                gap: '20px', flexWrap: 'wrap',
                transition: 'border-color 0.2s, background 0.2s',
                '&:hover': {
                  background: 'rgba(255,255,255,0.06)',
                  borderColor: tk.borderHover,
                },
              }}>

                {/* Icon */}
                <Box sx={{
                  width: '44px', height: '44px', borderRadius: '11px', flexShrink: 0,
                  background: done ? tk.greenGlow : tk.blueGlow,
                  border: `1px solid ${done ? tk.greenBorder : tk.blueBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {done
                    ? <CheckCircleIcon    sx={{ fontSize: '22px', color: tk.green }} />
                    : <QuizOutlinedIcon  sx={{ fontSize: '22px', color: tk.blue  }} />
                  }
                </Box>

                {/* Info */}
                <Box sx={{ flex: 1, minWidth: '180px' }}>
                  <Typography sx={{
                    fontSize: '15px', fontWeight: 600,
                    color: tk.text1, mb: '6px',
                  }}>
                    {test.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AccessTimeIcon sx={{ fontSize: '12px', color: tk.text3 }} />
                      <Typography sx={{ fontSize: '11px', color: tk.text3 }}>
                        {test.durationSeconds / 60} min
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <QuizOutlinedIcon sx={{ fontSize: '12px', color: tk.text3 }} />
                      <Typography sx={{ fontSize: '11px', color: tk.text3 }}>
                        {test.questions?.length ?? 0} questions
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Score or Start button */}
                {done ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{
                        fontSize: '26px', fontWeight: 800,
                        color: pctColor(pct),
                        letterSpacing: '-0.04em', lineHeight: 1,
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                        {pct}%
                      </Typography>
                      <Typography sx={{ fontSize: '10px', color: tk.text3 }}>
                        {test.attempt.score} / {test.questions?.length ?? '?'} correct
                      </Typography>
                    </Box>
                    <Button
                      onClick={() => navigate(`/student/tests/${test._id}/result`)}
                      sx={{
                        fontSize: '12px', fontWeight: 600,
                        px: '16px', py: '8px', borderRadius: '9px',
                        color: tk.green,
                        background: tk.greenGlow,
                        border: `1px solid ${tk.greenBorder}`,
                        '&:hover': { background: 'rgba(52,211,153,0.2)' },
                      }}
                    >
                      Review
                    </Button>
                  </Box>
                ) : (
                  <Button
                    onClick={() => navigate(`/student/tests/${test._id}/attempt`)}
                    sx={{
                      fontSize: '12px', fontWeight: 700,
                      px: '22px', py: '10px', borderRadius: '9px',
                      background: 'linear-gradient(135deg,#3b7ef6,#5b5ef7)',
                      boxShadow: '0 0 0 1px rgba(79,142,247,0.35), 0 8px 20px rgba(59,126,246,0.25)',
                      color: '#fff',
                      '&:hover': { background: 'linear-gradient(135deg,#2d72f0,#5256f3)' },
                    }}
                  >
                    Start test
                  </Button>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}