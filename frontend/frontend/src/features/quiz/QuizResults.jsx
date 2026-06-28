// src/features/quiz/QuizResults.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import CheckCircleOutlineIcon  from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon      from '@mui/icons-material/CancelOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutlined';
import {
  selectResults,
  selectQuestions,
  selectAnswers,
} from './quizSlice';

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

/* ── Score Ring ──────────────────────────────────────────────── */
const ScoreRing = ({ pct }) => {
  const r     = 54;
  const circ  = 2 * Math.PI * r;
  const dash  = circ * (1 - pct / 100);
  const color = pct >= 70 ? tk.green : pct >= 40 ? tk.amber : tk.red;

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
          fontSize: '28px', fontWeight: 800, color: tk.text1,
          lineHeight: 1, letterSpacing: '-0.04em',
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

/* ── Main ────────────────────────────────────────────────────── */
export function QuizResults() {
  const results   = useSelector(selectResults);
  const questions = useSelector(selectQuestions);
  const answers   = useSelector(selectAnswers);
  const pct       = Math.round((results.correct / results.total) * 100);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: tk.bg, pt: 6, pb: 12, px: 2 }}>
      <Box sx={{ maxWidth: '760px', mx: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── Hero ─────────────────────────────────────────── */}
        <Box sx={{
          ...glass(),
          p: '32px', display: 'flex',
          alignItems: 'center', gap: '32px', flexWrap: 'wrap',
        }}>
          <ScoreRing pct={pct} />
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <Typography sx={{
              fontSize: 'clamp(1.4rem,3vw,1.9rem)', fontWeight: 700,
              color: tk.text1, letterSpacing: '-0.03em', mb: '6px',
            }}>
              {pct >= 70 ? 'Well done!' : pct >= 40 ? 'Keep going.' : 'Needs work.'}
            </Typography>
            <Typography sx={{ fontSize: '13px', color: tk.text2, mb: '20px' }}>
              {results.correct} correct · {results.wrong} wrong · {results.skipped} skipped
            </Typography>

            <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { label: 'Correct', value: results.correct, color: tk.green, Icon: CheckCircleOutlineIcon  },
                { label: 'Wrong',   value: results.wrong,   color: tk.red,   Icon: CancelOutlinedIcon      },
                { label: 'Skipped', value: results.skipped, color: tk.amber, Icon: RemoveCircleOutlineIcon },
              ].map(({ label, value, color, Icon }) => (
                <Box key={label} sx={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  px: '14px', py: '8px', borderRadius: '9px',
                  background: `${color}18`,
                  border: `1px solid ${color}30`,
                }}>
                  <Icon sx={{ fontSize: '14px', color }} />
                  <Typography sx={{ fontSize: '12px', fontWeight: 700, color }}>
                    {value} {label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ── Difficulty Breakdown ──────────────────────────── */}
        <Box sx={{ ...glass(), p: '24px' }}>
          <Typography sx={{
            fontSize: '11px', fontWeight: 700, color: tk.text3,
            letterSpacing: '0.1em', textTransform: 'uppercase', mb: '16px',
          }}>
            By Difficulty
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['easy', 'medium', 'hard'].map((d) => {
              const { c, t } = results.byDifficulty[d];
              const p        = t > 0 ? Math.round((c / t) * 100) : 0;
              const color    = d === 'easy' ? tk.green : d === 'medium' ? tk.amber : tk.red;
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

        {/* ── Per Question Review ───────────────────────────── */}
        <Box sx={{ ...glass(), p: '24px' }}>
          <Typography sx={{
            fontSize: '11px', fontWeight: 700, color: tk.text3,
            letterSpacing: '0.1em', textTransform: 'uppercase', mb: '16px',
          }}>
            Question Review
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {questions.map((q, i) => {
              const ua        = answers[q._id];
              const isCorrect = q.type === 'INTEGER'
                ? Number(ua) === Number(q.correct)
                : ua === q.correct;
              const skipped   = ua === undefined || ua === '';
              const border    = skipped ? tk.amber : isCorrect ? tk.green : tk.red;

              return (
                <Box key={q._id} sx={{
                  px: '16px', py: '14px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.025)',
                  border: `1px solid ${border}28`,
                  borderLeft: `3px solid ${border}`,
                }}>
                  <Typography sx={{ fontSize: '12px', color: tk.text2, mb: '4px' }}>
                    Q{i + 1} ·{' '}
                    <span style={{ textTransform: 'capitalize', color: border }}>
                      {q.difficulty}
                    </span>{' '}
                    · {q.type}
                  </Typography>

                  <Typography sx={{
                    fontSize: '13px', color: tk.text1,
                    mb: '8px', lineHeight: 1.5,
                  }}>
                    {q.text}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <Typography sx={{ fontSize: '11px', color: tk.text3 }}>
                      Your answer:{' '}
                      <span style={{ color: isCorrect ? tk.green : tk.red, fontWeight: 700 }}>
                        {skipped ? 'Skipped' : String(ua)}
                      </span>
                    </Typography>
                    {!isCorrect && !skipped && (
                      <Typography sx={{ fontSize: '11px', color: tk.text3 }}>
                        Correct:{' '}
                        <span style={{ color: tk.green, fontWeight: 700 }}>
                          {String(q.correct)}
                        </span>
                      </Typography>
                    )}
                  </Box>

                  {q.explanation && (
                    <Typography sx={{
                      fontSize: '12px', color: tk.text3,
                      mt: '8px', fontStyle: 'italic', lineHeight: 1.5,
                    }}>
                      {q.explanation}
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