// src/pages/student/AttemptTest.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import {
  fetchTestForAttempt,
  submitTestAttempt,
} from '../../features/tests/testSlice';
import {
  quizLoaded,
  quizReset,
  selectQuizStatus,
  selectAnswers,
  selectStartedAt,
} from '../../features/quiz/quizSlice';
import { QuizContainer } from '../../features/quiz/QuizContainer';

export default function AttemptTest() {
  const { testId }  = useParams();
  const dispatch    = useDispatch();
  const navigate    = useNavigate();

  const quizStatus  = useSelector(selectQuizStatus);
  const answers     = useSelector(selectAnswers);
  const startedAt   = useSelector(selectStartedAt);

  const { activeTest, isLoading, isError, message } = useSelector(s => s.tests);

  // Step 1 — fetch test, load into quiz engine
  useEffect(() => {
    dispatch(quizReset());
    dispatch(fetchTestForAttempt(testId))
      .unwrap()
      .then((test) => {
        dispatch(quizLoaded({
          questions: test.questions,
          config: {
            durationSeconds: test.durationSeconds,
            allowReview:     test.allowReview ?? true,
          },
        }));
      })
      .catch((err) => {
        // Already attempted — go straight to result
        if (typeof err === 'string' && err.includes('Already attempted')) {
          navigate(`/student/tests/${testId}/result`, { replace: true });
        }
      });

    // Reset quiz state on unmount
    return () => { dispatch(quizReset()); };
  }, [testId, dispatch, navigate]);

  // Step 2 — when quiz ends, submit to backend
  useEffect(() => {
    if (quizStatus !== 'completed' || !activeTest) return;

    const timeTakenSeconds = startedAt
      ? Math.round((Date.now() - startedAt) / 1000)
      : null;

    dispatch(submitTestAttempt({ testId, answers, timeTakenSeconds }))
      .unwrap()
      .then(() => navigate(`/student/tests/${testId}/result`, { replace: true }))
      .catch(console.error);
  }, [quizStatus, testId, answers, startedAt, activeTest, dispatch, navigate]);

  // Error state
  if (isError) return (
    <Box sx={{
      minHeight: '100vh', bgcolor: '#07111f',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column', gap: 2,
    }}>
      <Alert severity="error">{message}</Alert>
      <Button
        onClick={() => navigate(-1)}
        sx={{ color: '#4f8ef7' }}
      >
        Go back
      </Button>
    </Box>
  );

  // Loading state
  if (isLoading || quizStatus === 'idle') return (
    <Box sx={{
      minHeight: '100vh', bgcolor: '#07111f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <CircularProgress sx={{ color: '#4f8ef7' }} />
    </Box>
  );

  return <QuizContainer />;
}