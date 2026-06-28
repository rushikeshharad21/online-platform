// src/pages/instructor/CreateTest.jsx
import React, { useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField,
  MenuItem, IconButton, Alert, Tooltip,
} from '@mui/material';
import AddIcon           from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import UploadFileIcon    from '@mui/icons-material/UploadFile';
import { createTest }    from '../../features/tests/testSlice';

const tk = {
  bg:         '#07111f',
  surface:    'rgba(255,255,255,0.045)',
  border:     'rgba(255,255,255,0.08)',
  text1:      '#1ee692',
  text2:      'rgba(200,215,240,0.65)',
  text3:      'rgba(160,185,220,0.38)',
  blue:       '#4f8ef7',
  blueBorder: 'rgba(79,142,247,0.28)',
  blueGlow:   'rgba(79,142,247,0.12)',
  green:      '#34d399',
  amber:      '#fbbf24',
  red:        '#f87171',
  r:          '12px',
};

const glass = (extra = {}) => ({
  background:     tk.surface,
  border:         `1px solid ${tk.border}`,
  backdropFilter: 'blur(20px)',
  borderRadius:   tk.r,
  ...extra,
});

const inputSx = {
  '& .MuiOutlinedInput-root': {
    color: tk.text1, fontSize: '13px',
    '& fieldset':          { borderColor: tk.border, borderRadius: '8px' },
    '&:hover fieldset':    { borderColor: 'rgba(255,255,255,0.18)' },
    '&.Mui-focused fieldset': { borderColor: tk.blue },
  },
  '& .MuiInputLabel-root':            { color: tk.text3, fontSize: '13px' },
  '& .MuiInputLabel-root.Mui-focused': { color: tk.blue },
  '& .MuiSelect-icon':                { color: tk.text3 },
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const DIFF_COLOR    = { easy: tk.green, medium: tk.amber, hard: tk.red };

const BLANK_QUESTION = () => ({
  _tempId:     Math.random().toString(36).slice(2),
  type:        'MCQ',
  difficulty:  'easy',
  text:        '',
  options:     ['', '', '', ''],
  correct:     'A',
  explanation: '',
});

/* ── Question Editor ─────────────────────────────────────────── */
const QuestionEditor = React.memo(({ q, index, onChange, onRemove }) => {
  const update = (field, val) => onChange(index, { ...q, [field]: val });

  return (
    <Box sx={{ ...glass(), p: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Top row — type / difficulty / delete */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <Box sx={{
          minWidth: '28px', height: '28px', borderRadius: '7px',
          background: `${DIFF_COLOR[q.difficulty]}18`,
          border: `1px solid ${DIFF_COLOR[q.difficulty]}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Typography sx={{ fontSize: '11px', fontWeight: 800, color: DIFF_COLOR[q.difficulty] }}>
            {index + 1}
          </Typography>
        </Box>

        <TextField
          select size="small" label="Type" value={q.type}
          onChange={e => update('type', e.target.value)}
          sx={{ ...inputSx, width: '110px' }}
        >
          {['MCQ', 'INTEGER'].map(t => (
            <MenuItem key={t} value={t} sx={{ color: tk.text1, fontSize: '13px' }}>{t}</MenuItem>
          ))}
        </TextField>

        <TextField
          select size="small" label="Difficulty" value={q.difficulty}
          onChange={e => update('difficulty', e.target.value)}
          sx={{ ...inputSx, width: '130px' }}
        >
          {['easy', 'medium', 'hard'].map(d => (
            <MenuItem key={d} value={d} sx={{ color: DIFF_COLOR[d], fontSize: '13px', textTransform: 'capitalize' }}>
              {d}
            </MenuItem>
          ))}
        </TextField>

        <Tooltip title="Remove question" arrow>
          <IconButton
            onClick={() => onRemove(index)}
            sx={{ ml: 'auto', color: tk.red, '&:hover': { background: 'rgba(248,113,113,0.1)' } }}
          >
            <DeleteOutlineIcon sx={{ fontSize: '18px' }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Question text */}
      <TextField
        size="small" label="Question text" multiline minRows={2}
        value={q.text} onChange={e => update('text', e.target.value)}
        fullWidth sx={inputSx} inputProps={{ maxLength: 600 }}
      />

      {/* MCQ options */}
      {q.type === 'MCQ' ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Typography sx={{ fontSize: '11px', color: tk.text3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Options — click letter to mark correct
          </Typography>
          {q.options.map((opt, oi) => {
            const label     = OPTION_LABELS[oi];
            const isCorrect = q.correct === label;
            return (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box
                  onClick={() => update('correct', label)}
                  sx={{
                    minWidth: '28px', height: '28px', borderRadius: '7px',
                    background: isCorrect ? tk.blue : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isCorrect ? tk.blue : tk.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0,
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                >
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: isCorrect ? '#fff' : tk.text3 }}>
                    {label}
                  </Typography>
                </Box>
                <TextField
                  size="small" placeholder={`Option ${label}`}
                  value={opt}
                  onChange={e => {
                    const opts = [...q.options];
                    opts[oi]   = e.target.value;
                    update('options', opts);
                  }}
                  fullWidth sx={inputSx} inputProps={{ maxLength: 200 }}
                />
              </Box>
            );
          })}
        </Box>
      ) : (
        <TextField
          size="small" label="Correct integer answer" type="number"
          value={q.correct} onChange={e => update('correct', e.target.value)}
          sx={{ ...inputSx, width: '220px' }}
        />
      )}

      {/* Explanation */}
      <TextField
        size="small" label="Explanation (shown after attempt)" multiline minRows={1}
        value={q.explanation} onChange={e => update('explanation', e.target.value)}
        fullWidth sx={inputSx} inputProps={{ maxLength: 400 }}
      />
    </Box>
  );
});

/* ── Page ────────────────────────────────────────────────────── */
export default function CreateTest() {
  const { courseId } = useParams();
  const dispatch     = useDispatch();
  const navigate     = useNavigate();

  const [title,           setTitle]     = useState('');
  const [description,     setDesc]      = useState('');
  const [durationMinutes, setDuration]  = useState(30);
  const [questions,       setQuestions] = useState([BLANK_QUESTION()]);
  const [error,           setError]     = useState('');
  const [saving,          setSaving]    = useState(false);
  const fileRef = useRef();

  const addQuestion    = () => setQuestions(prev => [...prev, BLANK_QUESTION()]);
  const removeQuestion = (i) => setQuestions(prev => prev.filter((_, idx) => idx !== i));
  const updateQuestion = useCallback((i, updated) => {
    setQuestions(prev => { const copy = [...prev]; copy[i] = updated; return copy; });
  }, []);

  // Bulk JSON import
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed)) throw new Error('Must be an array');
        const imported = parsed.map(q => ({
          ...BLANK_QUESTION(), ...q,
          _tempId: Math.random().toString(36).slice(2),
        }));
        setQuestions(prev => [...prev, ...imported]);
      } catch {
        setError('Invalid JSON — must be an array of question objects.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const validate = () => {
    if (!title.trim())          return 'Test title is required.';
    if (durationMinutes < 1)    return 'Duration must be at least 1 minute.';
    if (questions.length === 0) return 'Add at least one question.';
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) return `Q${i + 1}: Question text is empty.`;
      if (q.type === 'MCQ') {
        if (q.options.some(o => !o.trim())) return `Q${i + 1}: All 4 options are required.`;
        if (!q.correct)                     return `Q${i + 1}: Select the correct option.`;
      }
      if (q.type === 'INTEGER' && q.correct === '') return `Q${i + 1}: Correct integer answer required.`;
    }
    return null;
  };

  const handleSave = async (publish = false) => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setSaving(true);
    try {
      await dispatch(createTest({
        courseId,
        title:           title.trim(),
        description:     description.trim(),
        durationSeconds: durationMinutes * 60,
        questions:       questions.map(({ _tempId, ...q }) => q),
        isPublished:     publish,
      })).unwrap();
      navigate(`/instructor/courses/${courseId}/tests`);
    } catch (e) {
      setError(e);
    } finally {
      setSaving(false);
    }
  };

  const questionsByDiff = { easy: 0, medium: 0, hard: 0 };
  questions.forEach(q => questionsByDiff[q.difficulty]++);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: tk.bg, pt: 5, pb: 12, px: 2 }}>
      <Box sx={{ maxWidth: '860px', mx: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 'clamp(1.4rem,3vw,1.8rem)', fontWeight: 700, color: tk.text1, letterSpacing: '-0.03em' }}>
              Create test
            </Typography>
            <Typography sx={{ fontSize: '13px', color: tk.text2, mt: '4px' }}>
              {questions.length} question{questions.length !== 1 ? 's' : ''} ·{' '}
              <span style={{ color: tk.green  }}>{questionsByDiff.easy} easy</span> ·{' '}
              <span style={{ color: tk.amber  }}>{questionsByDiff.medium} medium</span> ·{' '}
              <span style={{ color: tk.red    }}>{questionsByDiff.hard} hard</span>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button onClick={() => handleSave(false)} disabled={saving} sx={ghostBtnSx}>Save draft</Button>
            <Button onClick={() => handleSave(true)}  disabled={saving} sx={primaryBtnSx}>Publish</Button>
          </Box>
        </Box>

        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

        {/* Test meta */}
        <Box sx={{ ...glass(), p: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: tk.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Test details
          </Typography>
          <TextField size="small" label="Title" value={title}
            onChange={e => setTitle(e.target.value)} fullWidth sx={inputSx} inputProps={{ maxLength: 120 }} />
          <TextField size="small" label="Description (optional)" multiline minRows={2}
            value={description} onChange={e => setDesc(e.target.value)} fullWidth sx={inputSx} inputProps={{ maxLength: 400 }} />
          <TextField size="small" label="Duration (minutes)" type="number" value={durationMinutes}
            onChange={e => setDuration(Number(e.target.value))}
            sx={{ ...inputSx, width: '200px' }} inputProps={{ min: 1, max: 360 }} />
        </Box>

        {/* Questions list */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {questions.map((q, i) => (
            <QuestionEditor key={q._tempId} q={q} index={i} onChange={updateQuestion} onRemove={removeQuestion} />
          ))}
        </Box>

        {/* Add / Import */}
        <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button startIcon={<AddIcon />} onClick={addQuestion} sx={ghostBtnSx}>
            Add question
          </Button>
          <Button startIcon={<UploadFileIcon />} onClick={() => fileRef.current?.click()} sx={ghostBtnSx}>
            Import JSON
          </Button>
          <input ref={fileRef} type="file" accept=".json" hidden onChange={handleImport} />
        </Box>

        {/* Import format hint */}
        <Box sx={{ ...glass({ border: `1px solid rgba(79,142,247,0.15)`, background: tk.blueGlow }), p: '16px' }}>
          <Typography sx={{ fontSize: '11px', color: tk.text3, letterSpacing: '0.06em', textTransform: 'uppercase', mb: '8px' }}>
            Bulk import format
          </Typography>
          <Box component="pre" sx={{ fontSize: '11px', color: tk.text2, m: 0, overflowX: 'auto', lineHeight: 1.7 }}>
{`[
  { "type": "MCQ", "difficulty": "easy", "text": "Question?",
    "options": ["A","B","C","D"], "correct": "B", "explanation": "..." },
  { "type": "INTEGER", "difficulty": "hard", "text": "Question?",
    "correct": 42, "explanation": "..." }
]`}
          </Box>
        </Box>

      </Box>
    </Box>
  );
}

const ghostBtnSx = {
  fontSize: '12px', fontWeight: 600, px: '16px', py: '8px', borderRadius: '9px',
  color: 'rgba(190,210,255,0.75)', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  '&:hover': { background: 'rgba(255,255,255,0.09)' },
};
const primaryBtnSx = {
  fontSize: '12px', fontWeight: 700, px: '20px', py: '8px', borderRadius: '9px',
  background: 'linear-gradient(135deg,#3b7ef6,#5b5ef7)',
  boxShadow: '0 0 0 1px rgba(79,142,247,0.35), 0 8px 24px rgba(59,126,246,0.28)',
  color: '#fff',
  '&:hover': { background: 'linear-gradient(135deg,#2d72f0,#5256f3)' },
};