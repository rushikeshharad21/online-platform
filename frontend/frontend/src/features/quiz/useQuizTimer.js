// src/features/quiz/useQuizTimer.js
import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectEndsAt, selectQuizStatus, quizEnded } from './quizSlice';

/**
 * Calls onTick(secondsLeft) every animation frame.
 * Uses wall-clock diff — no drift unlike setInterval.
 * Auto-dispatches quizEnded() when time runs out.
 */
export function useQuizTimer(onTick) {
  const endsAt   = useSelector(selectEndsAt);
  const status   = useSelector(selectQuizStatus);
  const dispatch = useDispatch();
  const rafRef   = useRef(null);

  const tick = useCallback(() => {
    if (status !== 'in_progress') return;

    const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
    onTick(remaining);

    if (remaining <= 0) {
      dispatch(quizEnded());
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [endsAt, status, dispatch, onTick]);

  useEffect(() => {
    if (status !== 'in_progress') return;
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick, status]);
}