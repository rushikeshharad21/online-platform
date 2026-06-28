// src/pages/instructor/InstructorTestResults.jsx
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Avatar, CircularProgress, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchTestResults } from '../../features/tests/testSlice';

// ── Recharts loaded lazily — only downloads when this page is visited ──
const LazyChart = lazy(() =>
  import('recharts').then(mod => ({
    default: function Chart({ data }) {
      const {
        BarChart, Bar, XAxis, YAxis, CartesianGrid,
        Tooltip, ResponsiveContainer, Cell,
      } = mod;

      const DIFF_COLOR = { easy: '#34d399', medium: '#fbbf24', hard: '#f87171' };
      const tk = {
        text1: '#f0f4ff', text3: 'rgba(160,185,220,0.38)',
        border: 'rgba(255,255,255,0.08)',
      };

      return (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barSize={22} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: tk.text3, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis unit="%" tick={{ fill: tk.text3, fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              contentStyle={{
                background: '#0d1e36',
                border: `1px solid ${tk.border}`,
                borderRadius: '8px',
                fontSize: '12px',
                color: tk.text1,
              }}
              formatter={(v) => [`${v}%`, 'Accuracy']}
            />
            <Bar dataKey="accuracy" radius={[5, 5, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={DIFF_COLOR[entry.diff]} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    },
  }))
);

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

const pctColor = (p) => p >= 70 ? tk.green : p >= 40 ? tk.amber : tk.red;
const DIFF_COLOR = { easy: tk.green, medium: tk.amber, hard: tk.red };

/* ── Score Bar ───────────────────────────────────────────────── */
const ScoreBar = ({ pct }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
    <Box sx={{ flex: 1, height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.07)' }}>
      <Box sx={{
        height: '100%', borderRadius: '3px',
        width: `${pct}%`, background: pctColor(pct),
        transition: 'width 0.6s ease',
      }} />
    </Box>
    <Typography sx={{
      fontSize: '12px', fontWeight: 700, color: pctColor(pct),
      minWidth: '38px', textAlign: 'right', fontVariantNumeric: 'tabular-nums',
    }}>
      {pct}%
    </Typography>
  </Box>
);

/* ── Page ────────────────────────────────────────────────────── */
export default function InstructorTestResults() {
  const { testId }  = useParams();
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const { results, isLoading } = useSelector(s => s.tests);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    dispatch(fetchTestResults(testId));
  }, [testId, dispatch]);

  if (isLoading || !results) return (
    <Box sx={{
      minHeight: '100vh', bgcolor: tk.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <CircularProgress sx={{ color: tk.blue }} />
    </Box>
  );

  const { test, summary, perStudent, perQuestion } = results;

  const chartData = perQuestion.map((q, i) => ({
    name:     `Q${i + 1}`,
    accuracy: q.total > 0 ? Math.round((q.correct / q.total) * 100) : 0,
    diff:     q.difficulty,
  }));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: tk.bg, pt: 5, pb: 12, px: 2 }}>
      <Box sx={{ maxWidth: '960px', mx: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Header */}
        <Box>
          <Button
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackIcon />}
            sx={{ color: tk.text3, fontSize: '12px', mb: '12px', '&:hover': { color: tk.text2 } }}
          >
            Back
          </Button>
          <Typography sx={{
            fontSize: 'clamp(1.3rem,3vw,1.8rem)', fontWeight: 700,
            color: tk.text1, letterSpacing: '-0.03em',
          }}>
            {test.title}
          </Typography>
          <Typography sx={{ fontSize: '13px', color: tk.text2, mt: '4px' }}>
            {test.totalQuestions} questions · {test.durationSeconds / 60} min
          </Typography>
        </Box>

        {/* Summary tiles */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(4,1fr)' },
          gap: '12px',
        }}>
          {[
            { label: 'Attempts',  value: summary.totalAttempts, color: tk.blue  },
            { label: 'Class avg', value: `${summary.avgPct}%`,  color: tk.green },
            { label: 'Highest',   value: `${summary.highest}%`, color: tk.green },
            { label: 'Lowest',    value: `${summary.lowest}%`,  color: tk.red   },
          ].map(({ label, value, color }) => (
            <Box key={label} sx={{ ...glass(), p: '18px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Typography sx={{
                fontSize: '10px', fontWeight: 700, color: tk.text3,
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                {label}
              </Typography>
              <Typography sx={{
                fontSize: '28px', fontWeight: 800, color,
                letterSpacing: '-0.04em', lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Per-question accuracy chart */}
        <Box sx={{ ...glass(), p: '24px' }}>
          <Typography sx={{
            fontSize: '11px', fontWeight: 700, color: tk.text3,
            textTransform: 'uppercase', letterSpacing: '0.1em', mb: '20px',
          }}>
            Per-question accuracy
          </Typography>
          {perQuestion.length === 0 ? (
            <Typography sx={{ color: tk.text3, fontSize: '13px', textAlign: 'center', py: '24px' }}>
              No attempts yet — chart will appear once students submit.
            </Typography>
          ) : (
            <>
              <Suspense fallback={
                <Box sx={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress size={24} sx={{ color: tk.blue }} />
                </Box>
              }>
                <LazyChart data={chartData} />
              </Suspense>

              {/* Legend */}
              <Box sx={{ display: 'flex', gap: '16px', mt: '10px', flexWrap: 'wrap' }}>
                {Object.entries(DIFF_COLOR).map(([d, c]) => (
                  <Box key={d} sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Box sx={{ width: '8px', height: '8px', borderRadius: '2px', background: c }} />
                    <Typography sx={{ fontSize: '11px', color: tk.text3, textTransform: 'capitalize' }}>{d}</Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Box>

        {/* Per-student table */}
        <Box sx={{ ...glass(), p: '24px' }}>
          <Typography sx={{
            fontSize: '11px', fontWeight: 700, color: tk.text3,
            textTransform: 'uppercase', letterSpacing: '0.1em', mb: '16px',
          }}>
            Student results
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {perStudent.length === 0 ? (
              <Typography sx={{ color: tk.text3, fontSize: '13px', textAlign: 'center', py: '24px' }}>
                No attempts yet.
              </Typography>
            ) : perStudent.map((s, i) => (
              <Box key={s.student._id}>
                <Box
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    px: '14px', py: '12px', borderRadius: '10px',
                    background: expanded === i ? 'rgba(79,142,247,0.08)' : 'rgba(255,255,255,0.025)',
                    border: `1px solid ${expanded === i ? 'rgba(79,142,247,0.2)' : tk.border}`,
                    cursor: 'pointer',
                    transition: 'background 0.15s, border-color 0.15s',
                    '&:hover': { background: 'rgba(255,255,255,0.05)' },
                  }}
                >
                  <Avatar src={s.student.avatar} sx={{ width: 32, height: 32, fontSize: '12px', bgcolor: tk.blue }}>
                    {s.student.name?.[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: tk.text1 }}>
                      {s.student.name}
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: tk.text3 }}>
                      {s.student.email}
                    </Typography>
                  </Box>
                  <ScoreBar pct={s.percentage} />
                  <Typography sx={{ fontSize: '11px', color: tk.text3, minWidth: '80px', textAlign: 'right' }}>
                    {s.timeTaken ? `${Math.floor(s.timeTaken / 60)}m ${s.timeTaken % 60}s` : '—'}
                  </Typography>
                </Box>

                {expanded === i && (
                  <Box sx={{ mx: '14px', mt: '4px', mb: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {s.answers.map((ans, ai) => {
                      const qd = perQuestion[ai];
                      return (
                        <Box key={ai} sx={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          px: '14px', py: '10px', borderRadius: '8px',
                          background: 'rgba(255,255,255,0.02)',
                          borderLeft: `3px solid ${ans.isCorrect ? tk.green : tk.red}`,
                        }}>
                          <Typography sx={{ fontSize: '11px', color: tk.text3, minWidth: '30px' }}>
                            Q{ai + 1}
                          </Typography>
                          <Typography sx={{ fontSize: '12px', color: tk.text2, flex: 1 }} noWrap>
                            {qd?.text}
                          </Typography>
                          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: ans.isCorrect ? tk.green : tk.red }}>
                            {ans.answer !== null ? String(ans.answer) : 'Skipped'}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>

      </Box>
    </Box>
  );
}