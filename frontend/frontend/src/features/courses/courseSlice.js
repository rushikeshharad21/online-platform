import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/courses';

export const createNewCourse = createAsyncThunk('courses/create', async (courseData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await axios.post(`${BASE_URL}/create`, courseData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchAllCourses = createAsyncThunk('courses/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await axios.get(BASE_URL);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching courses');
  }
});

export const fetchMyCourses = createAsyncThunk('courses/fetchMine', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await axios.get(`${BASE_URL}/my-courses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Error fetching your courses');
  }
});

export const togglePublishStatus = createAsyncThunk('courses/togglePublish', async ({ courseId, isPublished }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const response = await axios.put(`${BASE_URL}/${courseId}`, { isPublished }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.course;
  } catch (error) {
    return thunkAPI.rejectWithValue({
      courseId,
      // Revert to previous value on failure
      isPublished: !isPublished,
      message: error.response?.data?.message || 'Failed to update status',
    });
  }
});

const courseSlice = createSlice({
  name: 'courses',
  initialState: { courses: [], isLoading: false, isError: false, message: '' },
  reducers: {
    resetCourseState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchAllCourses ───────────────────────────────────────────
      .addCase(fetchAllCourses.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = Array.isArray(action.payload)
          ? action.payload
          : (action.payload.courses || []);
      })
      .addCase(fetchAllCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ── fetchMyCourses ────────────────────────────────────────────
      .addCase(fetchMyCourses.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchMyCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = Array.isArray(action.payload)
          ? action.payload
          : (action.payload.courses || []);
      })
      .addCase(fetchMyCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ── togglePublishStatus ───────────────────────────────────────
      // OPTIMISTIC UPDATE: flip the value immediately in .pending so the
      // switch responds instantly without waiting for the API round-trip.
      // .fulfilled confirms with the server's actual response.
      // .rejected rolls back to the previous value so UI stays truthful.
      .addCase(togglePublishStatus.pending, (state, action) => {
        const { courseId, isPublished } = action.meta.arg;
        const course = state.courses.find(c => c._id === courseId);
        if (course) {
          // Flip immediately — this is what makes the toggle feel instant
          course.isPublished = isPublished;
        }
      })
      .addCase(togglePublishStatus.fulfilled, (state, action) => {
        // Server confirmed — replace with authoritative data
        const index = state.courses.findIndex(c => c._id === action.payload._id);
        if (index !== -1) state.courses[index] = action.payload;
      })
      .addCase(togglePublishStatus.rejected, (state, action) => {
        // Roll back the optimistic flip
        const { courseId, isPublished } = action.payload;
        const course = state.courses.find(c => c._id === courseId);
        if (course) course.isPublished = isPublished;
        state.isError = true;
        state.message = action.payload.message;
      });
  },
});

export const { resetCourseState } = courseSlice.actions;
export default courseSlice.reducer;