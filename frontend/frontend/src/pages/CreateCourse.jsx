import React, { useState } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import axios from 'axios';
import { 
  Box, Container, Paper, Stepper, Step, StepLabel, Button, 
  TextField, Typography, Grid, MenuItem, Checkbox, FormControlLabel,
  Card, Stack, InputAdornment, CircularProgress, Avatar 
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const CreateCourse = () => {
  const [activeStep, setActiveStep] = useState(0);
  
  const methods = useForm({
    defaultValues: {
      title: '', subtitle: '', description: '', category: '', level: 'Beginner', 
      price: 0, thumbnailUrl: '', rating: 0, // Added thumbnail and rating
      curriculum: [{ sectionTitle: '', lectures: [{ title: '', videoUrl: '', duration: '', isFreePreview: false }] }]
    }
  });

  const { register, control, handleSubmit, watch, formState: { isSubmitting } } = methods;
  const thumbnailUrl = watch('thumbnailUrl'); // Watch for preview
  const { fields: sectionFields, append: appendSection } = useFieldArray({ control, name: 'curriculum' });

  const onSubmit = async (data) => {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const token = user?.token; 

    if (!token) {
      alert("Authentication error: Please log in as an Instructor.");
      return;
    }

    try {
      // Clean data for backend
      const payload = { 
        ...data, 
        price: Number(data.price),
        rating: Number(data.rating) 
      };
      
      await axios.post('http://localhost:5000/api/courses/create', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Course successfully published! 🚀');
    } catch (err) {
      alert(err.response?.data?.message || 'Error publishing course');
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

            {/* STEP 1: OVERVIEW */}
            {activeStep === 0 && (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}><TextField fullWidth label="Course Title" {...register('title')} required /></Grid>
                <Grid size={{ xs: 12 }}><TextField fullWidth label="Subtitle" {...register('subtitle')} /></Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Thumbnail URL" {...register('thumbnailUrl')} placeholder="https://..." />
                  {thumbnailUrl && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Typography variant="caption">Thumbnail Preview:</Typography>
                      <img src={thumbnailUrl} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                    </Box>
                  )}
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField select fullWidth label="Category" {...register('category')} defaultValue="">
                    <MenuItem value="Development">Development</MenuItem>
                    <MenuItem value="Business">Business</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField select fullWidth label="Level" {...register('level')} defaultValue="Beginner">
                    <MenuItem value="Beginner">Beginner</MenuItem>
                    <MenuItem value="Intermediate">Intermediate</MenuItem>
                    <MenuItem value="Expert">Expert</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}><TextField fullWidth multiline rows={3} label="Description" {...register('description')} /></Grid>
              </Grid>
            )}
{/* STEP 2: CURRICULUM */}
{activeStep === 1 && (
  <Box>
    {sectionFields.map((section, sIndex) => (
      <Card key={section.id} sx={{ mb: 3, p: 3, bgcolor: '#fbfbfb', border: '1px solid #e0e0e0' }}>
        <TextField 
          label="Section Title" 
          {...register(`curriculum.${sIndex}.sectionTitle`)} 
          fullWidth 
          sx={{ mb: 2 }} 
        />
        
        {/* इथून लेक्चर्स रेंडर होणार आहेत */}
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Lectures:</Typography>
        
        {/* Nested mapping: प्रत्येक सेक्शनमधील लेक्चर्स */}
        {section.lectures.map((_, lIndex) => (
          <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center' }} key={lIndex}>
            <TextField size="small" label="Title" {...register(`curriculum.${sIndex}.lectures.${lIndex}.title`)} />
            <TextField size="small" label="URL" {...register(`curriculum.${sIndex}.lectures.${lIndex}.videoUrl`)} />
            <TextField size="small" label="Min" {...register(`curriculum.${sIndex}.lectures.${lIndex}.duration`)} />
            <FormControlLabel 
              control={<Checkbox {...register(`curriculum.${sIndex}.lectures.${lIndex}.isFreePreview`)} />} 
              label="Free" 
            />
          </Stack>
        ))}

        {/* नवीन लेक्चर जोडण्यासाठी बटन */}
        <Button 
          size="small" 
          sx={{ mt: 2 }}
          onClick={() => {
            const currentLectures = [...section.lectures];
            // लेक्चर्सच्या ॲरेमध्ये नवीन ऑब्जेक्ट पुश करण्यासाठी मेथड वापरा
            // येथे simple approach: तुम्हाला useFieldArray चे append लेक्चर्ससाठी वेगळे वापरावे लागेल
          }}
        >
          + Add Lecture
        </Button>
      </Card>
    ))}
    <Button 
      variant="outlined"
      startIcon={<AddCircleIcon />} 
      onClick={() => appendSection({ sectionTitle: '', lectures: [{ title: '', videoUrl: '', duration: '', isFreePreview: false }] })}
    >
      Add Section
    </Button>
  </Box>
)}

            {/* STEP 3: PRICING & RATING */}
            {activeStep === 2 && (
              <Stack spacing={3}>
                <TextField 
                  fullWidth label="Course Price" type="number" {...register('price')}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
                />
                <TextField 
                  fullWidth label="Initial Rating (0-5)" type="number" {...register('rating')}
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