import React, { useState } from 'react';
import { useForm, useFieldArray, FormProvider, useFormContext } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Paper, Stepper, Step, StepLabel, Button,
  TextField, Typography, Grid, MenuItem, Checkbox, FormControlLabel,
  Card, Stack, InputAdornment, CircularProgress, IconButton, Divider, Alert
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { createNewCourse } from '../features/courses/courseSlice';

// ─── Lecture Field Array (nested) ────────────────────────────────────────────
const LectureFieldArray = ({ sectionIndex }) => {
  const { control, register, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `curriculum.${sectionIndex}.lectures`,
  });

  return (
    <Box>
      {fields.map((lecture, lIndex) => (
        <Box
          key={lecture.id}
          sx={{
            mt: 1.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: '#71ddb06e',
            border: '1px solid #D0D9F0',
          }}
        >
          <Grid container spacing={1.5} alignItems="center">
            <Grid size={{ xs:12, sm:4}}>
              <TextField
                fullWidth
                size="small"
                label="Lecture Title"
                {...register(`curriculum.${sectionIndex}.lectures.${lIndex}.title`, {
                  required: 'Required',
                  minLength: { value: 3, message: 'Min 3 chars' },
                })}
                error={!!errors?.curriculum?.[sectionIndex]?.lectures?.[lIndex]?.title}
                helperText={errors?.curriculum?.[sectionIndex]?.lectures?.[lIndex]?.title?.message}
                sx={inputSx}
              />
            </Grid>
            <Grid size={{xs:12, sm:4}}>
              <TextField
                fullWidth
                size="small"
                label="Video URL"
                {...register(`curriculum.${sectionIndex}.lectures.${lIndex}.videoUrl`)}
                sx={inputSx}
              />
            </Grid>
            <Grid size={{ xs:6, sm:2}}>
              <TextField
                fullWidth
                size="small"
                label="Duration"
                {...register(`curriculum.${sectionIndex}.lectures.${lIndex}.duration`)}
                sx={inputSx}
              />
            </Grid>
            <Grid size={{ xs:4, sm:1.5}}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    sx={{ color: '#3B5BDB', '&.Mui-checked': { color: '#3B5BDB' } }}
                    {...register(`curriculum.${sectionIndex}.lectures.${lIndex}.isFreePreview`)}
                  />
                }
                label={<Typography variant="caption" sx={{ color: '#444' }}>Free</Typography>}
              />
            </Grid>
            <Grid size={{ xs:2,sm:0.5}} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton
                size="small"
                disabled={fields.length === 1}
                onClick={() => remove(lIndex)}
                sx={{ color: '#E03131', '&:disabled': { color: '#ccc' } }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Grid>
          </Grid>
        </Box>
      ))}

      <Button
        size="small"
        sx={{
          mt: 2,
          color: '#3B5BDB',
          borderColor: '#3B5BDB',
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'none',
          '&:hover': { bgcolor: '#EEF2FF', borderColor: '#3B5BDB' },
        }}
        variant="outlined"
        onClick={() =>
          append({ title: '', videoUrl: '', duration: '0:00', isFreePreview: false })
        }
      >
        + Add Lecture
      </Button>
    </Box>
  );
};

// ─── Shared input style (white bg fields readable on blue bg context) ─────────
const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#dae2e2',
    borderRadius: 1.5,
    '& fieldset': { borderColor: '#C5D0E6' },
    '&:hover fieldset': { borderColor: '#3B5BDB' },
    '&.Mui-focused fieldset': { borderColor: '#3B5BDB', borderWidth: 2 },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#3B5BDB' },
};

const selectSx = {
  ...inputSx,
  '& .MuiSelect-select': { bgcolor: '#FFFFFF' },
};

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEPS = ['Overview', 'Curriculum', 'Pricing & details '];

// ─── Main Component ───────────────────────────────────────────────────────────
const CreateCourse = () => {
  const [activeStep, setActiveStep] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState('');

  const methods = useForm({
    defaultValues: {
      title: '', subtitle: '', description: '', category: '', level: 'Beginner',
      price: 0, thumbnailUrl: '', rating: 0,
      curriculum: [{
        sectionTitle: '',
        lectures: [{ title: '', videoUrl: '', duration: '0:00', isFreePreview: false }],
      }],
    },
  });

  const {
    register, control, handleSubmit, watch,
    formState: { isSubmitting, errors },
  } = methods;

  const thumbnailUrl = watch('thumbnailUrl');
  const { fields: sectionFields, append: appendSection, remove: removeSection } =
    useFieldArray({ control, name: 'curriculum' });

  const onSubmit = async (data) => {
    setSubmitError('');
    try {
      const payload = { ...data, price: Number(data.price), rating: Number(data.rating), isPublished: true };
      await dispatch(createNewCourse(payload)).unwrap();
      alert('Course successfully published! 🚀');
      navigate('/instructor/dashboard');
    } catch (err) {
      setSubmitError(typeof err === 'string' ? err : 'Error publishing course');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>

            {/* ── Glassmorphism card shell ── */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 5 },
                borderRadius: 4,
                background: 'rgba(31, 194, 223, 0.32)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.6)',
                boxShadow: '0 24px 64px rgba(9, 85, 95, 0.25)',
              }}
            >
              {/* Header */}
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 890,
                    letterSpacing: '-0.5px',
                    color: '#d0e0da',
                     fontSize: { xs: '1.6rem', sm: '2.125rem' },
                     wordBreak: 'break-word',
                     overflowWrap: 'anywhere',
                    lineHeight: 1.2,
                  }}
                >
                  Course Builder
                </Typography>
                <Typography variant="body2" sx={{ color: '#607D8B', mt: 0.5 }}>
                  Fill in each step to publish your course
                </Typography>
              </Box>

            <Stepper
  activeStep={activeStep}
  alternativeLabel
  sx={{
    mb: 5,
    '& .MuiStepLabel-label': {
      fontWeight: 600,
      fontSize: { xs: '0.7rem', sm: '0.85rem' },
      whiteSpace: 'normal',
      textAlign: 'center',
      lineHeight: 1.2,
      wordBreak: 'break-word',
      maxWidth: { xs: 70, sm: 120 },
    },
    '& .MuiStepLabel-label.Mui-active': { color: '#0b2e35' },
    '& .MuiStepLabel-label.Mui-completed': { color: '#16661a' },
    '& .MuiStepIcon-root.Mui-active': { color: '#085349' },
    '& .MuiStepIcon-root.Mui-completed': { color: '#0d6657' },
    '& .MuiStepConnector-line': { borderColor: '#C5D0E6' },
  }}
>
  {STEPS.map((label) => (
    <Step key={label}>
      <StepLabel>{label}</StepLabel>
    </Step>
  ))}
</Stepper>
              {/* Error */}
              {submitError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {submitError}
                </Alert>
              )}

              {/* ── STEP 1: OVERVIEW ── */}
              {activeStep === 0 && (
                <Grid container spacing={2.5}>
                  <Grid size={{xs:12}}>
                    <TextField
                      fullWidth label="Course Title"
                      {...register('title', { required: 'Title is required', minLength: { value: 5, message: 'Min 5 characters' } })}
                      error={!!errors.title} helperText={errors.title?.message}
                      sx={inputSx}
                    />
                  </Grid>

                  <Grid size={{xs:12}}>
                    <TextField
                      fullWidth label="Subtitle"
                      {...register('subtitle')}
                      sx={inputSx}
                    />
                  </Grid>

                  <Grid size={{xs:12}}>
                    <TextField
                      fullWidth label="Thumbnail URL"
                      placeholder="https://..."
                      {...register('thumbnailUrl', { required: 'Thumbnail URL is required' })}
                      error={!!errors.thumbnailUrl} helperText={errors.thumbnailUrl?.message}
                      sx={inputSx}
                    />
                    {thumbnailUrl && (
                      <Box sx={{ mt: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid #C5D0E6' }}>
                        <Typography variant="caption" sx={{ display: 'block', px: 1.5, py: 0.5, bgcolor: '#F0F4FF', color: '#555' }}>
                          Thumbnail Preview
                        </Typography>
                        <img
                          src={thumbnailUrl}
                          alt="Preview"
                          style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block' }}
                        />
                      </Box>
                    )}
                  </Grid>

                  <Grid size={{xs:12, sm:6}}>
                    <TextField
                      select fullWidth label="Category" defaultValue=""
                      {...register('category', { required: 'Category is required' })}
                      error={!!errors.category} helperText={errors.category?.message}
                      sx={selectSx}
                    >
                      <MenuItem value="Development">Development</MenuItem>
                      <MenuItem value="Business">Business</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid size={{ xs:12, sm:6}}>
                    <TextField
                      select fullWidth label="Level" defaultValue="Beginner"
                      {...register('level')}
                      sx={selectSx}
                    >
                      <MenuItem value="Beginner">Beginner</MenuItem>
                      <MenuItem value="Intermediate">Intermediate</MenuItem>
                      <MenuItem value="Expert">Expert</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid size={{xs:12}}>
                    <TextField
                      fullWidth multiline rows={4} label="Description"
                      {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'Min 20 characters' } })}
                      error={!!errors.description} helperText={errors.description?.message}
                      sx={inputSx}
                    />
                  </Grid>
                </Grid>
              )}

              {/* ── STEP 2: CURRICULUM ── */}
              {activeStep === 1 && (
                <Box>
                  {sectionFields.map((section, sIndex) => (
                    <Card
                      key={section.id}
                      elevation={0}
                      sx={{
                        mb: 3,
                        p: 2,
                        borderRadius: 3,
                        bgcolor: '#F8FAFF',
                        border: '1.5px solid #D0D9F0',
                      }}
                    >
                      {/* Section header row */}
                      <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 2 }}>
                        <TextField
                          label="Section Title"
                          fullWidth
                          {...register(`curriculum.${sIndex}.sectionTitle`, {
                            required: 'Required',
                            minLength: { value: 3, message: 'Min 3 chars' },
                          })}
                          error={!!errors?.curriculum?.[sIndex]?.sectionTitle}
                          helperText={errors?.curriculum?.[sIndex]?.sectionTitle?.message}
                          sx={inputSx}
                        />
                        <IconButton
                          disabled={sectionFields.length === 1}
                          onClick={() => removeSection(sIndex)}
                          sx={{
                            mt: 0.5,
                            color: '#E03131',
                            '&:disabled': { color: '#ccc' },
                            '&:hover': { bgcolor: '#FFF0F0' },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>

                      <Divider sx={{ mb: 2, borderColor: '#D0D9F0' }} />

                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: '#0a4a5a', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                      >
                        Lectures
                      </Typography>

                      <LectureFieldArray sectionIndex={sIndex} />
                    </Card>
                  ))}

                  <Button
                    variant="outlined"
                    startIcon={<AddCircleIcon />}
                    onClick={() =>
                      appendSection({
                        sectionTitle: '',
                        lectures: [{ title: '', videoUrl: '', duration: '0:00', isFreePreview: false }],
                      })
                    }
                    sx={{
                      borderRadius: 2,
                      borderColor: '#03010f48',
                      color: '#1d0c5a',
                      fontWeight: 700,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#19a3da52', borderColor: '#0cac9e' },
                    }}
                  >
                    Add Section
                  </Button>
                </Box>
              )}

              {/* ── STEP 3: PRICING ── */}
              {activeStep === 2 && (
                <Stack spacing={3}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: '#F8FAFF',
                      border: '1.5px solid #D0D9F0',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#063442' }}>
                      Pricing
                    </Typography>
                    <TextField
                      fullWidth label="Course Price" type="number"
                      {...register('price', { required: true, min: { value: 0, message: 'Price cannot be negative' } })}
                      error={!!errors.price} helperText={errors.price?.message}
                      slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                      sx={inputSx}
                    />
                  </Box>

                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: '#F8FAFF',
                      border: '1.5px solid #D0D9F0',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#0a4b53' }}>
                      Initial Rating
                    </Typography>
                    <TextField
                      fullWidth label="Rating (0–5)" type="number"
                      {...register('rating', {
                        min: { value: 0, message: 'Min 0' },
                        max: { value: 5, message: 'Max 5' },
                      })}
                      error={!!errors.rating} helperText={errors.rating?.message}
                      inputProps={{ step: 0.1, min: 0, max: 5 }}
                      sx={inputSx}
                    />
                  </Box>
                </Stack>
              )}

              {/* ── Navigation ── */}
              <Box
                sx={{
                  mt: 5,
                  pt: 3,
                  borderTop: '1px solid #E8EDF5',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Button
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep(prev => prev - 1)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    color: '#0a804f',
                    '&:disabled': { color: '#C5D0E6' },
                  }}
                >
                  ← Back
                </Button>

                {activeStep === STEPS.length - 1 ? (
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={isSubmitting}
                    sx={{
                      px: 4,
                      py: 1.2,
                      borderRadius: 2.5,
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      bgcolor: '#1565C0',
                      boxShadow: '0 4px 16px rgba(21,101,192,0.4)',
                      '&:hover': { bgcolor: '#0d5751', boxShadow: '0 6px 20px rgba(21, 152, 192, 0.62)' },
                    }}
                  >
                    {isSubmitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Publish Course →'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(prev => prev + 1)}
                    sx={{
                      px: 4,
                      py: 1.2,
                      borderRadius: 2.5,
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      bgcolor: '#1565C0',
                      boxShadow: '0 4px 16px rgba(9, 80, 85, 0.4)',
                      '&:hover': { bgcolor: '#0e5364' },
                    }}
                  >
                    Next →
                  </Button>
                )}
              </Box>
            </Paper>
          </form>
        </FormProvider>
      </Container>
  );
};

export default CreateCourse;