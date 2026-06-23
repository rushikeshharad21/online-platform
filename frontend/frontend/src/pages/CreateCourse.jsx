import React, { useState } from 'react';
import { useForm, useFieldArray, FormProvider, useFormContext } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Paper, Stepper, Step, StepLabel, Button,
  TextField, Typography, Grid, MenuItem, Checkbox, FormControlLabel,
  Card, Stack, InputAdornment, CircularProgress, IconButton
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import { createNewCourse } from '../features/courses/courseSlice';

// ❗ वेगळा component — प्रत्येक section साठी स्वतःचा useFieldArray (nested array fix)
const LectureFieldArray = ({ sectionIndex }) => {
  const { control, register, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `curriculum.${sectionIndex}.lectures`
  });

  return (
    <Box>
      {fields.map((lecture, lIndex) => (
        <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'flex-start' }} key={lecture.id}>
          <TextField
            size="small" label="Title"
            {...register(`curriculum.${sectionIndex}.lectures.${lIndex}.title`, {
              required: 'Required', minLength: { value: 3, message: 'Min 3 chars' }
            })}
            error={!!errors?.curriculum?.[sectionIndex]?.lectures?.[lIndex]?.title}
            helperText={errors?.curriculum?.[sectionIndex]?.lectures?.[lIndex]?.title?.message}
          />
          <TextField
            size="small" label="URL"
            {...register(`curriculum.${sectionIndex}.lectures.${lIndex}.videoUrl`)}
          />
          <TextField
            size="small" label="Duration"
            {...register(`curriculum.${sectionIndex}.lectures.${lIndex}.duration`)}
          />
          <FormControlLabel
            control={<Checkbox {...register(`curriculum.${sectionIndex}.lectures.${lIndex}.isFreePreview`)} />}
            label="Free"
          />
          <IconButton
            size="small"
            disabled={fields.length === 1}
            onClick={() => remove(lIndex)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ))}

      <Button
        size="small"
        sx={{ mt: 2 }}
        onClick={() => append({ title: '', videoUrl: '', duration: '0:00', isFreePreview: false })}
      >
        + Add Lecture
      </Button>
    </Box>
  );
};

const CreateCourse = () => {
  const [activeStep, setActiveStep] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState('');

  const methods = useForm({
    defaultValues: {
      title: '', subtitle: '', description: '', category: '', level: 'Beginner',
      price: 0, thumbnailUrl: '', rating: 0,
      curriculum: [{ sectionTitle: '', lectures: [{ title: '', videoUrl: '', duration: '0:00', isFreePreview: false }] }]
    }
  });

  const { register, control, handleSubmit, watch, formState: { isSubmitting, errors } } = methods;
  const thumbnailUrl = watch('thumbnailUrl');
  const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({ control, name: 'curriculum' });

  const onSubmit = async (data) => {
    setSubmitError('');
    try {
      const payload = {
        ...data,
        price: Number(data.price),
        rating: Number(data.rating),
        isPublished: true
      };

      // ❗ raw axios ऐवजी thunk वापरला — dead code आता प्रत्यक्ष वापरात आहे
      const result = await dispatch(createNewCourse(payload)).unwrap();
      alert('Course successfully published! 🚀');
      navigate('/instructor/dashboard');
    } catch (err) {
      // err हा rejectWithValue मधून आलेला string आहे (validateRequest चा field-specific message)
      setSubmitError(typeof err === 'string' ? err : 'Error publishing course');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
              Course Builder
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {['Overview', 'Curriculum', 'Pricing & Details'].map(label => (
                <Step key={label}><StepLabel>{label}</StepLabel></Step>
              ))}
            </Stepper>

            {submitError && (
              <Typography color="error" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {submitError}
              </Typography>
            )}

            {/* STEP 1: OVERVIEW */}
            {activeStep === 0 && (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth label="Course Title"
                    {...register('title', { required: 'Title is required', minLength: { value: 5, message: 'Min 5 characters' } })}
                    error={!!errors.title} helperText={errors.title?.message}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Subtitle" {...register('subtitle')} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth label="Thumbnail URL"
                    {...register('thumbnailUrl', { required: 'Thumbnail URL is required' })}
                    error={!!errors.thumbnailUrl} helperText={errors.thumbnailUrl?.message}
                    placeholder="https://..."
                  />
                  {thumbnailUrl && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Typography variant="caption">Thumbnail Preview:</Typography>
                      <img src={thumbnailUrl} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                    </Box>
                  )}
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    select fullWidth label="Category" defaultValue=""
                    {...register('category', { required: 'Category is required' })}
                    error={!!errors.category} helperText={errors.category?.message}
                  >
                    <MenuItem value="Development">Development</MenuItem>
                    <MenuItem value="Business">Business</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField select fullWidth label="Level" defaultValue="Beginner" {...register('level')}>
                    <MenuItem value="Beginner">Beginner</MenuItem>
                    <MenuItem value="Intermediate">Intermediate</MenuItem>
                    <MenuItem value="Expert">Expert</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth multiline rows={3} label="Description"
                    {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'Min 20 characters' } })}
                    error={!!errors.description} helperText={errors.description?.message}
                  />
                </Grid>
              </Grid>
            )}

            {/* STEP 2: CURRICULUM */}
            {activeStep === 1 && (
              <Box>
                {sectionFields.map((section, sIndex) => (
                  <Card key={section.id} sx={{ mb: 3, p: 3, bgcolor: '#fbfbfb', border: '1px solid #e0e0e0' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField
                        label="Section Title"
                        {...register(`curriculum.${sIndex}.sectionTitle`, { required: 'Required', minLength: { value: 3, message: 'Min 3 chars' } })}
                        error={!!errors?.curriculum?.[sIndex]?.sectionTitle}
                        helperText={errors?.curriculum?.[sIndex]?.sectionTitle?.message}
                        fullWidth sx={{ mb: 2 }}
                      />
                      <IconButton
                        disabled={sectionFields.length === 1}
                        onClick={() => removeSection(sIndex)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>

                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Lectures:</Typography>
                    <LectureFieldArray sectionIndex={sIndex} />
                  </Card>
                ))}
                <Button
                  variant="outlined"
                  startIcon={<AddCircleIcon />}
                  onClick={() => appendSection({ sectionTitle: '', lectures: [{ title: '', videoUrl: '', duration: '0:00', isFreePreview: false }] })}
                >
                  Add Section
                </Button>
              </Box>
            )}

            {/* STEP 3: PRICING & RATING */}
            {activeStep === 2 && (
              <Stack spacing={3}>
                <TextField
                  fullWidth label="Course Price" type="number"
                  {...register('price', { required: true, min: { value: 0, message: 'Price cannot be negative' } })}
                  error={!!errors.price} helperText={errors.price?.message}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                />
                <TextField
                  fullWidth label="Initial Rating (0-5)" type="number"
                  {...register('rating', { min: { value: 0, message: 'Min 0' }, max: { value: 5, message: 'Max 5' } })}
                  error={!!errors.rating} helperText={errors.rating?.message}
                  inputProps={{ step: 0.1, min: 0, max: 5 }}
                />
              </Stack>
            )}

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button disabled={activeStep === 0} onClick={() => setActiveStep(prev => prev - 1)}>Back</Button>
              {activeStep === 2 ? (
                <Button variant="contained" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <CircularProgress size={24} /> : 'Publish Course'}
                </Button>
              ) : (
                <Button variant="contained" onClick={() => setActiveStep(prev => prev + 1)}>Next</Button>
              )}
            </Box>
          </Paper>
        </form>
      </FormProvider>
    </Container>
  );
};

export default CreateCourse;