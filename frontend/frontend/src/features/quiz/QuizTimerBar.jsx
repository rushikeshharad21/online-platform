// src/features/quiz/QuizTimerBar.jsx
import React, { useState, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectDuration } from './quizSlice';
import { useQuizTimer } from './useQuizTimer';

function fmt(s) {
  const m   = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export function QuizTimerBar() {
  const duration           = useSelector(selectDuration);
  const [secondsLeft, set] = useState(duration);

  const onTick = useCallback((s) => set(s), []);
  useQuizTimer(onTick);

  const pct      = duration > 0 ? (secondsLeft / duration) * 100 : 0;
  const danger   = pct < 15;
  const warn     = pct < 35;
  const barColor = danger ? '#f87171' : warn ? '#fbbf24' : '#4f8ef7';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
      <Typography sx={{
        fontSize: '15px', fontWeight: 700,
        color: danger ? '#f87171' : '#f0f4ff',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.03em',
        minWidth: '52px',
        transition: 'color 0.3s',
      }}>
        {fmt(secondsLeft)}
      </Typography>

      <Box sx={{
        flex: 1, height: '5px', borderRadius: '3px',
        background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
      }}>
        <Box sx={{
          height: '100%', borderRadius: '3px',
          width: `${pct}%`,
          background: barColor,
          transition: 'width 1s linear, background 0.5s',
          boxShadow: danger ? `0 0 10px #f87171` : 'none',
        }} />
      </Box>
    </Box>
  );
}