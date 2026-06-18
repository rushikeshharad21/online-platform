import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from './authService';

// Read existing session cache token on startup to prevent logged-in user profiles from losing state on refresh
const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: user ? user : null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// =========================================================================
// ⚡ ASYNCHRONOUS THUNKS (Handles state transitions outside the UI layer)
// =========================================================================

// Login execution thread
export const loginUser = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    return await authService.login(userData);
  } catch (error) {
    // 🟢 CORRECTED: Deeply inspect Axios responses to fetch the exact string from the backend server
    const message = 
      (error.response && error.response.data && error.response.data.message) || 
      error.message || 
      error.toString();
      
    return thunkAPI.rejectWithValue(message);
  }
});

// Register execution thread
export const registerUser = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    return await authService.register(userData);
  } catch (error) {
    // 🟢 CORRECTED: Ensure registration catches structural server validation messages cleanly too
    const message = 
      (error.response && error.response.data && error.response.data.message) || 
      error.message || 
      error.toString();
      
    return thunkAPI.rejectWithValue(message);
  }
});

// Logout execution thread
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  authService.logout();
});

// =========================================================================
// 🎛️ CORE AUTHENTICATION REDUX SLICE CONFIGURATION
// =========================================================================
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // --- LOGIN REDUCTION LIFECYCLE ---
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload; // Successfully receives the precise server error string now
        state.user = null;
      })
      
      // --- REGISTER REDUCTION LIFECYCLE ---
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })

      // --- LOGOUT LIFE REDUCTION ---
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { resetState } = authSlice.actions;
export default authSlice.reducer;