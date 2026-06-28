// src/features/tests/testSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE = '/api/tests';

/* ── Thunks ──────────────────────────────────────────────────── */
export const createTest = createAsyncThunk('tests/create', async (data, { getState, rejectWithValue }) => {
  try {
    const { token } = getState().auth.user;
    const res = await axios.post(BASE, data, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message ?? e.message); }
});

export const fetchCourseTests = createAsyncThunk('tests/byCourse', async (courseId, { getState, rejectWithValue }) => {
  try {
    const { token } = getState().auth.user;
    const res = await axios.get(`${BASE}/course/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
      console.log("API Response:", res.data); 
    return res.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message ?? e.message); }
});

export const toggleTestPublish = createAsyncThunk('tests/togglePublish', async (testId, { getState, rejectWithValue }) => {
  try {
    const { token } = getState().auth.user;
    const res = await axios.patch(`${BASE}/${testId}/publish`, {}, { headers: { Authorization: `Bearer ${token}` } });
    return { testId, isPublished: res.data.isPublished };
  } catch (e) { return rejectWithValue(e.response?.data?.message ?? e.message); }
});

export const fetchTestResults = createAsyncThunk('tests/results', async (testId, { getState, rejectWithValue }) => {
  try {
    const { token } = getState().auth.user;
    const res = await axios.get(`${BASE}/${testId}/results`, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message ?? e.message); }
});

// Student thunks
export const fetchStudentTests = createAsyncThunk('tests/studentList', async (courseId, { getState, rejectWithValue }) => {
  try {
    const { token } = getState().auth.user;
    const res = await axios.get(`${BASE}/student/course/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message ?? e.message); }
});

export const fetchTestForAttempt = createAsyncThunk('tests/forAttempt', async (testId, { getState, rejectWithValue }) => {
  try {
    const { token } = getState().auth.user;
    const res = await axios.get(`${BASE}/${testId}/attempt`, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message ?? e.message); }
});

export const submitTestAttempt = createAsyncThunk('tests/submit', async ({ testId, answers, timeTakenSeconds }, { getState, rejectWithValue }) => {
  try {
    const { token } = getState().auth.user;
    const res = await axios.post(`${BASE}/${testId}/submit`, { answers, timeTakenSeconds }, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message ?? e.message); }
});

export const fetchMyResult = createAsyncThunk('tests/myResult', async (testId, { getState, rejectWithValue }) => {
  try {
    const { token } = getState().auth.user;
    const res = await axios.get(`${BASE}/${testId}/my-result`, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message ?? e.message); }
});

/* ── Slice ───────────────────────────────────────────────────── */
const testSlice = createSlice({
  name: 'tests',
  initialState: {
    list:       [],
    results:    null,   // instructor analytics
    myResult:   null,   // student result
    activeTest: null,   // test being attempted
    isLoading:  false,
    isError:    false,
    message:    '',
  },
  reducers: {
    clearTestState: (state) => {
      state.activeTest = null;
      state.myResult   = null;
      state.message    = '';
      state.isError    = false;
    },
  },
  extraReducers: (builder) => {
    const pending  = (s)    => { s.isLoading = true;  s.isError = false; };
    const rejected = (s, a) => { s.isLoading = false; s.isError = true; s.message = a.payload; };

    builder
      .addCase(createTest.pending, pending)
      .addCase(createTest.rejected, rejected)
      .addCase(createTest.fulfilled, (s, a) => { s.isLoading = false; s.list.unshift(a.payload); })

      .addCase(fetchCourseTests.pending, pending)
      .addCase(fetchCourseTests.rejected, rejected)
      .addCase(fetchCourseTests.fulfilled, (s, a) => { s.isLoading = false; s.list = a.payload; })

      .addCase(toggleTestPublish.fulfilled, (s, a) => {
        const t = s.list.find(x => x._id === a.payload.testId);
        if (t) t.isPublished = a.payload.isPublished;
      })

      .addCase(fetchTestResults.pending, pending)
      .addCase(fetchTestResults.rejected, rejected)
      .addCase(fetchTestResults.fulfilled, (s, a) => { s.isLoading = false; s.results = a.payload; })

      .addCase(fetchStudentTests.pending, pending)
      .addCase(fetchStudentTests.rejected, rejected)
      .addCase(fetchStudentTests.fulfilled, (s, a) => { s.isLoading = false; s.list = a.payload; })

      .addCase(fetchTestForAttempt.pending, pending)
      .addCase(fetchTestForAttempt.rejected, rejected)
      .addCase(fetchTestForAttempt.fulfilled, (s, a) => { s.isLoading = false; s.activeTest = a.payload; })

      .addCase(submitTestAttempt.pending, pending)
      .addCase(submitTestAttempt.rejected, rejected)
      .addCase(submitTestAttempt.fulfilled, (s, a) => { s.isLoading = false; s.myResult = a.payload; })

      .addCase(fetchMyResult.pending, pending)
      .addCase(fetchMyResult.rejected, rejected)
      .addCase(fetchMyResult.fulfilled, (s, a) => { s.isLoading = false; s.myResult = a.payload; });
  },
});

export const { clearTestState } = testSlice.actions;
export default testSlice.reducer;