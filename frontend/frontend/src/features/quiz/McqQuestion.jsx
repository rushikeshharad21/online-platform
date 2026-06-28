// src/features/quiz/McqQuestion.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const tk = {
  text1:      '#5d7ccf',
  text2:      'rgba(200,215,240,0.65)',
  border:     'rgba(255,255,255,0.08)',
  blue:       '#4f8ef7',
  blueGlow:   'rgba(79,142,247,0.18)',
  blueBorder: 'rgba(79,142,247,0.28)',
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export const McqQuestion = React.memo(function McqQuestion({ question, selected, onChange }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {question.options.map((opt, i) => {
        const label    = OPTION_LABELS[i];
        const isChosen = selected === label;

        return (
          <Box
            key={label}
            role="radio"
            aria-checked={isChosen}
            tabIndex={0}
            onClick={() => onChange(label)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onChange(label)}
            sx={{
              display: 'flex', alignItems: 'center', gap: '14px',
              px: '16px', py: '13px', borderRadius: '10px',
              background: isChosen ? tk.blueGlow : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isChosen ? tk.blueBorder : tk.border}`,
              cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s',
              userSelect: 'none',
              '&:hover': {
                background: isChosen
                  ? 'rgba(79,142,247,0.26)'
                  : 'rgba(255,255,255,0.06)',
                borderColor: isChosen
                  ? tk.blue
                  : 'rgba(255,255,255,0.16)',
              },
            }}
          >
            {/* Label badge */}
            <Box sx={{
              minWidth: '28px', height: '28px', borderRadius: '7px',
              background: isChosen ? tk.blue : 'rgba(255,255,255,0.07)',
              border: `1px solid ${isChosen ? tk.blue : tk.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Typography sx={{
                fontSize: '11px', fontWeight: 700,
                color: isChosen ? '#18856d' : tk.text2,
              }}>
                {label}
              </Typography>
            </Box>

            <Typography sx={{
              fontSize: '14px',
              color: isChosen ? tk.text1 : tk.text2,
              lineHeight: 1.5,
            }}>
              {opt}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
});