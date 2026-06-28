// src/pages/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Typography, Box, Tabs, Tab, Button, Card,
  CardContent, CardMedia, Alert, Avatar, Chip, Grid
} from '@mui/material';
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';
import CheckCircleOutlinedIcon       from '@mui/icons-material/CheckCircleOutlined';
import QuizOutlinedIcon              from '@mui/icons-material/QuizOutlined'; // ← NEW

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [tabValue,        setTabValue]        = useState(0);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [allCourses,      setAllCourses]      = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [enrolledError,   setEnrolledError]   = useState('');
  const [catalogError,    setCatalogError]    = useState('');

  const user  = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  const token = user?.token;
 const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const fetchDashboardData = async () => {
    setLoading(true);
    const [enrolledResult, allResult] = await Promise.allSettled([
      axios.get(`${API}/api/courses/student/enrolled`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API}/api/courses`),
    ]);

    if (enrolledResult.status === 'fulfilled' && enrolledResult.value.data.success)
      setEnrolledCourses(enrolledResult.value.data.courses || []);
    else setEnrolledError('Could not load your courses.');

    if (allResult.status === 'fulfilled' && allResult.value.data.success)
      setAllCourses(allResult.value.data.courses || []);
    else setCatalogError('Could not load the catalog.');

    setLoading(false);
  };

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchDashboardData();
  }, [token]);

  const getInitials = (name = '') =>
    name.trim().split(' ').slice(0, 2).map(n => n[0]?.toUpperCase()).join('');

  const renderCourseGrid = (coursesList, error) => {
    if (error) return (
      <Alert severity="error" sx={{ mt: 2, background: 'rgba(211,47,47,0.1)', color: '#ffb7b7' }}>
        {error}
      </Alert>
    );

    if (coursesList.length === 0) return (
      <Box sx={{
        textAlign: 'center', py: 10,
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 4, border: '1px dashed rgba(255,255,255,0.1)',
      }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>No courses found in this section.</Typography>
      </Box>
    );

    const enrolledIds = new Set(enrolledCourses.map(e => e._id));

    return (
      <Grid container spacing={3} alignItems="stretch">
        {coursesList.map((course) => {
          const isEnrolled = enrolledIds.has(course._id);
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={course._id} sx={{ display: 'flex' }}>
              <Card sx={{
                display: 'flex', flexDirection: 'column', width: '100%', borderRadius: 4,
                background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: '0.3s',
                '&:hover': { transform: 'translateY(-8px)', borderColor: 'rgba(100,255,218,0.4)' },
              }}>

                {/* Thumbnail */}
                <Box sx={{ height: 250, width: '100%', overflow: 'hidden', position: 'relative' }}>
                  {course.thumbnailUrl ? (
                    <CardMedia
                      component="img"
                      image={course.thumbnailUrl}
                      alt={course.title}
                      sx={{ height: '100%', width: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
                      <ImageNotSupportedOutlinedIcon sx={{ fontSize: 40, opacity: 0.2, color: '#fff' }} />
                    </Box>
                  )}
                </Box>

                {/* Content */}
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {isEnrolled && (
                    <Chip
                      icon={<CheckCircleOutlinedIcon sx={{ color: '#66bb6a !important' }} />}
                      label="Enrolled" size="small" variant="outlined"
                      sx={{ alignSelf: 'flex-start', color: '#81c784', borderColor: '#81c784' }}
                    />
                  )}
                  <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1, letterSpacing: '0.05em' }}>
                    {course.category || 'Course'}
                  </Typography>
                  <Typography variant="subtitle1" sx={{
                    fontWeight: 700, lineHeight: 1.3, color: '#ffffff',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {course.title}
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: 'rgba(255,255,255,0.7)', flexGrow: 1,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {course.subtitle}
                  </Typography>

                  {/* Instructor */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 2, mt: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: 10, bgcolor: 'rgba(100,255,218,0.2)', color: '#64ffda' }}>
                      {getInitials(course.instructor?.name)}
                    </Avatar>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      {course.instructor?.name || 'Instructor'}
                    </Typography>
                  </Box>
                </CardContent>

                {/* ── Action buttons ──────────────────────────── */}
                <Box sx={{ p: 2, pt: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Go to Course / View Details */}
                  <Button
                    component={Link}
                    to={`/course/${course._id}`}
                    fullWidth
                    variant={isEnrolled ? 'contained' : 'outlined'}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    {isEnrolled ? 'Go to Course' : 'View Details'}
                  </Button>

                  {/* View Tests — only for enrolled courses ← NEW */}
                  {isEnrolled && (
                    <Button
                      component={Link}
                      to={`/student/courses/${course._id}/tests`}
                      fullWidth
                      startIcon={<QuizOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                      sx={{
                        borderRadius: 2, textTransform: 'none', fontWeight: 600,
                        fontSize: '12px',
                        color: 'rgba(167,139,250,0.9)',
                        background: 'rgba(167,139,250,0.08)',
                        border: '1px solid rgba(167,139,250,0.25)',
                        '&:hover': {
                          background: 'rgba(167,139,250,0.18)',
                          borderColor: 'rgba(167,139,250,0.45)',
                        },
                      }}
                    >
                      View Tests
                    </Button>
                  )}
                </Box>

              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#fff' }}>
        Student Workspace
      </Typography>
      <Typography sx={{ color: 'rgba(255,255,255,0.6)', mb: 4 }}>
        Pick up where you left off, or explore something new.
      </Typography>

      <Tabs
        value={tabValue}
        onChange={(_, v) => setTabValue(v)}
        sx={{
          mb: 4,
          '& .MuiTab-root':  { color: 'rgba(255,255,255,0.5)', textTransform: 'none', fontWeight: 600 },
          '& .Mui-selected': { color: '#fff !important' },
        }}
      >
        <Tab label={`My Courses (${enrolledCourses.length})`} />
        <Tab label="Explore Catalog" />
      </Tabs>

      {tabValue === 0
        ? renderCourseGrid(enrolledCourses, enrolledError)
        : renderCourseGrid(allCourses, catalogError)
      }
    </Container>
  );
};

export default StudentDashboard;