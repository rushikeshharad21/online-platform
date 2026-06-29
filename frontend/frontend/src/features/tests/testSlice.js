// src/features/tests/testSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';

const BASE = '/tests';

/* ── Thunks ──────────────────────────────────────────────────── */
// FIX: apiClient handles Authorization header — no getState() token extraction needed
// FIX: getState().auth.user token extraction removed everywhere — it crashed when auth.user was null

export const createTest = createAsyncThunk('tests/create', async (data, { rejectWithValue }) => {
  try {
    const res = await apiClient.post(BASE, data);
    return res.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message ?? e.message); }
});

export const fetchCourseTests = createAsyncThunk('tests/byCourse', async (courseId, { rejectWithValue }) => {
  try {
    const res = await apiClient.get(`${BASE}/course/${courseId}`);
    // FIX: console.log removed — debug leftover
    return res.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message ?? e.message); }
});

export const toggleTestPublish = createAsyncThunk('tests/togglePublish', async (testId, { rejectWithValue }) => {
  try {
    const res = await apiClient.patch(`${BASE}/${testId}/publish`, {});
    return { testId, isPublished: res.data.isPublished };
  } catch (e) { return rejectWithValue(e.response?.data?.message ?? e.message); }
});

export const fetchTestResults = createAsyncThunk('tests/results', async (testId, { rejectWithValue }) => {
  try {
    const res = await apiClient.get(`${BASE}/${testId}/results`);
    return res.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message ?? e.message); }
});

export const fetchStudentTests = createAsyncThunk('tests/studentList', async (courseId, { rejectWithValue }) => {
  try {
    const res = await apiClient.get(`${BASE}/student/course/${courseId}`);
    return res.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message ?? e.message); }
});

export const fetchTestForAttempt = createAsyncThunk('tests/forAttempt', async (testId, { rejectWithValue }) => {
  try {
    const res = await apiClient.get(`${BASE}/${testId}/attempt`);
    return res.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message ?? e.message); }
});

export const submitTestAttempt = createAsyncThunk('tests/submit', async ({ testId, answers, timeTakenSeconds }, { rejectWithValue }) => {
  try {
    const res = await apiClient.post(`${BASE}/${testId}/submit`, { answers, timeTakenSeconds });
    return res.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message ?? e.message); }
});

export const fetchMyResult = createAsyncThunk('tests/myResult', async (testId, { rejectWithValue }) => {
  try {
    const res = await apiClient.get(`${BASE}/${testId}/my-result`);
    return res.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message ?? e.message); }
});

/* ── Slice ───────────────────────────────────────────────────── */
const testSlice = createSlice({
  name: 'tests',
  initialState: {
    list:       [],
    results:    null,
    myResult:   null,
    activeTest: null,
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
    // FIX: added dedicated list reset — prevents stale course data showing
    // when navigating between courses before the new fetch resolves
    clearTestList: (state) => {
      state.list      = [];
      state.isError   = false;
      state.message   = '';
    },
  },
  extraReducers: (builder) => {
    const pending  = (s)    => { s.isLoading = true;  s.isError = false; s.message = ''; };
    const rejected = (s, a) => { s.isLoading = false; s.isError = true;  s.message = a.payload; };

    builder
      .addCase(createTest.pending,   pending)
      .addCase(createTest.rejected,  rejected)
      .addCase(createTest.fulfilled, (s, a) => { s.isLoading = false; s.list.unshift(a.payload); })

      .addCase(fetchCourseTests.pending,   pending)
      .addCase(fetchCourseTests.rejected,  rejected)
      .addCase(fetchCourseTests.fulfilled, (s, a) => { s.isLoading = false; s.list = a.payload; })

      // FIX: toggleTestPublish now has pending + rejected handlers — was silently failing before
      .addCase(toggleTestPublish.pending,   pending)
      .addCase(toggleTestPublish.rejected,  rejected)
      .addCase(toggleTestPublish.fulfilled, (s, a) => {
        s.isLoading = false;
        const test = s.list.find(x => x._id === a.payload.testId);
        if (test) test.isPublished = a.payload.isPublished;
      })

      .addCase(fetchTestResults.pending,   pending)
      .addCase(fetchTestResults.rejected,  rejected)
      .addCase(fetchTestResults.fulfilled, (s, a) => { s.isLoading = false; s.results = a.payload; })

      .addCase(fetchStudentTests.pending,   pending)
      .addCase(fetchStudentTests.rejected,  rejected)
      .addCase(fetchStudentTests.fulfilled, (s, a) => { s.isLoading = false; s.list = a.payload; })

      .addCase(fetchTestForAttempt.pending,   pending)
      .addCase(fetchTestForAttempt.rejected,  rejected)
      .addCase(fetchTestForAttempt.fulfilled, (s, a) => { s.isLoading = false; s.activeTest = a.payload; })

      .addCase(submitTestAttempt.pending,   pending)
      .addCase(submitTestAttempt.rejected,  rejected)
      .addCase(submitTestAttempt.fulfilled, (s, a) => { s.isLoading = false; s.myResult = a.payload; })

      .addCase(fetchMyResult.pending,   pending)
      .addCase(fetchMyResult.rejected,  rejected)
      .addCase(fetchMyResult.fulfilled, (s, a) => { s.isLoading = false; s.myResult = a.payload; });
  },
});

export const { clearTestState, clearTestList } = testSlice.actions;
export default testSlice.reducer;