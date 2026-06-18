import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Box, Typography, Button, Card,
  CircularProgress, Alert, Stack, CardContent, CardMedia
} from '@mui/material';
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';
import { fetchMyCourses } from '../features/courses/courseSlice';

// Deliberately NOT using MUI's <Grid> component. Its props broke between
// v5 (item + xs/sm/md) and v6/v7 (size={{ xs }}), and will likely change
// again. Plain CSS grid via Box.sx sidesteps that churn entirely and gives
// direct control over the column breakpoints below.

const InstructorDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const { courses, isLoading, isError, message } = useSelector((state) => state.courses || {});

  useEffect(() => {
    if (user?.token) {
      dispatch(fetchMyCourses());
    }
  }, [dispatch, user]);

  const validCourses = Array.isArray(courses) ? courses : [];

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 3, sm: 5 }, mb: 5, px: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        mb: 4,
        gap: 2
      }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ fontSize: { xs: '1.5rem', sm: '1.875rem', md: '2.125rem' } }}
        >
          Instructor Panel
        </Typography>
        <Button
          component={Link}
          to="/instructor/create-course"
          variant="contained"
          size="large"
          sx={{ width: { xs: '100%', sm: 'auto' }, flexShrink: 0 }}
        >
          Create New Course
        </Button>
      </Box>

      {isError && <Alert severity="error" sx={{ mb: 2 }}>{message || "Error loading courses!"}</Alert>}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : validCourses.length > 0 ? (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          },
          gap: { xs: 2, sm: 3 }
        }}>
          {validCourses.map((course) => (
              <Card key={course._id} sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 3,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.02)' }
              }}>
                {course.thumbnailUrl ? (
                  <CardMedia
                    component="img"
                    image={course.thumbnailUrl}
                    alt={course.title || 'Course thumbnail'}
                    sx={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover' }}
                  />
                ) : (
                  // Dependency-free fallback — no external placeholder service to go down.
                  <Box sx={{
                    width: '100%',
                    aspectRatio: '16 / 9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.100',
                    color: 'grey.400'
                  }}>
                    <ImageNotSupportedOutlinedIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: 'bold',
                      fontSize: { xs: '1rem', sm: '1.1rem' },
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {course.title || 'Untitled course'}
                  </Typography>

                  <Stack
                    direction="row"
                    flexWrap="wrap"
                    rowGap={1}
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <Box sx={{
                      bgcolor: '#fff9c4',
                      px: 1.5, py: 0.5,
                      borderRadius: 1,

                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f57f17' }}>
                        ⭐ {course.rating ? course.rating.toFixed(1) : '0.0'}
                      </Typography>
                    </Box>

                    <Typography
                      variant="h6"
                      color="text.primary"
                      sx={{ fontWeight: 800,marginLeft:"135px" ,fontSize: { xs: '1rem', sm: '1.25rem' } }}
                    >
                      ₹{course.price ? course.price.toLocaleString() : '0'}
                    </Typography>
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      // fixes row-height jitter between short vs long subtitles
                      minHeight: '2.6em'
                    }}
                  >
                    {course.subtitle || "No description provided"}
                  </Typography>
                </CardContent>

                <Button
                  component={Link}
                  to={`/instructor/edit-course/${course._id}`}
                  variant="contained"
                  fullWidth
                  sx={{ borderRadius: 0, py: 1.5 }}
                >
                  Edit Course
                </Button>
              </Card>
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 8, p: { xs: 3, sm: 4 }, bgcolor: '#f9f9f9', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary">No courses found.</Typography>
          <Button component={Link} to="/instructor/create-course" sx={{ mt: 2 }} variant="outlined">
            Create your first course
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default InstructorDashboard;