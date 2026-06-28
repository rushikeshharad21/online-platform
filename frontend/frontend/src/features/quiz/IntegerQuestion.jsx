// src/features/quiz/IntegerQuestion.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, InputBase } from '@mui/material';

const tk = {
  text1:      '#f0f4ff',
  text2:      'rgba(200,215,240,0.65)',
  text3:      'rgba(160,185,220,0.38)',
  border:     'rgba(255,255,255,0.08)',
  blue:       '#4f8ef7',
  blueBorder: 'rgba(79,142,247,0.28)',
  blueGlow:   'rgba(79,142,247,0.1)',
};

export const IntegerQuestion = React.memo(function IntegerQuestion({ question, value, onChange }) {
  const [local, setLocal] = useState(value ?? '');

  // Reset local state when question changes
  useEffect(() => {
    setLocal(value ?? '');
  }, [question._id, value]);

  const handleChange = (e) => {
    const raw = e.target.value;
    // Allow: empty, minus sign, or valid integer
    if (raw === '' || raw === '-' || /^-?\d+$/.test(raw)) {
      setLocal(raw);
      if (raw !== '' && raw !== '-') onChange(raw);
    }
  };

  return (
    <Box>
      <Typography sx={{
        fontSize: '12px', color: tk.text3, mb: '12px',
        letterSpacing: '0.06em', textTransform: 'uppercase',
      }}>
        Enter integer answer
      </Typography>

      <Box sx={{
        display: 'inline-flex', alignItems: 'center',
        px: '18px', py: '14px',
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${local ? tk.blueBorder : tk.border}`,
        borderRadius: '10px', minWidth: '200px',
        transition: 'border-color 0.15s, background 0.15s',
        '&:focus-within': {
          background: tk.blueGlow,
          borderColor: tk.blue,
        },
      }}>
        <InputBase
          value={local}
          onChange={handleChange}
          placeholder="e.g. 42"
          inputProps={{
            inputMode: 'numeric',
            'aria-label': 'Integer answer',
            style: {
              fontSize: '28px',
              fontWeight: 700,
              color: tk.text1,
              caretColor: tk.blue,
              letterSpacing: '-0.03em',
              width: '140px',
              textAlign: 'center',
            },
          }}
          sx={{
            '& input::placeholder': { color: tk.text3, opacity: 1 },
          }}
        />
      </Box>
    </Box>
  );
});