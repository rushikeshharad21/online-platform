import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Typography, Box, Tabs, Tab, Button, Card, CardContent,
  CardMedia, CircularProgress, Alert, Stack
} from '@mui/material';
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  // States
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const token = user?.token;

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch enrolled courses
      const enrolledRes = await axios.get('http://localhost:5000/api/courses/student/enrolled', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch all public courses
      const allRes = await axios.get('http://localhost:5000/api/courses');

      if (enrolledRes.data.success) {
        setEnrolledCourses(enrolledRes.data.courses || []);
      }
      if (allRes.data.success) {
        setAllCourses(allRes.data.courses || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const renderCourseGrid = (coursesList, type) => {
    if (coursesList.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#f9f9f9', borderRadius: 3, border: '1px dashed #ccc' }}>
          <Typography variant="h6" color="textSecondary">
            {type === 'enrolled' ? 'You have not enrolled in any courses yet.' : 'No available courses found.'}
          </Typography>
          {type === 'enrolled' && (
            <Button onClick={() => setTabValue(1)} variant="contained" sx={{ mt: 2 }}>
              Browse Catalog
            </Button>
          )}
        </Box>
      );
    }

    return (
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)'
        },
        gap: 3
      }}>
        {coursesList.map((course) => {
          const isEnrolled = enrolledCourses.some(e => e._id === course._id);
          return (
            <Card key={course._id} sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 3,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'scale(1.02)', boxShadow: 6 }
            }}>
              {course.thumbnailUrl ? (
                <CardMedia
                  component="img"
                  image={course.thumbnailUrl}
                  alt={course.title || 'Course thumbnail'}
                  sx={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover' }}
                />
              ) : (
                <Box sx={{
                  width: '100%',
                  aspectRatio: '16 / 9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.100',
                  color: 'grey.400'
                }}>
                  <ImageNotSupportedOutlinedIcon sx={{ fontSize: 40 }} />
                </Box>
              )}

              <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 1.5,
                    fontWeight: 'bold',
                    fontSize: '1.05rem',
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    height: '2.6em'
                  }}
                >
                  {course.title || 'Untitled course'}
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <Box sx={{ bgcolor: '#fff9c4', px: 1, py: 0.2, borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#f57f17' }}>
                      ⭐ {course.rating ? course.rating.toFixed(1) : '0.0'}
                    </Typography>
                  </Box>
                  <Box sx={{ bgcolor: 'primary.light', color: 'white', px: 1, py: 0.2, borderRadius: 1, opacity: 0.9 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                      {course.level}
                    </Typography>
                  </Box>
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '2.6em',
                    lineHeight: 1.4
                  }}
                >
                  {course.subtitle || course.description || 'No description provided'}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2" color="text.secondary">
                    {course.instructor?.name || 'Instructor'}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {isEnrolled ? (
                      <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold' }}>
                        ENROLLED
                      </Typography>
                    ) : (
                      `₹${course.price ? course.price.toLocaleString() : '0'}`
                    )}
                  </Typography>
                </Stack>
              </CardContent>

              <Button
                component={Link}
                to={`/course/${course._id}`}
                variant={isEnrolled ? "contained" : "outlined"}
                color={isEnrolled ? "primary" : "primary"}
                fullWidth
                sx={{ borderRadius: 0, py: 1.2, fontWeight: 'bold' }}
              >
                {isEnrolled ? 'Go to Course Panel' : 'View Details & Enroll'}
              </Button>
            </Card>
          );
        })}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 6 }}>
      {/* Welcome Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>Student Workspace</Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Welcome back, {user?.name}! Browse courses and track your active learning curriculum.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="student dashboard tabs">
          <Tab label={`My Enrolled Track (${enrolledCourses.length})`} />
          <Tab label="Explore Course Catalog" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {tabValue === 0 && (
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>My Enrolled Courses</Typography>
          {renderCourseGrid(enrolledCourses, 'enrolled')}
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Course Catalog</Typography>
          {renderCourseGrid(allCourses, 'catalog')}
        </Box>
      )}
    </Container>
  );
};

export default StudentDashboard;
