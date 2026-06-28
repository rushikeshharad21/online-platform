// src/App.jsx
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

// ── Only RootLayout is eagerly loaded (needed immediately) ────
import RootLayout from './components/layout/RootLayout';

// ── Lazy loaded pages ─────────────────────────────────────────
// Common
const Home     = lazy(() => import('./pages/common/Home'));
const Login    = lazy(() => import('./pages/common/Login'));
const Register = lazy(() => import('./pages/common/Register'));

// Instructor
const InstructorDashboard   = lazy(() => import('./pages/InstructorDashboard'));
const CreateCourse          = lazy(() => import('./pages/CreateCourse'));
const EditCourse            = lazy(() => import('./pages/EditCourse'));
const TestManager           = lazy(() => import('./pages/instructor/TestManager'));
const CreateTest            = lazy(() => import('./pages/instructor/CreateTest'));
const InstructorTestResults = lazy(() => import('./pages/instructor/InstructorTestResults'));

// Student
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const CourseViewer     = lazy(() => import('./pages/CourseViewer'));
const StudentTestList  = lazy(() => import('./pages/student/StudentTestList'));
const AttemptTest      = lazy(() => import('./pages/student/AttemptTest'));
const StudentResult    = lazy(() => import('./pages/student/StudentResult'));

// Placeholders
const Checkout = lazy(() => import('./pages/common/Checkout'));

// ── Page loader shown during lazy load ────────────────────────
const PageLoader = () => (
  <Box sx={{
    minHeight: '100vh',
    bgcolor: '#07111f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <CircularProgress sx={{ color: '#4f8ef7' }} />
  </Box>
);

// ── Suspense wrapper applied at layout level ──────────────────
const SuspenseLayout = () => (
  <Suspense fallback={<PageLoader />}>
    <Outlet />
  </Suspense>
);

// ── Role guard ────────────────────────────────────────────────
const ProtectedLayout = ({ allowedRoles }) => {
  const { user: reduxUser } = useSelector((state) => state.auth || {});

  const localUserString = localStorage.getItem('user');
  const storedUser      = localUserString ? JSON.parse(localUserString) : null;
  const currentUser     = reduxUser || storedUser;

  if (!currentUser)                                              return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) return <Navigate to="/" replace />;
  return <Outlet />;
};

// ── Not found ─────────────────────────────────────────────────
const NotFound = () => (
  <Box sx={{
    minHeight: '100vh', bgcolor: '#07111f',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ fontSize: '72px', fontWeight: 800, color: 'rgba(255,255,255,0.08)', lineHeight: 1 }}>404</Box>
      <Box sx={{ fontSize: '16px', color: 'rgba(200,215,240,0.5)', mt: 1 }}>Page not found</Box>
    </Box>
  </Box>
);

// ── Router ────────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        // Suspense boundary wraps all children
        element: <SuspenseLayout />,
        children: [

          // PUBLIC
          { index: true,      element: <Home />     },
          { path: 'login',    element: <Login />    },
          { path: 'register', element: <Register /> },

          // STUDENT
          {
            element: <ProtectedLayout allowedRoles={['student', 'admin']} />,
            children: [
              { path: 'dashboard',                           element: <StudentDashboard /> },
              { path: 'course/:courseId',                    element: <CourseViewer />     },
              { path: 'checkout',                            element: <Checkout />         },
              { path: 'student/courses/:courseId/tests',     element: <StudentTestList />  },
              { path: 'student/tests/:testId/attempt',       element: <AttemptTest />      },
              { path: 'student/tests/:testId/result',        element: <StudentResult />    },
            ],
          },

          // INSTRUCTOR
          {
            path: 'instructor',
            element: <ProtectedLayout allowedRoles={['instructor', 'admin']} />,
            children: [
              { path: 'dashboard',                           element: <InstructorDashboard />   },
              { path: 'create-course',                       element: <CreateCourse />          },
              { path: 'edit-course/:courseId',               element: <EditCourse />            },
              { path: 'courses/:courseId/tests',             element: <TestManager />           },
              { path: 'courses/:courseId/tests/create',      element: <CreateTest />            },
              { path: 'tests/:testId/results',               element: <InstructorTestResults /> },
            ],
          },

          // FALLBACK
          { path: '404', element: <NotFound /> },
          { path: '*',   element: <Navigate to="/404" replace /> },
        ],
      },
    ],
  },
]);

export default router;