import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Paper, Typography, Box, Tabs, Tab, TextField, Button,
  Grid, MenuItem, Stack, Card, CardContent, Divider, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress,
  Alert, Dialog, DialogTitle, DialogContent, DialogActions, FormHelperText, InputAdornment
} from '@mui/material';
import {
  Save, Delete, Edit, OpenInNew, UploadFile, ArrowBack, AddCircle
} from '@mui/icons-material';

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  // States for course
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', severity: 'success' });

  // States for PDF Study Materials
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  
  // PDF upload form states
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfDescription, setPdfDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // PDF edit dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editMaterial, setEditMaterial] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [updatingMetadata, setUpdatingMetadata] = useState(false);

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const token = user?.token;

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCourseDetails();
    fetchStudyMaterials();
  }, [courseId, token]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/courses/${courseId}`);
      if (response.data.success) {
        setCourseData(response.data.course);
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Error fetching course details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudyMaterials = async () => {
    try {
      setMaterialsLoading(true);
      const response = await axios.get(`http://localhost:5000/api/study-materials/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setMaterials(response.data.materials);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setMaterialsLoading(false);
    }
  };

  const showAlert = (message, severity = 'success') => {
    setAlertInfo({ show: true, message, severity });
    setTimeout(() => setAlertInfo({ show: false, message: '', severity: 'success' }), 5000);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // --- Course Overview Update ---
  const handleOverviewChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const saveCourseOverview = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...courseData,
        price: Number(courseData.price),
        rating: Number(courseData.rating)
      };

      const response = await axios.put(`http://localhost:5000/api/courses/${courseId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        showAlert('Course details updated successfully!');
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Error updating course details', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Curriculum Updates ---
  const handleSectionTitleChange = (sIndex, value) => {
    const updatedCurriculum = [...courseData.curriculum];
    updatedCurriculum[sIndex].sectionTitle = value;
    setCourseData({ ...courseData, curriculum: updatedCurriculum });
  };

  const handleLectureChange = (sIndex, lIndex, field, value) => {
    const updatedCurriculum = [...courseData.curriculum];
    const targetLecture = { ...updatedCurriculum[sIndex].lectures[lIndex] };
    
    if (field === 'isFreePreview') {
      targetLecture[field] = value === 'true' || value === true;
    } else {
      targetLecture[field] = value;
    }

    updatedCurriculum[sIndex].lectures[lIndex] = targetLecture;
    setCourseData({ ...courseData, curriculum: updatedCurriculum });
  };

  const addSection = () => {
    const newSection = {
      sectionTitle: '',
      lectures: [{ title: '', videoUrl: '', duration: '0:00', isFreePreview: false }]
    };
    setCourseData({
      ...courseData,
      curriculum: [...courseData.curriculum, newSection]
    });
  };

  const addLecture = (sIndex) => {
    const updatedCurriculum = [...courseData.curriculum];
    updatedCurriculum[sIndex].lectures.push({ title: '', videoUrl: '', duration: '0:00', isFreePreview: false });
    setCourseData({ ...courseData, curriculum: updatedCurriculum });
  };

  const removeSection = (sIndex) => {
    const updatedCurriculum = courseData.curriculum.filter((_, idx) => idx !== sIndex);
    setCourseData({ ...courseData, curriculum: updatedCurriculum });
  };

  const removeLecture = (sIndex, lIndex) => {
    const updatedCurriculum = [...courseData.curriculum];
    updatedCurriculum[sIndex].lectures = updatedCurriculum[sIndex].lectures.filter((_, idx) => idx !== lIndex);
    setCourseData({ ...courseData, curriculum: updatedCurriculum });
  };

  const saveCurriculum = async () => {
    try {
      setSubmitting(true);
      // Validate curriculum sections
      if (!courseData.curriculum || courseData.curriculum.length === 0) {
        showAlert('Each course must have at least one curriculum section.', 'error');
        return;
      }

      for (let s of courseData.curriculum) {
        if (!s.sectionTitle.trim()) {
          showAlert('All sections must have a valid section title.', 'error');
          return;
        }
        if (!s.lectures || s.lectures.length === 0) {
          showAlert('Each section must contain at least one lecture.', 'error');
          return;
        }
        for (let l of s.lectures) {
          if (!l.title.trim()) {
            showAlert('All lectures must have a valid title.', 'error');
            return;
          }
        }
      }

      const response = await axios.put(`http://localhost:5000/api/courses/${courseId}`, {
        curriculum: courseData.curriculum
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        showAlert('Curriculum saved successfully!');
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Error saving curriculum', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // --- PDF uploads & management handlers ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showAlert('Only PDF documents are allowed!', 'error');
        setSelectedFile(null);
        e.target.value = null;
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showAlert('File exceeds 10MB size limit.', 'error');
        setSelectedFile(null);
        e.target.value = null;
        return;
      }
      setSelectedFile(file);
    }
  };

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showAlert('Please choose a PDF file to upload.', 'error');
      return;
    }
    if (!pdfTitle.trim()) {
      showAlert('Please enter a title for the study material.', 'error');
      return;
    }

    try {
      setUploadingPdf(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', pdfTitle);
      formData.append('description', pdfDescription);
      formData.append('courseId', courseId);

      const response = await axios.post('http://localhost:5000/api/study-materials/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        showAlert('PDF study material uploaded successfully!');
        setPdfTitle('');
        setPdfDescription('');
        setSelectedFile(null);
        // Clear file input
        const fileInput = document.getElementById('pdf-file-picker');
        if (fileInput) fileInput.value = '';
        fetchStudyMaterials();
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Error uploading study material', 'error');
    } finally {
      setUploadingPdf(false);
    }
  };

  const openEditDialog = (material) => {
    setEditMaterial(material);
    setEditTitle(material.title);
    setEditDescription(material.description || '');
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditMaterial(null);
  };

  const handleUpdateMetadata = async () => {
    if (!editTitle.trim()) {
      showAlert('Title is required.', 'error');
      return;
    }

    try {
      setUpdatingMetadata(true);
      const response = await axios.put(
        `http://localhost:5000/api/study-materials/${editMaterial._id}`,
        { title: editTitle, description: editDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showAlert('Study material metadata updated!');
        closeEditDialog();
        fetchStudyMaterials();
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Error updating metadata', 'error');
    } finally {
      setUpdatingMetadata(false);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this study material? This cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5000/api/study-materials/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        showAlert('Study material deleted successfully.');
        fetchStudyMaterials();
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Error deleting material', 'error');
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

  if (!courseData) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Alert severity="error">Course not found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header & Back Button */}
      <Stack direction="row" spacing={2} sx={{ mb: 4, alignItems: 'center' }}>
        <IconButton onClick={() => navigate('/instructor/dashboard')} color="primary">
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight="bold">Course Customization Panel</Typography>
          <Typography variant="subtitle1" color="textSecondary">{courseData.title}</Typography>
        </Box>
      </Stack>

      {alertInfo.show && (
        <Alert severity={alertInfo.severity} sx={{ mb: 3 }}>
          {alertInfo.message}
        </Alert>
      )}

      {/* Tabs Layout */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fdfdfd' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab label="1. Overview Details" />
            <Tab label="2. Course Curriculum" />
            <Tab label="3. Study Materials (PDF)" />
          </Tabs>
        </Box>

        {/* TAB 1: OVERVIEW */}
        {tabValue === 0 && (
          <Box p={4} component="form" onSubmit={saveCourseOverview}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  label="Course Title"
                  name="title"
                  value={courseData.title}
                  onChange={handleOverviewChange}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Course Subtitle"
                  name="subtitle"
                  value={courseData.subtitle || ''}
                  onChange={handleOverviewChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Category"
                  name="category"
                  value={courseData.category}
                  onChange={handleOverviewChange}
                >
                  <MenuItem value="Development">Development</MenuItem>
                  <MenuItem value="Business">Business</MenuItem>
                  <MenuItem value="Design">Design</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Difficulty Level"
                  name="level"
                  value={courseData.level}
                  onChange={handleOverviewChange}
                >
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Expert">Expert</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Price (INR)"
                  name="price"
                  value={courseData.price}
                  onChange={handleOverviewChange}
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>
                    }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Thumbnail Image URL"
                  name="thumbnailUrl"
                  value={courseData.thumbnailUrl || ''}
                  onChange={handleOverviewChange}
                />
              </Grid>
              {courseData.thumbnailUrl && (
                <Grid size={{ xs: 12 }} sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ mb: 1, display: 'block' }}>Thumbnail Preview:</Typography>
                  <Box
                    component="img"
                    src={courseData.thumbnailUrl}
                    alt="Course Preview"
                    sx={{ maxHeight: 200, maxWidth: '100%', borderRadius: 2, objectFit: 'cover', border: '1px solid #ccc' }}
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  required
                  label="Detailed Course Description"
                  name="description"
                  value={courseData.description}
                  onChange={handleOverviewChange}
                />
              </Grid>
            </Grid>
            <Box mt={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                type="submit"
                startIcon={<Save />}
                disabled={submitting}
                size="large"
              >
                {submitting ? 'Saving...' : 'Save Overview'}
              </Button>
            </Box>
          </Box>
        )}

        {/* TAB 2: CURRICULUM */}
        {tabValue === 1 && (
          <Box p={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Modify Video Curriculum Structure</Typography>
            <Divider sx={{ mb: 3 }} />

            {courseData.curriculum && courseData.curriculum.map((section, sIdx) => (
              <Card key={sIdx} sx={{ mb: 3, p: 3, border: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <TextField
                    label={`Section ${sIdx + 1} Title`}
                    value={section.sectionTitle}
                    onChange={(e) => handleSectionTitleChange(sIdx, e.target.value)}
                    sx={{ flexGrow: 1, mr: 2 }}
                    required
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => removeSection(sIdx)}
                  >
                    Delete Section
                  </Button>
                </Stack>

                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 'bold' }}>Lectures:</Typography>
                
                {section.lectures.map((lecture, lIdx) => (
                  <Paper key={lIdx} variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#ffffff' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Lecture Title"
                          value={lecture.title}
                          onChange={(e) => handleLectureChange(sIdx, lIdx, 'title', e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Video URL"
                          value={lecture.videoUrl}
                          onChange={(e) => handleLectureChange(sIdx, lIdx, 'videoUrl', e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Duration"
                          value={lecture.duration}
                          onChange={(e) => handleLectureChange(sIdx, lIdx, 'duration', e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 1 }}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Preview"
                          value={lecture.isFreePreview ? 'true' : 'false'}
                          onChange={(e) => handleLectureChange(sIdx, lIdx, 'isFreePreview', e.target.value)}
                        >
                          <MenuItem value="true">Free</MenuItem>
                          <MenuItem value="false">Paid</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 1 }}>
                        <IconButton color="error" onClick={() => removeLecture(sIdx, lIdx)}>
                          <Delete />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}

                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => addLecture(sIdx)}
                  sx={{ mt: 1 }}
                >
                  + Add Lecture
                </Button>
              </Card>
            ))}

            <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={<AddCircle />}
                onClick={addSection}
              >
                Add Curriculum Section
              </Button>

              <Button
                variant="contained"
                startIcon={<Save />}
                color="primary"
                onClick={saveCurriculum}
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Curriculum'}
              </Button>
            </Stack>
          </Box>
        )}

        {/* TAB 3: STUDY MATERIALS (PDF UPLOAD) */}
        {tabValue === 2 && (
          <Box p={4}>
            <Grid container spacing={4}>
              {/* UPLOAD FORM */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>Upload Study Materials (PDF)</Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box component="form" onSubmit={handlePdfUpload}>
                    <TextField
                      fullWidth
                      required
                      label="Material Title"
                      value={pdfTitle}
                      onChange={(e) => setPdfTitle(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Short Description"
                      value={pdfDescription}
                      onChange={(e) => setPdfDescription(e.target.value)}
                      sx={{ mb: 3 }}
                    />

                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<UploadFile />}
                      sx={{ mb: 2, py: 1.5, borderStyle: 'dashed' }}
                    >
                      {selectedFile ? selectedFile.name : 'Select PDF File (Max 10MB)'}
                      <input
                        type="file"
                        id="pdf-file-picker"
                        hidden
                        accept="application/pdf"
                        onChange={handleFileChange}
                      />
                    </Button>
                    {selectedFile && (
                      <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block', textAlign: 'center' }}>
                        File size: {formatBytes(selectedFile.size)}
                      </Typography>
                    )}

                    <Button
                      variant="contained"
                      type="submit"
                      fullWidth
                      size="large"
                      disabled={uploadingPdf}
                      sx={{ mt: 1 }}
                    >
                      {uploadingPdf ? <CircularProgress size={24} color="inherit" /> : 'Upload Material'}
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              {/* UPLOADED MATERIALS LIST */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Manage Uploaded PDF Resources</Typography>
                <Divider sx={{ mb: 2 }} />

                {materialsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : materials.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#fafafa' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Title / Info</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {materials.map((mat) => (
                          <TableRow key={mat._id}>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{mat.title}</Typography>
                              {mat.description && (
                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {mat.description}
                                </Typography>
                              )}
                              <Typography variant="caption" color="grey.500" sx={{ display: 'block' }}>
                                Uploaded: {new Date(mat.createdAt).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>{formatBytes(mat.fileSize)}</TableCell>
                            <TableCell align="right">
                              <IconButton
                                color="primary"
                                component="a"
                                href={mat.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="small"
                                title="View PDF"
                              >
                                <OpenInNew />
                              </IconButton>
                              <IconButton
                                color="warning"
                                onClick={() => openEditDialog(mat)}
                                size="small"
                                title="Edit Details"
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteMaterial(mat._id)}
                                size="small"
                                title="Delete"
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#fafafa', borderRadius: 2, border: '1px dashed #ccc' }}>
                    <Typography variant="body1" color="textSecondary">No study materials uploaded yet.</Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                      Use the upload panel to attach PDF files for enrolled students.
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* METADATA EDIT DIALOG */}
      <Dialog open={editDialogOpen} onClose={closeEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Edit Material Metadata</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            required
            margin="dense"
            label="Material Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            margin="dense"
            label="Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeEditDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateMetadata}
            disabled={updatingMetadata}
          >
            {updatingMetadata ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EditCourse;
