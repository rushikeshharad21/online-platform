import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import courseReducer from '../features/courses/courseSlice'; // 🟢 १. नवीन कोर्स रिड्यूसर इम्पोर्ट केला

const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer, // 🟢 २. स्टोरमध्ये कोर्स स्टेट जोडली
  },
});

export default store;