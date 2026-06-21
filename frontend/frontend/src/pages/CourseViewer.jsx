import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Typography, Box, Paper, Button, Stack, Card, Divider,
  CircularProgress, Alert, Accordion, AccordionSummary, AccordionDetails,
  List, ListItem, ListItemIcon, ListItemText, CardMedia
} from '@mui/material';
import {
  ExpandMore, PlayArrow, Lock, Download, School,
  LockOpen, MenuBook, Info
} from '@mui/icons-material';

const CourseViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // States
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [materialsLocked, setMaterialsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [error, setError] = useState('');
  const [enrolled, setEnrolled] = useState(false);

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const token = user?.token;

  useEffect(() => {
    fetchCourseDetails();
    if (token) {
      checkEnrollmentAndMaterials();
    } else {
      setMaterialsLocked(true);
      setLoading(false);
    }
  }, [courseId, token]);

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/courses/${courseId}`);
      if (response.data.success) {
        setCourse(response.data.course);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading course details');
    }
  };

  const checkEnrollmentAndMaterials = async () => {
    try {
      // Check if user is instructor of this course
      const courseRes = await axios.get(`http://localhost:5000/api/courses/${courseId}`);
      const courseData = courseRes.data.course;
      
      const isInstructor = user && courseData.instructor && (courseData.instructor._id === user._id || courseData.instructor === user._id);
      const isAdmin = user && user.role === 'admin';

      if (isInstructor || isAdmin) {
        setEnrolled(true);
        setMaterialsLocked(false);
      } else {
        // For students, check student/enrolled list to see if enrolled
        const enrolledRes = await axios.get('http://localhost:5000/api/courses/student/enrolled', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (enrolledRes.data.success) {
          const isEnrolled = enrolledRes.data.courses.some(c => c._id === courseId);
          setEnrolled(isEnrolled);
        }
      }

      // Fetch study materials (the controller will return success or lock info)
      const materialsRes = await axios.get(`http://localhost:5000/api/study-materials/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (materialsRes.data.success) {
        setMaterials(materialsRes.data.materials || []);
        setMaterialsLocked(false);
      }
    } catch (err) {
      if (err.response && err.response.status === 403 && err.response.data.isLocked) {
        setMaterialsLocked(true);
      } else {
        console.error('Error checking materials access:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (user.role === 'instructor') {
      alert('Instructors cannot enroll in courses.');
      return;
    }

    try {
      setEnrollLoading(true);
      const response = await axios.post(`http://localhost:5000/api/courses/${courseId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setEnrolled(true);
        // Re-check to fetch materials
        checkEnrollmentAndMaterials();
        alert('Successfully enrolled! Welcome to the course. 🎓');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrollLoading(false);
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !course) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Alert severity="error">{error || 'Course not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Course Detail Banner */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, bgcolor: '#ffffff', mb: 4 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '3fr 1fr' },
          gap: 3,
          alignItems: 'center'
        }}>
          <Box>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
              <Box sx={{ bgcolor: 'primary.light', color: 'white', px: 1.5, py: 0.5, borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{course.category}</Typography>
              </Box>
              <Box sx={{ bgcolor: 'secondary.light', color: 'white', px: 1.5, py: 0.5, borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{course.level}</Typography>
              </Box>
            </Box>
            <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
              {course.title}
            </Typography>
            <Typography variant="h6" color="textSecondary" sx={{ mb: 2, fontWeight: 400 }}>
              {course.subtitle}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
              <Typography variant="body2">⭐ Rating: <strong>{course.rating ? course.rating.toFixed(1) : '0.0'}</strong></Typography>
              <Typography variant="body2">Instructor: <strong>{course.instructor?.name}</strong></Typography>
            </Stack>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            {course.thumbnailUrl ? (
              <CardMedia
                component="img"
                image={course.thumbnailUrl}
                alt="Course preview"
                sx={{ height: 140, width: 220, borderRadius: 2, objectFit: 'cover', boxShadow: 2 }}
              />
            ) : (
              <Box sx={{ height: 140, width: 220, bgcolor: 'grey.100', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'grey.400' }}>
                <School sx={{ fontSize: 50 }} />
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Grid Layout: Left Syllabus + details, Right Sidebar */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '3fr 1.5fr' },
        gap: 4
      }}>
        {/* LEFT COLUMN */}
        <Box>
          {/* Description */}
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Course Description</Typography>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
              {course.description}
            </Typography>
          </Paper>

          {/* Curriculum */}
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Syllabus & Curriculum</Typography>
          <Box sx={{ mb: 4 }}>
            {course.curriculum && course.curriculum.map((section, sIdx) => (
              <Accordion key={sIdx} defaultExpanded={sIdx === 0} sx={{ mb: 1.5, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
                <AccordionSummary expandMoreIcon={<ExpandMore />}>
                  <Typography fontWeight="bold" sx={{ color: 'primary.main' }}>
                    Section {sIdx + 1}: {section.sectionTitle}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <List sx={{ p: 0 }}>
                    {section.lectures.map((lecture, lIdx) => {
                      const showPreview = lecture.isFreePreview || enrolled;
                      return (
                        <ListItem key={lIdx} sx={{ px: 3, py: 1.5, borderTop: '1px solid #f0f0f0' }}>
                          <ListItemIcon>
                            {showPreview ? (
                              <PlayArrow color="primary" />
                            ) : (
                              <Lock color="action" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={lecture.title}
                            secondary={lecture.duration ? `Duration: ${lecture.duration}` : ''}
                          />
                          {lecture.isFreePreview && !enrolled && (
                            <Box sx={{ bgcolor: 'success.light', color: 'white', px: 1, py: 0.2, borderRadius: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Free Preview</Typography>
                            </Box>
                          )}
                        </ListItem>
                      );
                    })}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>

        {/* RIGHT COLUMN (SIDEBAR) */}
        <Box>
          {/* Enrollment Card */}
          <Card elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4, border: '1px solid #e0e0e0' }}>
            {enrolled ? (
              <Stack spacing={2} align="center" sx={{ textAlign: 'center' }}>
                <LockOpen color="success" sx={{ fontSize: 50, mx: 'auto' }} />
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  You are Enrolled!
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Access all video lectures in the curriculum and download any study material PDFs below.
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={2.5}>
                <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center' }}>
                  ₹{course.price ? course.price.toLocaleString() : '0'}
                </Typography>
                <Divider />
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
                  Get complete lifetime access to all lectures, coding tasks, and resource attachments.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleEnroll}
                  disabled={enrollLoading}
                  sx={{ py: 1.5, fontWeight: 'bold' }}
                >
                  {enrollLoading ? 'Enrolling...' : 'Enroll in Course'}
                </Button>
              </Stack>
            )}
          </Card>

          {/* Study Materials Card */}
          <Card elevation={3} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <MenuBook color="primary" />
              <Typography variant="h6" fontWeight="bold">Study Materials (PDF)</Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />

            {materialsLocked ? (
              <Box sx={{
                py: 3, px: 2, textAlign: 'center', bgcolor: '#fafafa', borderRadius: 2,
                border: '1px dashed #ccc'
              }}>
                <Lock color="action" sx={{ fontSize: 35, mb: 1, color: 'grey.400' }} />
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>PDFs are Locked</Typography>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                  Enroll in this course to view and download study notes, guides, and exercises.
                </Typography>
                <Button variant="outlined" size="small" onClick={handleEnroll} startIcon={<LockOpen />}>
                  Unlock Materials
                </Button>
              </Box>
            ) : materials.length > 0 ? (
              <Stack spacing={2}>
                {materials.map((mat) => (
                  <Paper key={mat._id} variant="outlined" sx={{ p: 2, bgcolor: '#fafafa' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {mat.title}
                    </Typography>
                    {mat.description && (
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                        {mat.description}
                      </Typography>
                    )}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="grey.500">
                        {formatBytes(mat.fileSize)}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          component="a"
                          href={mat.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ py: 0.5, px: 1.5, fontSize: '0.75rem' }}
                        >
                          View
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Download />}
                          component="a"
                          href={mat.downloadUrl || mat.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ py: 0.5, px: 1.5, fontSize: '0.75rem' }}
                        >
                          Download
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Box sx={{ py: 3, textAlign: 'center', bgcolor: '#fafafa', borderRadius: 2 }}>
                <Info color="disabled" sx={{ fontSize: 30, mb: 1 }} />
                <Typography variant="body2" color="textSecondary">No PDF resources available.</Typography>
              </Box>
            )}
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default CourseViewer;
