import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from "../../utils/apiClient"; // ✅ Adjust the path if needed

// Create Course
export const createNewCourse = createAsyncThunk(
  'courses/create',
  async (courseData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      const response = await apiClient.post(
        '/courses/create',
        courseData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Fetch All Courses
export const fetchAllCourses = createAsyncThunk(
  'courses/fetchAll',
  async (_, thunkAPI) => {
    try {
      const response = await apiClient.get('/courses');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Error fetching courses'
      );
    }
  }
);

// Fetch My Courses
export const fetchMyCourses = createAsyncThunk(
  'courses/fetchMine',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      const response = await apiClient.get(
        '/courses/my-courses',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Error fetching your courses'
      );
    }
  }
);

// Toggle Publish Status
export const togglePublishStatus = createAsyncThunk(
  'courses/togglePublish',
  async ({ courseId, isPublished }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;

      const response = await apiClient.put(
        `/courses/${courseId}`,
        { isPublished },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.course;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        courseId,
        isPublished: !isPublished,
        message:
          error.response?.data?.message || 'Failed to update status',
      });
    }
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    courses: [],
    isLoading: false,
    isError: false,
    message: '',
  },

  reducers: {
    resetCourseState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
  },

  extraReducers: (builder) => {
    builder

      // Fetch All Courses
      .addCase(fetchAllCourses.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })

      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = Array.isArray(action.payload)
          ? action.payload
          : action.payload.courses || [];
      })

      .addCase(fetchAllCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Fetch My Courses
      .addCase(fetchMyCourses.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })

      .addCase(fetchMyCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = Array.isArray(action.payload)
          ? action.payload
          : action.payload.courses || [];
      })

      .addCase(fetchMyCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Toggle Publish
      .addCase(togglePublishStatus.pending, (state, action) => {
        const { courseId, isPublished } = action.meta.arg;

        const course = state.courses.find(
          (c) => c._id === courseId
        );

        if (course) {
          course.isPublished = isPublished;
        }
      })

      .addCase(togglePublishStatus.fulfilled, (state, action) => {
        const index = state.courses.findIndex(
          (c) => c._id === action.payload._id
        );

        if (index !== -1) {
          state.courses[index] = action.payload;
        }
      })

      .addCase(togglePublishStatus.rejected, (state, action) => {
        const { courseId, isPublished } = action.payload;

        const course = state.courses.find(
          (c) => c._id === courseId
        );

        if (course) {
          course.isPublished = isPublished;
        }

        state.isError = true;
        state.message = action.payload.message;
      });
  },
});

export const { resetCourseState } = courseSlice.actions;

export default courseSlice.reducer;