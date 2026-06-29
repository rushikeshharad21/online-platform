// src/pages/CourseViewer.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CircularProgress, Alert, Dialog, DialogContent, IconButton
} from '@mui/material';
import {
  ExpandMore, PlayArrow, Lock, Download, School,
  LockOpen, MenuBook, Info, Close as CloseIcon,
  QuizOutlined as QuizOutlinedIcon,
} from '@mui/icons-material';
import apiClient from '../utils/apiClient';

// FIX: axios removed entirely — apiClient handles all requests, auth headers, and 401 redirect

const getEmbedUrl = (url) => {
  if (!url) return '';
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  return url;
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #060d1f 0%, #0a1628 50%, #0d1f3c 100%)',
    padding: '1.5rem 1rem 4rem',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#e2e8f0',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  glass: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
  },
  heroCard: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: 'clamp(1.25rem, 4vw, 2.5rem)',
    marginBottom: '2rem',
  },
  badge: (color) => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    background: color === 'blue' ? 'rgba(59,130,246,0.2)' : 'rgba(168,85,247,0.2)',
    color: color === 'blue' ? '#93c5fd' : '#d8b4fe',
    border: `1px solid ${color === 'blue' ? 'rgba(59,130,246,0.3)' : 'rgba(168,85,247,0.3)'}`,
    marginRight: '8px',
    marginBottom: '16px',
  }),
  h1: {
    fontSize: 'clamp(1.4rem, 4vw, 2.8rem)',
    fontWeight: '700',
    color: '#f1f5f9',
    margin: '0 0 0.75rem',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: 'clamp(0.875rem, 2vw, 1.05rem)',
    color: '#94a3b8',
    margin: '0 0 1.25rem',
    fontWeight: '400',
    lineHeight: 1.6,
  },
  metaRow: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#94a3b8',
  },
  metaStrong: {
    color: '#cbd5e1',
    fontWeight: '500',
  },
  thumbnailPlaceholder: {
    width: '100%',
    maxWidth: '220px',
    height: '140px',
    borderRadius: '12px',
    background: 'rgba(59,130,246,0.1)',
    border: '1px solid rgba(59,130,246,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(59,130,246,0.5)',
    flexShrink: 0,
  },
  thumbnailImg: {
    width: '100%',
    maxWidth: '220px',
    height: '140px',
    borderRadius: '12px',
    objectFit: 'cover',
    border: '1px solid rgba(255,255,255,0.1)',
    flexShrink: 0,
  },
  sectionLabel: {
    fontSize: '0.7rem',
    fontWeight: '700',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#3b82f6',
    marginBottom: '0.75rem',
    display: 'block',
  },
  sectionTitle: {
    fontSize: 'clamp(1.1rem, 3vw, 1.35rem)',
    fontWeight: '600',
    color: '#e2e8f0',
    margin: '0 0 1rem',
  },
  descriptionCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: 'clamp(1rem, 3vw, 1.5rem)',
    marginBottom: '2rem',
    lineHeight: 1.8,
    color: '#94a3b8',
    fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
    whiteSpace: 'pre-line',
  },
  accordionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    cursor: 'pointer',
    userSelect: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  accordionTitle: {
    fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
    fontWeight: '600',
    color: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sectionNum: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    background: 'rgba(59,130,246,0.2)',
    color: '#60a5fa',
    fontSize: '11px',
    fontWeight: '700',
    flexShrink: 0,
  },
  lectureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0.75rem 1.25rem',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    transition: 'background 0.15s',
    cursor: 'default',
  },
  lectureTitle: {
    fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
    color: '#cbd5e1',
    flex: 1,
  },
  lectureDuration: {
    fontSize: '0.775rem',
    color: '#475569',
    marginTop: '2px',
  },
  freeTag: {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: '3px 8px',
    borderRadius: '4px',
    background: 'rgba(16,185,129,0.15)',
    color: '#34d399',
    border: '1px solid rgba(16,185,129,0.25)',
    flexShrink: 0,
  },
  enrollCard: {
    background: 'linear-gradient(145deg, rgba(59,130,246,0.15) 0%, rgba(99,102,241,0.1) 100%)',
    border: '1px solid rgba(59,130,246,0.3)',
    borderRadius: '16px',
    padding: 'clamp(1.25rem, 3vw, 1.75rem)',
    marginBottom: '1.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  enrolledCard: {
    background: 'linear-gradient(145deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.08) 100%)',
    border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: '16px',
    padding: 'clamp(1.25rem, 3vw, 1.75rem)',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  price: {
    fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
    fontWeight: '800',
    color: '#f1f5f9',
    textAlign: 'center',
    marginBottom: '4px',
    letterSpacing: '-0.03em',
  },
  priceNote: {
    fontSize: '0.8rem',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: '1.25rem',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    margin: '1rem 0',
  },
  enrollBtn: {
    display: 'block',
    width: '100%',
    padding: '0.875rem',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.975rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s, transform 0.15s',
    letterSpacing: '0.01em',
  },
  unlockBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '0.5rem 1rem',
    background: 'rgba(59,130,246,0.15)',
    color: '#60a5fa',
    border: '1px solid rgba(59,130,246,0.3)',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.75rem',
  },
  materialsCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: 'clamp(1rem, 3vw, 1.5rem)',
  },
  materialsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '1rem',
  },
  materialItem: {
    padding: '0.875rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px',
    marginBottom: '10px',
  },
  materialTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: '4px',
  },
  materialDesc: {
    fontSize: '0.775rem',
    color: '#64748b',
    marginBottom: '10px',
  },
  materialMeta: {
    fontSize: '0.75rem',
    color: '#475569',
  },
  materialActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px',
    flexWrap: 'wrap',
  },
  viewBtn: {
    display: 'inline-block',
    padding: '5px 14px',
    background: 'transparent',
    color: '#60a5fa',
    border: '1px solid rgba(59,130,246,0.4)',
    borderRadius: '7px',
    fontSize: '0.775rem',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  downloadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 14px',
    background: 'rgba(59,130,246,0.15)',
    color: '#93c5fd',
    border: '1px solid rgba(59,130,246,0.3)',
    borderRadius: '7px',
    fontSize: '0.775rem',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  lockedBlock: {
    textAlign: 'center',
    padding: '1.5rem 1rem',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '10px',
    border: '1px dashed rgba(255,255,255,0.08)',
  },
  emptyBlock: {
    textAlign: 'center',
    padding: '1.5rem',
    color: '#475569',
    fontSize: '0.875rem',
  },
  enrolledBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'rgba(16,185,129,0.15)',
    color: '#34d399',
    border: '1px solid rgba(16,185,129,0.25)',
    borderRadius: '10px',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginBottom: '12px',
  },
  testsBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(167,139,250,0.1)',
    color: '#c4b5fd',
    border: '1px solid rgba(167,139,250,0.28)',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '12px',
    textDecoration: 'none',
    transition: 'background 0.18s, border-color 0.18s',
    letterSpacing: '0.01em',
  },
};

const CourseViewer = () => {
  const { courseId } = useParams();
  const navigate     = useNavigate();

  const [course,           setCourse]           = useState(null);
  const [materials,        setMaterials]        = useState([]);
  const [materialsLocked,  setMaterialsLocked]  = useState(false);
  const [loading,          setLoading]          = useState(true);
  const [enrollLoading,    setEnrollLoading]    = useState(false);
  const [error,            setError]            = useState('');
  const [enrolled,         setEnrolled]         = useState(false);
  const [activeVideo,      setActiveVideo]      = useState(null);
  const [expandedSections, setExpandedSections] = useState({ 0: true });

  // FIX: parsed once with useMemo + try/catch, not re-parsed on every render
  const { token, user } = useMemo(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('user'));
      return { token: parsed?.token ?? null, user: parsed };
    } catch {
      return { token: null, user: null };
    }
  }, []);

  // FIX: fetchCourseDetails was making a duplicate API call — checkEnrollmentAndMaterials
  // already fetches the course. Merged into one function to avoid double request.
  const checkEnrollmentAndMaterials = useCallback(async () => {
    try {
      const courseRes  = await apiClient.get(`/courses/${courseId}`);
      const courseData = courseRes.data.course;
      if (courseRes.data.success) setCourse(courseData);

      if (token) {
        const isInstructor = user && courseData.instructor &&
          (courseData.instructor._id === user._id || courseData.instructor === user._id);
        const isAdmin = user?.role === 'admin';

        if (isInstructor || isAdmin) {
          setEnrolled(true);
          setMaterialsLocked(false);
        } else {
          const enrolledRes = await apiClient.get(`/courses/student/enrolled`);
          // FIX: removed manual Authorization header — apiClient interceptor handles it
          if (enrolledRes.data.success) {
            setEnrolled(enrolledRes.data.courses.some(c => c._id === courseId));
          }
        }

        const materialsRes = await apiClient.get(`/study-materials/course/${courseId}`);
        if (materialsRes.data.success) {
          setMaterials(materialsRes.data.materials || []);
          setMaterialsLocked(false);
        }
      } else {
        setMaterialsLocked(true);
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response.data.isLocked) {
        setMaterialsLocked(true);
      } else if (!course) {
        // Only set page-level error if course itself failed to load
        setError(err.response?.data?.message || 'Error loading course details');
      }
    } finally {
      setLoading(false);
    }
  }, [courseId, token, user]);

  // FIX: useEffect deps now correctly list the stable useCallback reference
  useEffect(() => {
    checkEnrollmentAndMaterials();
  }, [checkEnrollmentAndMaterials]);

  const handleEnroll = async () => {
    if (!token) { navigate('/login'); return; }
    if (user?.role === 'instructor') {
      // FIX: alert() replaced with state-driven error — alert() blocks the main thread
      setError('Instructors cannot enroll in courses.');
      return;
    }
    try {
      setEnrollLoading(true);
      const response = await apiClient.post(`/courses/${courseId}/enroll`, {});
      // FIX: removed manual Authorization header — apiClient handles it
      if (response.data.success) {
        setEnrolled(true);
        checkEnrollmentAndMaterials();
        // FIX: alert() replaced with state — same reason as above
        // If you want a toast/snackbar, wire it up here instead
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed. Please try again.');
    } finally {
      setEnrollLoading(false);
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k  = 1024;
    const dm = Math.max(0, decimals);
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i  = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const toggleSection = (idx) =>
    setExpandedSections(prev => ({ ...prev, [idx]: !prev[idx] }));

  if (loading) return (
    <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress sx={{ color: '#3b82f6' }} />
    </div>
  );

  if (error || !course) return (
    <div style={styles.page}>
      <div style={{ maxWidth: 600, margin: '5rem auto' }}>
        <Alert severity="error">{error || 'Course not found'}</Alert>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <div style={styles.heroCard}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ marginBottom: '4px' }}>
                <span style={styles.badge('blue')}>{course.category}</span>
                <span style={styles.badge('purple')}>{course.level}</span>
              </div>
              <h1 style={styles.h1}>{course.title}</h1>
              {course.subtitle && <p style={styles.subtitle}>{course.subtitle}</p>}
              <div style={styles.metaRow}>
                <span style={styles.metaItem}>
                  ⭐ <span style={styles.metaStrong}>{course.rating ? course.rating.toFixed(1) : '0.0'}</span>
                </span>
                <span style={styles.metaItem}>
                  Instructor: <span style={styles.metaStrong}>{course.instructor?.name}</span>
                </span>
              </div>
            </div>
            {course.thumbnailUrl ? (
              <img src={course.thumbnailUrl} alt="Course preview" style={styles.thumbnailImg} />
            ) : (
              <div style={styles.thumbnailPlaceholder}>
                <School sx={{ fontSize: 48, color: 'rgba(59,130,246,0.4)' }} />
              </div>
            )}
          </div>
        </div>

        {/* Inline error banner (replaces alert()) */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError('')}
            sx={{ mb: 2, borderRadius: '10px' }}
          >
            {error}
          </Alert>
        )}

        {/* ── Main grid ─────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)',
            gap: '2rem',
            alignItems: 'start',
          }}
          className="course-grid"
        >
          {/* Left column */}
          <div>
            <span style={styles.sectionLabel}>About this course</span>
            <div style={styles.descriptionCard}>{course.description}</div>

            <span style={styles.sectionLabel}>Curriculum</span>
            <h2 style={{ ...styles.sectionTitle, marginBottom: '1rem' }}>Syllabus &amp; Lectures</h2>
            <div>
              {course.curriculum?.map((section, sIdx) => {
                const isOpen = !!expandedSections[sIdx];
                return (
                  <div key={sIdx} style={{
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '12px',
                    marginBottom: '8px',
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.025)',
                  }}>
                    <div style={styles.accordionHeader} onClick={() => toggleSection(sIdx)}>
                      <div style={styles.accordionTitle}>
                        <span style={styles.sectionNum}>{sIdx + 1}</span>
                        {section.sectionTitle}
                      </div>
                      <ExpandMore sx={{
                        color: '#475569', fontSize: '20px',
                        transition: 'transform 0.2s',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }} />
                    </div>
                    {isOpen && (
                      <div>
                        {section.lectures.map((lecture, lIdx) => {
                          const showPreview = lecture.isFreePreview || enrolled;
                          const clickable   = showPreview && lecture.videoUrl;
                          return (
                            <div
                              key={lIdx}
                              style={{
                                ...styles.lectureItem,
                                ...(clickable ? { cursor: 'pointer' } : {}),
                              }}
                              onMouseEnter={e => { if (clickable) e.currentTarget.style.background = 'rgba(59,130,246,0.07)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                              onClick={() => {
                                if (clickable) setActiveVideo({ title: lecture.title, videoUrl: lecture.videoUrl });
                              }}
                            >
                              {showPreview
                                ? <PlayArrow sx={{ color: '#60a5fa', fontSize: '18px', flexShrink: 0 }} />
                                : <Lock      sx={{ color: '#334155', fontSize: '16px', flexShrink: 0 }} />
                              }
                              <div style={{ flex: 1 }}>
                                <div style={styles.lectureTitle}>{lecture.title}</div>
                                {lecture.duration && <div style={styles.lectureDuration}>{lecture.duration}</div>}
                              </div>
                              {lecture.isFreePreview && !enrolled && (
                                <span style={styles.freeTag}>Free preview</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column */}
          <div style={{ position: 'sticky', top: '1.5rem' }}>

            {enrolled ? (
              <div style={styles.enrolledCard}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <div style={styles.enrolledBadge}>
                    <LockOpen sx={{ fontSize: '18px' }} />
                    You're enrolled
                  </div>
                </div>
                <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                  Access all lectures and download study materials below.
                </p>
                <Link
                  to={`/student/courses/${courseId}/tests`}
                  style={styles.testsBtn}
                  onMouseEnter={e => {
                    e.currentTarget.style.background  = 'rgba(167,139,250,0.2)';
                    e.currentTarget.style.borderColor = 'rgba(167,139,250,0.5)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background  = 'rgba(167,139,250,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(167,139,250,0.28)';
                  }}
                >
                  <QuizOutlinedIcon sx={{ fontSize: '18px' }} />
                  View Tests
                </Link>
              </div>
            ) : (
              <div style={styles.enrollCard}>
                <div style={styles.price}>
                  ₹{course.price ? course.price.toLocaleString() : '0'}
                </div>
                <div style={styles.priceNote}>One-time · Lifetime access</div>
                <hr style={styles.divider} />
                <p style={{ fontSize: '0.825rem', color: '#64748b', textAlign: 'center', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                  Full access to all lectures, resources, and future updates.
                </p>
                <button
                  style={{ ...styles.enrollBtn, opacity: enrollLoading ? 0.7 : 1 }}
                  onClick={handleEnroll}
                  disabled={enrollLoading}
                  onMouseEnter={e => { if (!enrollLoading) { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {enrollLoading ? 'Enrolling…' : 'Enroll Now'}
                </button>
              </div>
            )}

            {/* Study Materials */}
            <div style={styles.materialsCard}>
              <div style={styles.materialsHeader}>
                <MenuBook sx={{ color: '#60a5fa', fontSize: '20px' }} />
                <span style={{ fontSize: '1rem', fontWeight: '600', color: '#e2e8f0' }}>Study Materials</span>
              </div>
              <hr style={styles.divider} />

              {materialsLocked ? (
                <div style={styles.lockedBlock}>
                  <Lock sx={{ color: '#334155', fontSize: '30px', marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.825rem', fontWeight: '600', color: '#475569', margin: '0 0 4px' }}>PDFs are locked</p>
                  <p style={{ fontSize: '0.775rem', color: '#334155', margin: '0 0 12px', lineHeight: 1.5 }}>
                    Enroll to unlock study notes and exercises.
                  </p>
                  <button style={styles.unlockBtn} onClick={handleEnroll}>
                    <LockOpen sx={{ fontSize: '14px' }} />
                    Unlock Materials
                  </button>
                </div>
              ) : materials.length > 0 ? (
                <div>
                  {materials.map((mat) => (
                    <div key={mat._id} style={styles.materialItem}>
                      <div style={styles.materialTitle}>{mat.title}</div>
                      {mat.description && <div style={styles.materialDesc}>{mat.description}</div>}
                      <div style={styles.materialMeta}>{formatBytes(mat.fileSize)}</div>
                      <div style={styles.materialActions}>
                        <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" style={styles.viewBtn}>View</a>
                        <a href={mat.downloadUrl || mat.fileUrl} target="_blank" rel="noopener noreferrer" style={styles.downloadBtn}>
                          <Download sx={{ fontSize: '13px' }} />
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptyBlock}>
                  <Info sx={{ fontSize: '28px', marginBottom: '6px', opacity: 0.3 }} />
                  <p style={{ margin: 0 }}>No PDF resources available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .course-grid {
            grid-template-columns: 1fr !important;
          }
          .course-grid > div:last-child {
            position: static !important;
          }
        }
      `}</style>

      {/* Video Dialog */}
      <Dialog
        open={!!activeVideo}
        onClose={() => setActiveVideo(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            background: '#0d1424',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            overflow: 'hidden',
            margin: '16px',
            width: 'calc(100% - 32px)',
            maxWidth: '800px',
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setActiveVideo(null)}
            sx={{
              position: 'absolute', top: 8, right: 8, zIndex: 1,
              bgcolor: 'rgba(0,0,0,0.5)', color: '#94a3b8',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)', color: '#fff' },
            }}
          >
            <CloseIcon />
          </IconButton>
          {activeVideo && (
            <>
              <div style={{
                padding: '16px 48px 12px 16px',
                fontSize: 'clamp(0.8rem, 2vw, 0.925rem)',
                fontWeight: '600', color: '#e2e8f0',
                fontFamily: "'Inter', sans-serif",
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                {activeVideo.title}
              </div>
              <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                <iframe
                  src={getEmbedUrl(activeVideo.videoUrl)}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseViewer;