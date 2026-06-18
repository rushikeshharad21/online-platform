import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

// =========================================================================
// 🌐 1. DIRECTORY-ALIGNED IMPORTS (Matching your exact folder tree layout)
// =========================================================================
import RootLayout from './components/layout/RootLayout';

// Common Public Pages Folder
import Home from './pages/common/Home';
import Login from './pages/common/Login';
import Register from './pages/common/Register';

// Core Features Implemented Pages
import CreateCourse from "./pages/CreateCourse"; 
import InstructorDashboard from "./pages/InstructorDashboard"; 

// Student Pages Folder (Placeholders - we will write these out later)
const StudentDashboard = () => <div style={{ padding: '24px' }}><h2>🎓 Student Dashboard Workspace</h2><p>Welcome to your learning track panel.</p></div>;
const CourseViewer = () => <div style={{ padding: '24px' }}><h2>📖 Course Video Viewer Engine</h2></div>;
const Checkout = () => <div style={{ padding: '24px' }}><h2>💳 Secure Checkout Window</h2></div>;

// Instructor Pages Folder (Placeholders)
const EditCourse = () => <div style={{ padding: '24px' }}><h2>✏️ Course Material Editor</h2></div>;

// Wildcard Error Handling Viewport
const NotFound = () => <div style={{ padding: '40px', textAlign: 'center' }}><h2>404 - Page Not Found</h2></div>;


// =========================================================================
// 🔒 2. ROLE-BASED ACCESS CONTROL GUARDS (Using Layout Outlets)
// =========================================================================
const ProtectedLayout = ({ allowedRoles }) => {
 // 1. Grab the current live state from Redux slice storage
  const { user: reduxUser } = useSelector((state) => state.auth || {});

  // 2. Persistent Fallback: Check localStorage if a page refresh cleared Redux state
  const localUserString = localStorage.getItem('user');
  const storedUser = localUserString ? JSON.parse(localUserString) : null;

  // Resolve active user context state
  const currentUser = reduxUser || storedUser;

  // Guard Clause 1: If user context data is empty, force route redirection back to login instantly
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Guard Clause 2: If the profile's role string fails the validation array list, block entry
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  // If both security barriers clear, securely mount the matching sub-page index
  return <Outlet />;
};


// =========================================================================
// 🗺️ 3. CENTRAL DATA ROUTER ARCHITECTURE (createBrowserRouter)
// =========================================================================
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />, // Wraps every single page down below inside your responsive MUI navbar shell
    children: [
      // 🟢 PUBLIC COMMON TRACK ROUTES
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },

      // 🔵 PROTECTED STUDENT TRACK ROUTES (pages/student/)
      {
        element: <ProtectedLayout allowedRoles={['student', 'admin']} />,
        children: [
          {
            path: 'dashboard',
            element: <StudentDashboard />,
          },
          {
            path: 'course/:courseId',
            element: <CourseViewer />,
          },
          {
            path: 'checkout',
            element: <Checkout />,
          },
        ],
      },

      // 🔴 PROTECTED INSTRUCTOR TRACK ROUTES (pages/instructor/)
      {
        path: 'instructor',
        element: <ProtectedLayout allowedRoles={['instructor', 'admin']} />,
        children: [
          {
            path: 'dashboard',
            element: <InstructorDashboard />, 
          },
          {
            path: 'create-course',
            element: <CreateCourse />,
          },
          {
            path: 'edit-course/:courseId',
            element: <EditCourse />,
          },
        ],
      },

      // 🟡 FALLBACK UNMAPPED ACTIONS
      {
        path: '404',
        element: <NotFound />,
      },
      {
        path: '*',
        element: <Navigate to="/404" replace />,
      },
    ],
  },
]);

export default router;