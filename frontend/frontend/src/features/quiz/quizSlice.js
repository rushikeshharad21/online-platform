// src/features/quiz/quizSlice.js
import { createSlice } from '@reduxjs/toolkit';

const DIFFICULTY_ORDER = ['easy', 'medium', 'hard'];

function sortByDifficulty(questions) {
  return [...questions].sort(
    (a, b) =>
      DIFFICULTY_ORDER.indexOf(a.difficulty) -
      DIFFICULTY_ORDER.indexOf(b.difficulty)
  );
}

const initialState = {
  status:          'idle',  // idle | in_progress | completed
  questions:       [],
  currentIndex:    0,
  answers:         {},      // { [questionId]: userAnswer }
  flagged:         {},      // { [questionId]: boolean }
  startedAt:       null,    // epoch ms
  endsAt:          null,    // epoch ms
  durationSeconds: 0,
  config:          null,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    quizLoaded(state, { payload: { questions, config } }) {
      state.status          = 'in_progress';
      state.questions       = sortByDifficulty(questions);
      state.currentIndex    = 0;
      state.answers         = {};
      state.flagged         = {};
      state.config          = config;
      state.durationSeconds = config.durationSeconds;
      state.startedAt       = Date.now();
      state.endsAt          = Date.now() + config.durationSeconds * 1000;
    },

    answerSubmitted(state, { payload: { questionId, answer } }) {
      if (state.status !== 'in_progress') return;
      state.answers[questionId] = answer;
    },

    navigated(state, { payload: index }) {
      if (index >= 0 && index < state.questions.length) {
        state.currentIndex = index;
      }
    },

    flagToggled(state, { payload: questionId }) {
      state.flagged[questionId] = !state.flagged[questionId];
    },

    quizEnded(state) {
      state.status = 'completed';
    },

    quizReset() {
      return initialState;
    },
  },
});

export const {
  quizLoaded,
  answerSubmitted,
  navigated,
  flagToggled,
  quizEnded,
  quizReset,
} = quizSlice.actions;

// ── Selectors ──────────────────────────────────────────────────
export const selectQuizStatus   = (s) => s.quiz.status;
export const selectQuestions    = (s) => s.quiz.questions;
export const selectCurrentIndex = (s) => s.quiz.currentIndex;
export const selectCurrentQ     = (s) => s.quiz.questions[s.quiz.currentIndex];
export const selectAnswers      = (s) => s.quiz.answers;
export const selectEndsAt       = (s) => s.quiz.endsAt;
export const selectStartedAt    = (s) => s.quiz.startedAt;
export const selectDuration     = (s) => s.quiz.durationSeconds;
export const selectConfig       = (s) => s.quiz.config;
export const selectFlagged      = (s) => s.quiz.flagged;

export const selectResults = (s) => {
  const { questions, answers } = s.quiz;
  let correct = 0, wrong = 0, skipped = 0;

  const byDifficulty = {
    easy:   { c: 0, t: 0 },
    medium: { c: 0, t: 0 },
    hard:   { c: 0, t: 0 },
  };
  const byType = {
    MCQ:     { c: 0, t: 0 },
    INTEGER: { c: 0, t: 0 },
  };

  questions.forEach((q) => {
    const ua        = answers[q._id];
    const isCorrect = q.type === 'INTEGER'
      ? Number(ua) === Number(q.correct)
      : ua === q.correct;

    byDifficulty[q.difficulty].t++;
    byType[q.type].t++;

    if (ua === undefined || ua === '') {
      skipped++;
      return;
    }

    if (isCorrect) {
      correct++;
      byDifficulty[q.difficulty].c++;
      byType[q.type].c++;
    } else {
      wrong++;
    }
  });

  return {
    correct,
    wrong,
    skipped,
    total: questions.length,
    byDifficulty,
    byType,
  };
};

export default quizSlice.reducer;