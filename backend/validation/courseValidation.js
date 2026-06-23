import { z } from 'zod';

const lectureValidationSchema = z.object({
  title: z.string().min(3, 'Lecture title must be at least 3 characters long').trim(),
  videoUrl: z.string().url('Invalid video URL structure').optional().or(z.literal('')),
  duration: z.string().default('0:00'),
  isFreePreview: z.boolean().default(false)
});

const sectionValidationSchema = z.object({
  sectionTitle: z.string().min(3, 'Section title must be at least 3 characters long').trim(),
  lectures: z.array(lectureValidationSchema).min(1, 'Each section must have at least one lecture')
});

export const createCourseSchema = z.object({
  title: z.string().min(5, 'Course title must be at least 5 characters long').trim(),
  subtitle: z.string().optional(),
  description: z.string().min(20, 'Description must be at least 20 characters long'),
  thumbnailUrl: z.string().url('Invalid image URL format'),
  rating: z.number().min(0).max(5).default(0),
  category: z.string().min(2, 'Please select a valid category'),
  price: z.number().nonnegative('Price cannot be negative').default(0),
  level: z.enum(['Beginner', 'Intermediate', 'Expert']).default('Beginner'),
  curriculum: z.array(sectionValidationSchema).min(1, 'Course must have at least one section'),
  isPublished: z.boolean().default(false) // ❗ ॲड केलं — आधी हे strip होत होतं, isPublished:true कधीच controller पर्यंत पोहोचत नव्हतं
});