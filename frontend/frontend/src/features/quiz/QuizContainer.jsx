// src/features/quiz/QuizContainer.jsx
import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Button, Chip } from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon       from '@mui/icons-material/Bookmark';
import {
  selectCurrentQ, selectCurrentIndex, selectQuestions,
  selectAnswers, selectFlagged, selectQuizStatus,
  answerSubmitted, navigated, flagToggled, quizEnded,
} from './quizSlice';
import { McqQuestion }     from './McqQuestion';
import { IntegerQuestion } from './IntegerQuestion';
import { QuizTimerBar }    from './QuizTimerBar';
import { QuizResults }     from './QuizResults';

const tk = {
  bg:      '#07111f',
  surface: 'rgba(255,255,255,0.045)',
  border:  'rgba(255,255,255,0.08)',
  text1:   '#607ecf',
  text2:   'rgba(200,215,240,0.65)',
  text3:   'rgba(81, 144, 233, 0.38)',
  blue:    '#4f8ef7',
  green:   '#34d399',
  amber:   '#fbbf24',
  red:     '#f87171',
  r:       '14px',
};

const DIFF_COLOR = {
  easy:   { color: tk.green,  bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.25)'  },
  medium: { color: tk.amber,  bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.22)'  },
  hard:   { color: tk.red,    bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.22)' },
};

/* ── Nav Dot ─────────────────────────────────────────────────── */
const NavDot = React.memo(({ index, answered, flagged, isCurrent, onClick }) => (
  <Box
    onClick={() => onClick(index)}
    sx={{
      width: '30px', height: '30px', borderRadius: '7px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '11px', fontWeight: 700, cursor: 'pointer',
      userSelect: 'none',
      background: isCurrent
        ? tk.blue
        : answered
          ? 'rgba(52,211,153,0.18)'
          : 'rgba(255,255,255,0.05)',
      border: `1px solid ${
        isCurrent  ? tk.blue
        : flagged  ? tk.amber
        : answered ? 'rgba(52,211,153,0.3)'
        : tk.border
      }`,
      color: isCurrent ? '#fff' : answered ? tk.green : tk.text3,
      transition: 'all 0.15s',
      '&:hover': { background: isCurrent ? tk.blue : 'rgba(255,255,255,0.1)' },
    }}
  >
    {index + 1}
  </Box>
));

/* ── Main Container ──────────────────────────────────────────── */
export function QuizContainer() {
  const dispatch  = useDispatch();
  const status    = useSelector(selectQuizStatus);
  const question  = useSelector(selectCurrentQ);
  const index     = useSelector(selectCurrentIndex);
  const questions = useSelector(selectQuestions);
  const answers   = useSelector(selectAnswers);
  const flagged   = useSelector(selectFlagged);

  const handleAnswer = useCallback((ans) => {
    dispatch(answerSubmitted({ questionId: question._id, answer: ans }));
  }, [dispatch, question?._id]);

  const handleNav  = useCallback((i) => dispatch(navigated(i)), [dispatch]);
  const handleFlag = useCallback(() => dispatch(flagToggled(question._id)), [dispatch, question?._id]);
  const handleEnd  = useCallback(() => dispatch(quizEnded()), [dispatch]);

  if (status === 'completed') return <QuizResults />;
  if (!question)              return null;

  const dc        = DIFF_COLOR[question.difficulty];
  const isFlagged = !!flagged[question._id];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: tk.bg, pt: 4, pb: 10, px: 2 }}>
      <Box sx={{ maxWidth: '860px', mx: 'auto' }}>

        {/* ── Header ───────────────────────────────────────── */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: '16px',
          background: tk.surface, border: `1px solid ${tk.border}`,
          backdropFilter: 'blur(20px)', borderRadius: tk.r,
          px: '20px', py: '14px', mb: '20px',
        }}>
          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: tk.text2, mr: 'auto' }}>
            Q {index + 1} / {questions.length}
          </Typography>
          <Box sx={{ flex: 1, maxWidth: '360px' }}>
            <QuizTimerBar />
          </Box>
          <Button
            onClick={handleEnd}
            size="small"
            sx={{
              fontSize: '11px', fontWeight: 700, color: tk.red,
              border: '1px solid rgba(248,113,113,0.28)',
              borderRadius: '8px', px: '12px', py: '5px',
              background: 'rgba(248,113,113,0.08)',
              '&:hover': { background: 'rgba(248,113,113,0.16)' },
            }}
          >
            End Quiz
          </Button>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 220px' }, gap: '16px' }}>

          {/* ── Question Panel ────────────────────────────── */}
          <Box sx={{
            background: tk.surface, border: `1px solid ${tk.border}`,
            backdropFilter: 'blur(20px)', borderRadius: tk.r,
            p: '28px', display: 'flex', flexDirection: 'column', gap: '24px',
          }}>

            {/* Meta row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Chip
                label={question.difficulty.toUpperCase()}
                size="small"
                sx={{
                  fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em',
                  color: dc.color, background: dc.bg,
                  border: `1px solid ${dc.border}`,
                  borderRadius: '5px', height: '22px',
                }}
              />
              <Chip
                label={question.type}
                size="small"
                sx={{
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em',
                  color: tk.text3, background: 'rgba(138, 41, 41, 0.88)',
                  border: `1px solid ${tk.border}`,
                  borderRadius: '5px', height: '22px',
                }}
              />
              <Box
                onClick={handleFlag}
                sx={{
                  ml: 'auto', display: 'flex', alignItems: 'center', gap: '5px',
                  cursor: 'pointer', color: isFlagged ? tk.amber : tk.text3,
                  fontSize: '11px', fontWeight: 600,
                  transition: 'color 0.15s', userSelect: 'none',
                  '&:hover': { color: tk.amber },
                }}
              >
                {isFlagged
                  ? <BookmarkIcon sx={{ fontSize: '16px' }} />
                  : <BookmarkBorderIcon sx={{ fontSize: '16px' }} />}
                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'inherit' }}>
                  {isFlagged ? 'Flagged' : 'Flag'}
                </Typography>
              </Box>
            </Box>

            {/* Question text */}
            <Typography sx={{
              fontSize: '16px', fontWeight: 500, color: tk.text1,
              lineHeight: 1.65, letterSpacing: '-0.01em',
            }}>
              {question.text}
            </Typography>

            {/* Answer input */}
            {question.type === 'MCQ' ? (
              <McqQuestion
                question={question}
                selected={answers[question._id]}
                onChange={handleAnswer}
              />
            ) : (
              <IntegerQuestion
                question={question}
                value={answers[question._id]}
                onChange={handleAnswer}
              />
            )}

            {/* Prev / Next */}
            <Box sx={{
              display: 'flex', gap: '10px',
              pt: '8px', borderTop: `1px solid ${tk.border}`,
            }}>
              <Button
                onClick={() => handleNav(index - 1)}
                disabled={index === 0}
                sx={navBtnSx}
              >
                ← Prev
              </Button>

              {index < questions.length - 1 ? (
                <Button onClick={() => handleNav(index + 1)} sx={{ ...navBtnSx, ml: 'auto' }}>
                  Next →
                </Button>
              ) : (
                <Button
                  onClick={handleEnd}
                  sx={{
                    ...navBtnSx, ml: 'auto',
                    background: 'rgba(52,211,153,0.14)',
                    borderColor: 'rgba(52,211,153,0.3)',
                    color: tk.green,
                    '&:hover': { background: 'rgba(52,211,153,0.22)' },
                  }}
                >
                  Submit Quiz
                </Button>
              )}
            </Box>
          </Box>

          {/* ── Nav Panel ─────────────────────────────────── */}
          <Box sx={{
            background: tk.surface, border: `1px solid ${tk.border}`,
            backdropFilter: 'blur(20px)', borderRadius: tk.r,
            p: '18px',
          }}>
            <Typography sx={{
              fontSize: '10px', fontWeight: 700, color: tk.text3,
              letterSpacing: '0.1em', textTransform: 'uppercase', mb: '14px',
            }}>
              Questions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {questions.map((q, i) => (
                <NavDot
                  key={q._id}
                  index={i}
                  answered={answers[q._id] !== undefined}
                  flagged={!!flagged[q._id]}
                  isCurrent={i === index}
                  onClick={handleNav}
                />
              ))}
            </Box>

            {/* Legend */}
            <Box sx={{ mt: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { color: tk.blue,  label: 'Current'     },
                { color: tk.green, label: 'Answered'     },
                { color: tk.amber, label: 'Flagged'      },
                { color: tk.text3, label: 'Unattempted'  },
              ].map(({ color, label }) => (
                <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Box sx={{ width: '8px', height: '8px', borderRadius: '2px', background: color, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '11px', color: tk.text3 }}>{label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

        </Box>
      </Box>
    </Box>
  );
}

const navBtnSx = {
  fontSize: '12px', fontWeight: 600, px: '16px', py: '7px',
  borderRadius: '8px', color: 'rgba(190,210,255,0.7)',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  '&:hover': { background: 'rgba(255,255,255,0.09)' },
  '&:disabled': { opacity: 0.3 },
};