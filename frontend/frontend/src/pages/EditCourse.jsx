import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from "../utils/apiClient";
import {
  Container, Typography, Box, Tabs, Tab, TextField, Button,
  Grid, MenuItem, Stack, IconButton, CircularProgress,
  Alert, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment
} from '@mui/material';
import {
  Save, Delete, Edit, OpenInNew, UploadFile, ArrowBack, AddCircle
} from '@mui/icons-material';

// ── Design tokens ──────────────────────────────────────────────────────────────
const t = {
  bg:             '#050b16',
  bgCard:         'rgba(255,255,255,0.04)',
  bgInput:        'rgba(255,255,255,0.05)',
  border:         '1px solid rgba(255,255,255,0.08)',
  accent:         '#64ffda',
  accentDim:      'rgba(100,255,218,0.12)',
  blue:           '#3b82f6',
  red:            '#f87171',
  redDim:         'rgba(248,113,113,0.12)',
  amber:          '#fbbf24',
  amberDim:       'rgba(251,191,36,0.12)',
  text:           '#e2e8f0',
  textMuted:      'rgba(226,232,240,0.6)',
  textFaint:      'rgba(226,232,240,0.35)',
  blur:           'blur(20px)',
  radius:         '12px',
  radiusSm:       '8px',
  transition:     'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
};

const glassPanel = {
  background:           t.bgCard,
  border:               t.border,
  backdropFilter:       t.blur,
  WebkitBackdropFilter: t.blur,
  borderRadius:         t.radius,
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    background: t.bgInput,
    borderRadius: t.radiusSm,
    color: t.text,
    fontSize: 14,
    transition: t.transition,
    '& fieldset':             { borderColor: 'rgba(255,255,255,0.1)' },
    '&:hover fieldset':       { borderColor: 'rgba(255,255,255,0.22)' },
    '&.Mui-focused fieldset': { borderColor: t.accent, borderWidth: 1 },
  },
  '& .MuiInputLabel-root':              { color: t.textFaint, fontSize: 13 },
  '& .MuiInputLabel-root.Mui-focused':  { color: t.accent },
  '& .MuiSelect-icon':                  { color: t.textMuted },
  '& .MuiInputAdornment-root .MuiTypography-root': { color: t.textMuted, fontSize: 13 },
};

const primaryBtn = {
  background:    `linear-gradient(135deg, #64ffda, #00bfa5)`,
  color:         '#050b16',
  fontWeight:    700,
  fontSize:      13,
  letterSpacing: '0.04em',
  borderRadius:  '8px',
  px: 3, py: 1.1,
  boxShadow:     `0 0 20px rgba(100,255,218,0.2)`,
  transition:    'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: `linear-gradient(135deg, #80ffeb, #64ffda)`,
    boxShadow:  `0 0 32px rgba(100,255,218,0.35)`,
    transform:  'translateY(-1px)',
  },
  '&:disabled': { background: 'rgba(255,255,255,0.08)', color: 'rgba(226,232,240,0.35)', boxShadow: 'none' },
};

const ghostBtn = {
  background:    'transparent',
  border:        '1px solid rgba(255,255,255,0.08)',
  color:         'rgba(226,232,240,0.6)',
  fontWeight:    600,
  fontSize:      13,
  letterSpacing: '0.03em',
  borderRadius:  '8px',
  transition:    'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background:  'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.2)',
    color:       '#e2e8f0',
  },
};

const dangerBtn = {
  background:   'rgba(248,113,113,0.12)',
  border:       '1px solid rgba(248,113,113,0.2)',
  color:        '#f87171',
  fontWeight:   600,
  fontSize:     12,
  borderRadius: '8px',
  transition:   'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background:  'rgba(248,113,113,0.22)',
    borderColor: 'rgba(248,113,113,0.4)',
    transform:   'translateY(-1px)',
  },
};

// ── Tab label ──────────────────────────────────────────────────────────────────
const TabLabel = ({ step, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
    <Box sx={{
      width: 22, height: 22, borderRadius: '50%',
      background: 'rgba(100,255,218,0.12)',
      border: '1px solid rgba(100,255,218,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, fontWeight: 700, color: '#64ffda', flexShrink: 0,
    }}>
      {step}
    </Box>
    <Typography sx={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.03em' }}>{label}</Typography>
  </Box>
);

// ── Delete confirm dialog ──────────────────────────────────────────────────────
const ConfirmDialog = ({ open, onConfirm, onCancel, message }) => (
  <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth
    PaperProps={{ sx: { background: '#0d1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' } }}>
    <DialogTitle sx={{ color: '#e2e8f0', fontWeight: 700, fontSize: 15 }}>Confirm Delete</DialogTitle>
    <DialogContent>
      <Typography sx={{ color: 'rgba(226,232,240,0.6)', fontSize: 13, lineHeight: 1.7 }}>{message}</Typography>
    </DialogContent>
    <DialogActions sx={{ p: 2.5, gap: 1 }}>
      <Button onClick={onCancel} sx={{ ...ghostBtn, px: 2.5 }}>Cancel</Button>
      <Button onClick={onConfirm} sx={{ ...dangerBtn, px: 2.5, py: 0.9 }}>Delete</Button>
    </DialogActions>
  </Dialog>
);

// ── Main component ─────────────────────────────────────────────────────────────
const EditCourse = () => {
  const { courseId } = useParams();
  const navigate     = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  // token needed only for the auth guard — apiClient injects it on every request
  const token = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user'))?.token ?? null; }
    catch { return null; }
  }, []);

  const [courseData,  setCourseData]  = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);

  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', severity: 'success' });
  const alertTimerRef = useRef(null);

  const showAlert = useCallback((message, severity = 'success') => {
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    setAlertInfo({ show: true, message, severity });
    alertTimerRef.current = setTimeout(
      () => setAlertInfo({ show: false, message: '', severity: 'success' }),
      5000
    );
  }, []);

  useEffect(() => () => { if (alertTimerRef.current) clearTimeout(alertTimerRef.current); }, []);

  const [materials,        setMaterials]        = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [pdfTitle,         setPdfTitle]         = useState('');
  const [pdfDescription,   setPdfDescription]   = useState('');
  const [selectedFile,     setSelectedFile]     = useState(null);
  const [uploadingPdf,     setUploadingPdf]     = useState(false);
  const [editDialogOpen,   setEditDialogOpen]   = useState(false);
  const [editMaterial,     setEditMaterial]     = useState(null);
  const [editTitle,        setEditTitle]        = useState('');
  const [editDescription,  setEditDescription]  = useState('');
  const [updatingMetadata, setUpdatingMetadata] = useState(false);
  const [confirmOpen,      setConfirmOpen]      = useState(false);
  const [pendingDeleteId,  setPendingDeleteId]  = useState(null);

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  // ── Data fetching — apiClient handles baseURL and Authorization header ────
  const fetchCourseDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/courses/${courseId}`);
      if (res.data.success) setCourseData(res.data.course);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Error fetching course details', 'error');
    } finally {
      setLoading(false);
    }
  }, [courseId, showAlert]);

  const fetchStudyMaterials = useCallback(async () => {
    try {
      setMaterialsLoading(true);
      const res = await apiClient.get(`/study-materials/course/${courseId}`);
      if (res.data.success) setMaterials(res.data.materials);
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setMaterialsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (!token) return;
    fetchCourseDetails();
    fetchStudyMaterials();
  }, [fetchCourseDetails, fetchStudyMaterials, token]);

  // ── Overview ─────────────────────────────────────────────────────────────
  const handleOverviewChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const saveCourseOverview = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const { rating: _omit, ...rest } = courseData;
      const res = await apiClient.put(`/courses/${courseId}`, { ...rest, price: Number(courseData.price) });
      if (res.data.success) showAlert('Course details updated successfully!');
    } catch (err) {
      showAlert(err.response?.data?.message || 'Error updating course details', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Curriculum ───────────────────────────────────────────────────────────
  const handleSectionTitleChange = (sIndex, value) => {
    setCourseData((prev) => ({
      ...prev,
      curriculum: prev.curriculum.map((sec, i) => i === sIndex ? { ...sec, sectionTitle: value } : sec),
    }));
  };

  const handleLectureChange = (sIndex, lIndex, field, value) => {
    setCourseData((prev) => ({
      ...prev,
      curriculum: prev.curriculum.map((sec, si) => si !== sIndex ? sec : {
        ...sec,
        lectures: sec.lectures.map((lec, li) => li !== lIndex ? lec : {
          ...lec,
          [field]: field === 'isFreePreview' ? value === 'true' || value === true : value,
        }),
      }),
    }));
  };

  const addSection = () =>
    setCourseData((prev) => ({
      ...prev,
      curriculum: [...prev.curriculum, { sectionTitle: '', lectures: [{ title: '', videoUrl: '', duration: '0:00', isFreePreview: false }] }],
    }));

  const addLecture = (sIndex) =>
    setCourseData((prev) => ({
      ...prev,
      curriculum: prev.curriculum.map((sec, i) =>
        i === sIndex ? { ...sec, lectures: [...sec.lectures, { title: '', videoUrl: '', duration: '0:00', isFreePreview: false }] } : sec
      ),
    }));

  const removeSection = (sIndex) =>
    setCourseData((prev) => ({ ...prev, curriculum: prev.curriculum.filter((_, i) => i !== sIndex) }));

  const removeLecture = (sIndex, lIndex) =>
    setCourseData((prev) => ({
      ...prev,
      curriculum: prev.curriculum.map((sec, i) =>
        i === sIndex ? { ...sec, lectures: sec.lectures.filter((_, li) => li !== lIndex) } : sec
      ),
    }));

  const saveCurriculum = async () => {
    if (!courseData.curriculum?.length) { showAlert('Add at least one section before saving.', 'error'); return; }
    for (const s of courseData.curriculum) {
      if (!s.sectionTitle.trim()) { showAlert('Every section needs a title.', 'error'); return; }
      if (!s.lectures?.length)    { showAlert('Every section needs at least one lecture.', 'error'); return; }
      for (const l of s.lectures) {
        if (!l.title.trim()) { showAlert('Every lecture needs a title.', 'error'); return; }
      }
    }
    try {
      setSubmitting(true);
      const res = await apiClient.put(`/courses/${courseId}`, { curriculum: courseData.curriculum });
      if (res.data.success) showAlert('Curriculum saved successfully!');
    } catch (err) {
      showAlert(err.response?.data?.message || 'Error saving curriculum', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── PDF upload ───────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      showAlert('Only PDF documents are allowed.', 'error');
      setSelectedFile(null); e.target.value = null; return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showAlert('File exceeds the 10 MB size limit.', 'error');
      setSelectedFile(null); e.target.value = null; return;
    }
    setSelectedFile(file);
  };

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile)    { showAlert('Choose a PDF file first.', 'error'); return; }
    if (!pdfTitle.trim()) { showAlert('Enter a title for the material.', 'error'); return; }
    try {
      setUploadingPdf(true);
      const formData = new FormData();
      formData.append('file',        selectedFile);
      formData.append('title',       pdfTitle);
      formData.append('description', pdfDescription);
      formData.append('courseId',    courseId);
      // Override Content-Type for multipart — apiClient default is application/json
      const res = await apiClient.post('/study-materials/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        showAlert('PDF uploaded successfully!');
        setPdfTitle(''); setPdfDescription(''); setSelectedFile(null);
        const picker = document.getElementById('pdf-file-picker');
        if (picker) picker.value = '';
        fetchStudyMaterials();
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Error uploading study material', 'error');
    } finally {
      setUploadingPdf(false);
    }
  };

  // ── Edit metadata dialog ─────────────────────────────────────────────────
  const openEditDialog  = (mat) => { setEditMaterial(mat); setEditTitle(mat.title); setEditDescription(mat.description || ''); setEditDialogOpen(true); };
  const closeEditDialog = ()    => { setEditDialogOpen(false); setEditMaterial(null); };

  const handleUpdateMetadata = async () => {
    if (!editTitle.trim()) { showAlert('Title is required.', 'error'); return; }
    try {
      setUpdatingMetadata(true);
      const res = await apiClient.put(`/study-materials/${editMaterial._id}`, { title: editTitle, description: editDescription });
      if (res.data.success) { showAlert('Material updated.'); closeEditDialog(); fetchStudyMaterials(); }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Error updating material', 'error');
    } finally {
      setUpdatingMetadata(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const requestDelete = (id) => { setPendingDeleteId(id); setConfirmOpen(true); };
  const cancelDelete  = ()   => { setConfirmOpen(false); setPendingDeleteId(null); };

  const confirmDelete = async () => {
    setConfirmOpen(false);
    try {
      const res = await apiClient.delete(`/study-materials/${pendingDeleteId}`);
      if (res.data.success) { showAlert('Material deleted.'); fetchStudyMaterials(); }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Error deleting material', 'error');
    } finally {
      setPendingDeleteId(null);
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024, dm = Math.max(0, decimals);
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#050b16' }}>
      <CircularProgress sx={{ color: '#64ffda' }} />
    </Box>
  );

  if (!courseData) return (
    <Box sx={{ minHeight: '100vh', background: '#050b16', pt: 8 }}>
      <Container maxWidth="md">
        <Alert severity="error" sx={{ borderRadius: '8px' }}>Course not found.</Alert>
      </Container>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', background: '#050b16', py: 5 }}>
      <Container maxWidth="lg">

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 5 }}>
          <IconButton onClick={() => navigate('/instructor/dashboard')} sx={{
            color: 'rgba(226,232,240,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
            width: 40, height: 40, transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': { background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', borderColor: 'rgba(255,255,255,0.2)' },
          }}>
            <ArrowBack sx={{ fontSize: 18 }} />
          </IconButton>
          <Box>
            <Typography sx={{ fontSize: { xs: 20, md: 26 }, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
              Course Customization Panel
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'rgba(226,232,240,0.6)', mt: 0.25, lineHeight: 1.7 }}>
              {courseData.title}
            </Typography>
          </Box>
        </Stack>

        {alertInfo.show && (
          <Alert severity={alertInfo.severity} sx={{
            mb: 3, borderRadius: '8px',
            background: alertInfo.severity === 'success' ? 'rgba(100,255,218,0.08)' : 'rgba(248,113,113,0.08)',
            border:     alertInfo.severity === 'success' ? '1px solid rgba(100,255,218,0.2)' : '1px solid rgba(248,113,113,0.2)',
            color:      alertInfo.severity === 'success' ? '#64ffda' : '#f87171',
            '& .MuiAlert-icon': { color: 'inherit' },
          }}>
            {alertInfo.message}
          </Alert>
        )}

        <Box sx={{ ...glassPanel, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', px: { xs: 1, md: 3 } }}>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto" sx={{
              minHeight: 56,
              '& .MuiTabs-indicator': { background: 'linear-gradient(90deg, #64ffda, #00bfa5)', height: 2, borderRadius: 2 },
              '& .MuiTab-root': {
                color: 'rgba(226,232,240,0.35)', fontWeight: 600, fontSize: 12,
                letterSpacing: '0.02em', minHeight: 56, textTransform: 'none',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&.Mui-selected': { color: '#64ffda' },
                '&:hover': { color: 'rgba(226,232,240,0.6)' },
              },
            }}>
              <Tab label={<TabLabel step="1" label="Overview" />} />
              <Tab label={<TabLabel step="2" label="Curriculum" />} />
              <Tab label={<TabLabel step="3" label="Study Materials" />} />
            </Tabs>
          </Box>

          {/* TAB 1: OVERVIEW */}
          {tabValue === 0 && (
            <Box sx={{ p: { xs: 3, md: 5 } }} component="form" onSubmit={saveCourseOverview}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', mb: 0.5, letterSpacing: '-0.01em' }}>Course Overview</Typography>
              <Typography sx={{ fontSize: 13, color: 'rgba(226,232,240,0.6)', mb: 4, lineHeight: 1.7 }}>Update the details students see on the course listing page.</Typography>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth required label="Course Title" name="title" value={courseData.title} onChange={handleOverviewChange} sx={inputSx} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Course Subtitle" name="subtitle" value={courseData.subtitle || ''} onChange={handleOverviewChange} sx={inputSx} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField select fullWidth required label="Category" name="category" value={courseData.category} onChange={handleOverviewChange} sx={inputSx}
                    SelectProps={{ MenuProps: { PaperProps: { sx: { background: '#0d1829', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0' } } } }}>
                    {['Development', 'Business', 'Design', 'Marketing'].map((v) => (
                      <MenuItem key={v} value={v} sx={{ fontSize: 13, '&:hover': { background: 'rgba(100,255,218,0.12)' } }}>{v}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField select fullWidth required label="Difficulty Level" name="level" value={courseData.level} onChange={handleOverviewChange} sx={inputSx}
                    SelectProps={{ MenuProps: { PaperProps: { sx: { background: '#0d1829', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0' } } } }}>
                    {['Beginner', 'Intermediate', 'Expert'].map((v) => (
                      <MenuItem key={v} value={v} sx={{ fontSize: 13, '&:hover': { background: 'rgba(100,255,218,0.12)' } }}>{v}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth required type="number" label="Price (INR)" name="price" value={courseData.price} onChange={handleOverviewChange} sx={inputSx}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><Typography sx={{ color: 'rgba(226,232,240,0.6)', fontSize: 13 }}>₹</Typography></InputAdornment> } }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Thumbnail Image URL" name="thumbnailUrl" value={courseData.thumbnailUrl || ''} onChange={handleOverviewChange} sx={inputSx} />
                </Grid>
                {courseData.thumbnailUrl && (
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ p: 2, borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                      <Typography sx={{ fontSize: 11, color: 'rgba(226,232,240,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>Thumbnail Preview</Typography>
                      <Box component="img" src={courseData.thumbnailUrl} alt="Course thumbnail preview"
                        sx={{ width: '100%', maxWidth: 380, aspectRatio: '16/9', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', display: 'block' }} />
                    </Box>
                  </Grid>
                )}
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth multiline rows={4} required label="Detailed Course Description" name="description" value={courseData.description} onChange={handleOverviewChange} sx={inputSx} />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <Button variant="contained" type="submit" startIcon={<Save sx={{ fontSize: 16 }} />} disabled={submitting} sx={primaryBtn}>
                  {submitting ? 'Saving…' : 'Save Overview'}
                </Button>
              </Box>
            </Box>
          )}

          {/* TAB 2: CURRICULUM */}
          {tabValue === 1 && (
            <Box sx={{ p: { xs: 3, md: 5 } }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', mb: 0.5, letterSpacing: '-0.01em' }}>Video Curriculum</Typography>
              <Typography sx={{ fontSize: 13, color: 'rgba(226,232,240,0.6)', mb: 4, lineHeight: 1.7 }}>Organise your course into sections and lectures.</Typography>

              {courseData.curriculum?.map((section, sIdx) => (
                <Box key={sIdx} sx={{ mb: 2.5, borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(100,255,218,0.04)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1, mr: 2 }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#64ffda', textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0 }}>§{sIdx + 1}</Typography>
                      <TextField fullWidth size="small" placeholder={`Section ${sIdx + 1} title…`} value={section.sectionTitle}
                        onChange={(e) => handleSectionTitleChange(sIdx, e.target.value)}
                        sx={{ ...inputSx, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], fontSize: 13, fontWeight: 600 } }} />
                    </Box>
                    <Button variant="outlined" size="small" onClick={() => removeSection(sIdx)} sx={{ ...dangerBtn, px: 2, py: 0.7, fontSize: 11, flexShrink: 0 }}>Remove</Button>
                  </Box>

                  <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {section.lectures.map((lecture, lIdx) => (
                      <Box key={lIdx} sx={{ p: 2, borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.14)' } }}>
                        <Grid container spacing={1.5} alignItems="center">
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth size="small" label="Lecture Title" value={lecture.title} onChange={(e) => handleLectureChange(sIdx, lIdx, 'title', e.target.value)} required sx={inputSx} />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 3.5 }}>
                            <TextField fullWidth size="small" label="Video URL" value={lecture.videoUrl} onChange={(e) => handleLectureChange(sIdx, lIdx, 'videoUrl', e.target.value)} sx={inputSx} />
                          </Grid>
                          <Grid size={{ xs: 6, sm: 1.5 }}>
                            <TextField fullWidth size="small" label="Duration" value={lecture.duration} onChange={(e) => handleLectureChange(sIdx, lIdx, 'duration', e.target.value)} sx={inputSx} />
                          </Grid>
                          <Grid size={{ xs: 6, sm: 2 }}>
                            <TextField select fullWidth size="small" label="Access" value={lecture.isFreePreview ? 'true' : 'false'} onChange={(e) => handleLectureChange(sIdx, lIdx, 'isFreePreview', e.target.value)} sx={inputSx}
                              SelectProps={{ MenuProps: { PaperProps: { sx: { background: '#0d1829', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0' } } } }}>
                              <MenuItem value="true"  sx={{ fontSize: 12, color: '#64ffda', '&:hover': { background: 'rgba(100,255,218,0.12)' } }}>Free</MenuItem>
                              <MenuItem value="false" sx={{ fontSize: 12, '&:hover': { background: 'rgba(255,255,255,0.05)' } }}>Paid</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 1 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-end', sm: 'center' } }}>
                            <IconButton size="small" onClick={() => removeLecture(sIdx, lIdx)} sx={{ color: 'rgba(226,232,240,0.35)', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { color: '#f87171', background: 'rgba(248,113,113,0.12)' } }}>
                              <Delete sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                    <Button size="small" onClick={() => addLecture(sIdx)} sx={{ ...ghostBtn, alignSelf: 'flex-start', px: 2, py: 0.7, fontSize: 12, borderStyle: 'dashed' }}>
                      + Add Lecture
                    </Button>
                  </Box>
                </Box>
              ))}

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3, justifyContent: 'space-between' }}>
                <Button variant="outlined" startIcon={<AddCircle sx={{ fontSize: 16 }} />} onClick={addSection} sx={{ ...ghostBtn, px: 3, py: 1.1 }}>Add Section</Button>
                <Button variant="contained" startIcon={<Save sx={{ fontSize: 16 }} />} onClick={saveCurriculum} disabled={submitting} sx={primaryBtn}>
                  {submitting ? 'Saving…' : 'Save Curriculum'}
                </Button>
              </Stack>
            </Box>
          )}

          {/* TAB 3: STUDY MATERIALS */}
          {tabValue === 2 && (
            <Box sx={{ p: { xs: 3, md: 5 } }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', mb: 0.5, letterSpacing: '-0.01em' }}>Study Materials</Typography>
              <Typography sx={{ fontSize: 13, color: 'rgba(226,232,240,0.6)', mb: 4, lineHeight: 1.7 }}>Upload PDF resources that enrolled students can download.</Typography>

              <Grid container spacing={3} alignItems="flex-start">
                <Grid size={{ xs: 12, md: 5 }}>
                  <Box sx={{ ...glassPanel, p: 3 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', mb: 2.5 }}>Upload New PDF</Typography>
                    <Box component="form" onSubmit={handlePdfUpload} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField fullWidth required label="Material Title" value={pdfTitle} onChange={(e) => setPdfTitle(e.target.value)} sx={inputSx} />
                      <TextField fullWidth multiline rows={2} label="Short Description" value={pdfDescription} onChange={(e) => setPdfDescription(e.target.value)} sx={inputSx} />
                      <Button variant="outlined" component="label" fullWidth startIcon={<UploadFile sx={{ fontSize: 16 }} />}
                        sx={{ ...ghostBtn, py: 1.8, borderStyle: 'dashed', flexDirection: 'column', gap: 0.5, '&:hover': { ...ghostBtn['&:hover'], borderStyle: 'dashed' } }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{selectedFile ? selectedFile.name : 'Select PDF File'}</Typography>
                        {!selectedFile
                          ? <Typography sx={{ fontSize: 10, color: 'rgba(226,232,240,0.35)' }}>Max 10 MB</Typography>
                          : <Typography sx={{ fontSize: 10, color: 'rgba(226,232,240,0.6)' }}>{formatBytes(selectedFile.size)}</Typography>
                        }
                        <input type="file" id="pdf-file-picker" hidden accept="application/pdf" onChange={handleFileChange} />
                      </Button>
                      <Button variant="contained" type="submit" fullWidth disabled={uploadingPdf} sx={{ ...primaryBtn, py: 1.2 }}>
                        {uploadingPdf ? <CircularProgress size={18} sx={{ color: '#050b16' }} /> : 'Upload Material'}
                      </Button>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 7 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', mb: 2.5 }}>
                    Uploaded Resources
                    {materials.length > 0 && (
                      <Box component="span" sx={{ ml: 1.5, px: 1.25, py: 0.25, borderRadius: 10, background: 'rgba(100,255,218,0.12)', color: '#64ffda', fontSize: 10, fontWeight: 700 }}>
                        {materials.length}
                      </Box>
                    )}
                  </Typography>

                  {materialsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                      <CircularProgress sx={{ color: '#64ffda' }} size={28} />
                    </Box>
                  ) : materials.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {materials.map((mat) => (
                        <Box key={mat._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', gap: 2, '&:hover': { background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.14)' } }}>
                          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mat.title}</Typography>
                            {mat.description && <Typography sx={{ fontSize: 11, color: 'rgba(226,232,240,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', mt: 0.25 }}>{mat.description}</Typography>}
                            <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                              <Typography sx={{ fontSize: 10, color: 'rgba(226,232,240,0.35)' }}>{formatBytes(mat.fileSize)}</Typography>
                              <Typography sx={{ fontSize: 10, color: 'rgba(226,232,240,0.35)' }}>{new Date(mat.createdAt).toLocaleDateString()}</Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                            <IconButton component="a" href={mat.fileUrl} target="_blank" rel="noopener noreferrer" size="small" title="View PDF"
                              sx={{ color: 'rgba(226,232,240,0.35)', borderRadius: '8px', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { color: '#64ffda', background: 'rgba(100,255,218,0.12)' } }}>
                              <OpenInNew sx={{ fontSize: 15 }} />
                            </IconButton>
                            <IconButton size="small" onClick={() => openEditDialog(mat)} title="Edit details"
                              sx={{ color: 'rgba(226,232,240,0.35)', borderRadius: '8px', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { color: '#fbbf24', background: 'rgba(251,191,36,0.12)' } }}>
                              <Edit sx={{ fontSize: 15 }} />
                            </IconButton>
                            <IconButton size="small" onClick={() => requestDelete(mat._id)} title="Delete"
                              sx={{ color: 'rgba(226,232,240,0.35)', borderRadius: '8px', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { color: '#f87171', background: 'rgba(248,113,113,0.12)' } }}>
                              <Delete sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ py: 6, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                      <Typography sx={{ fontSize: 13, color: 'rgba(226,232,240,0.6)' }}>No study materials yet.</Typography>
                      <Typography sx={{ fontSize: 11, color: 'rgba(226,232,240,0.35)', mt: 0.5, lineHeight: 1.7 }}>Upload PDFs for enrolled students to download.</Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Container>

      <Dialog open={editDialogOpen} onClose={closeEditDialog} maxWidth="sm" fullWidth
        PaperProps={{ sx: { background: '#0d1829', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' } }}>
        <DialogTitle sx={{ color: '#e2e8f0', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em', pb: 1 }}>Edit Material Details</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField fullWidth required margin="dense" label="Material Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} sx={{ ...inputSx, mt: 1, mb: 2 }} />
          <TextField fullWidth multiline rows={3} margin="dense" label="Description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} sx={inputSx} />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
          <Button onClick={closeEditDialog} sx={{ ...ghostBtn, px: 2.5 }}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateMetadata} disabled={updatingMetadata} sx={primaryBtn}>
            {updatingMetadata ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={confirmOpen} onConfirm={confirmDelete} onCancel={cancelDelete} message="Delete this study material? This cannot be undone." />
    </Box>
  );
};

export default EditCourse;