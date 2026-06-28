// src/pages/student/StudentResult.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import ArrowBackIcon           from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon  from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon      from '@mui/icons-material/CancelOutlined';
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import { fetchMyResult }       from '../../features/tests/testSlice';

const tk = {
  bg:      '#07111f',
  surface: 'rgba(255,255,255,0.045)',
  border:  'rgba(255,255,255,0.08)',
  text1:   '#f0f4ff',
  text2:   'rgba(200,215,240,0.65)',
  text3:   'rgba(160,185,220,0.38)',
  blue:    '#4f8ef7',
  green:   '#34d399',
  amber:   '#fbbf24',
  red:     '#f87171',
  r:       '14px',
};

const glass = (extra = {}) => ({
  background:     tk.surface,
  border:         `1px solid ${tk.border}`,
  backdropFilter: 'blur(20px)',
  borderRadius:   tk.r,
  ...extra,
});

const pctColor  = (p) => p >= 70 ? tk.green : p >= 40 ? tk.amber : tk.red;
const DIFF_COLOR = { easy: tk.green, medium: tk.amber, hard: tk.red };

/* ── Score Ring ──────────────────────────────────────────────── */
const ScoreRing = ({ pct }) => {
  const r    = 54;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - pct / 100);
  const color = pctColor(pct);

  return (
    <Box sx={{ position: 'relative', width: '140px', height: '140px', flexShrink: 0 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="70" cy="70" r={r}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"
        />
        <circle
          cx="70" cy="70" r={r}
          fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={dash}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <Box sx={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Typography sx={{
          fontSize: '28px', fontWeight: 800,
          color: tk.text1, lineHeight: 1, letterSpacing: '-0.04em',
        }}>
          {pct}%
        </Typography>
        <Typography sx={{ fontSize: '10px', color: tk.text3, letterSpacing: '0.06em' }}>
          SCORE
        </Typography>
      </Box>
    </Box>
  );
};

/* ── Page ────────────────────────────────────────────────────── */
export default function StudentResult() {
  const { testId } = useParams();
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { myResult, isLoading } = useSelector(s => s.tests);

  useEffect(() => {
    dispatch(fetchMyResult(testId));
  }, [testId, dispatch]);

  if (isLoading || !myResult || !myResult.enrichedAnswers) return (
    <Box sx={{
      minHeight: '100vh', bgcolor: tk.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <CircularProgress sx={{ color: tk.blue }} />
    </Box>
  );

  const { percentage, score, total, timeTakenSeconds, testTitle, enrichedAnswers } = myResult;
  // Compute breakdown from enrichedAnswers
  let correct = 0, wrong = 0, skipped = 0;
  const byDiff = { easy: { c: 0, t: 0 }, medium: { c: 0, t: 0 }, hard: { c: 0, t: 0 } };

  enrichedAnswers.forEach(({ isCorrect, answer, question }) => {
    const d = question?.difficulty ?? 'easy';
    byDiff[d].t++;
    if (answer === null || answer === undefined || answer === '') {
      skipped++;
    } else if (isCorrect) {
      correct++;
      byDiff[d].c++;
    } else {
      wrong++;
    }
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: tk.bg, pt: 5, pb: 12, px: 2 }}>
      <Box sx={{ maxWidth: '760px', mx: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Back */}
        <Button
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon />}
          sx={{ color: tk.text3, fontSize: '12px', alignSelf: 'flex-start', '&:hover': { color: tk.text2 } }}
        >
          Back
        </Button>

        {/* Hero */}
        <Box sx={{ ...glass(), p: '32px', display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
          <ScoreRing pct={percentage} />
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <Typography sx={{
              fontSize: 'clamp(1.3rem,3vw,1.8rem)', fontWeight: 700,
              color: tk.text1, letterSpacing: '-0.03em', mb: '4px',
            }}>
              {testTitle}
            </Typography>
            <Typography sx={{ fontSize: '13px', color: tk.text2, mb: '16px' }}>
              {percentage >= 70 ? 'Well done!' : percentage >= 40 ? 'Keep going.' : 'Needs work.'}
            </Typography>

            {/* Stat pills */}
            <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap', mb: '12px' }}>
              {[
                { label: 'Correct', value: correct, color: tk.green, Icon: CheckCircleOutlineIcon  },
                { label: 'Wrong',   value: wrong,   color: tk.red,   Icon: CancelOutlinedIcon      },
                { label: 'Skipped', value: skipped, color: tk.amber, Icon: RemoveCircleOutlineIcon },
              ].map(({ label, value, color, Icon }) => (
                <Box key={label} sx={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  px: '12px', py: '7px', borderRadius: '9px',
                  background: `${color}18`, border: `1px solid ${color}30`,
                }}>
                  <Icon sx={{ fontSize: '13px', color }} />
                  <Typography sx={{ fontSize: '12px', fontWeight: 700, color }}>
                    {value} {label}
                  </Typography>
                </Box>
              ))}
            </Box>

            {timeTakenSeconds && (
              <Typography sx={{ fontSize: '12px', color: tk.text3 }}>
                Time taken: {Math.floor(timeTakenSeconds / 60)}m {timeTakenSeconds % 60}s
              </Typography>
            )}
          </Box>
        </Box>

        {/* Difficulty breakdown */}
        <Box sx={{ ...glass(), p: '24px' }}>
          <Typography sx={{
            fontSize: '11px', fontWeight: 700, color: tk.text3,
            letterSpacing: '0.1em', textTransform: 'uppercase', mb: '16px',
          }}>
            By Difficulty
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['easy', 'medium', 'hard'].map((d) => {
              const { c, t } = byDiff[d];
              const p        = t > 0 ? Math.round((c / t) * 100) : 0;
              const color    = DIFF_COLOR[d];
              return (
                <Box key={d}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '5px' }}>
                    <Typography sx={{
                      fontSize: '12px', fontWeight: 600,
                      color: tk.text2, textTransform: 'capitalize',
                    }}>
                      {d}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: tk.text3 }}>
                      {c}/{t}
                    </Typography>
                  </Box>
                  <Box sx={{ height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.07)' }}>
                    <Box sx={{
                      height: '100%', borderRadius: '3px',
                      width: `${p}%`, background: color,
                      transition: 'width 1s ease',
                    }} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Per question review */}
        <Box sx={{ ...glass(), p: '24px' }}>
          <Typography sx={{
            fontSize: '11px', fontWeight: 700, color: tk.text3,
            letterSpacing: '0.1em', textTransform: 'uppercase', mb: '16px',
          }}>
            Question Review
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {enrichedAnswers.map(({ answer, isCorrect, question }, i) => {
              const skipped = answer === null || answer === undefined || answer === '';
              const border  = skipped ? tk.amber : isCorrect ? tk.green : tk.red;
              return (
                <Box key={i} sx={{
                  px: '16px', py: '14px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.025)',
                  border: `1px solid ${border}28`,
                  borderLeft: `3px solid ${border}`,
                }}>
                  <Typography sx={{ fontSize: '12px', color: tk.text2, mb: '4px' }}>
                    Q{i + 1} ·{' '}
                    <span style={{ textTransform: 'capitalize', color: border }}>
                      {question?.difficulty}
                    </span>{' '}
                    · {question?.type}
                  </Typography>

                  <Typography sx={{
                    fontSize: '13px', color: tk.text1,
                    mb: '8px', lineHeight: 1.5,
                  }}>
                    {question?.text}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <Typography sx={{ fontSize: '11px', color: tk.text3 }}>
                      Your answer:{' '}
                      <span style={{ color: isCorrect ? tk.green : tk.red, fontWeight: 700 }}>
                        {skipped ? 'Skipped' : String(answer)}
                      </span>
                    </Typography>
                    {!isCorrect && !skipped && (
                      <Typography sx={{ fontSize: '11px', color: tk.text3 }}>
                        Correct:{' '}
                        <span style={{ color: tk.green, fontWeight: 700 }}>
                          {String(question?.correct)}
                        </span>
                      </Typography>
                    )}
                  </Box>

                  {question?.explanation && (
                    <Typography sx={{
                      fontSize: '12px', color: tk.text3,
                      mt: '8px', fontStyle: 'italic', lineHeight: 1.5,
                    }}>
                      {question.explanation}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>

      </Box>
    </Box>
  );
}