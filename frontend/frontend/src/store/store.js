import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import courseReducer from '../features/courses/courseSlice'; // 🟢 १. नवीन कोर्स रिड्यूसर इम्पोर्ट केला
import testReducer from '../features/tests/testSlice';
import quizReducer from '../features/quiz/quizSlice';
const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    tests: testReducer,
    quiz: quizReducer, // 🟢 २. स्टोरमध्ये कोर्स स्टेट जोडली
  },
});

export default store;