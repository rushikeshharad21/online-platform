import { z } from 'zod';

export const updateStudyMaterialSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional().or(z.literal('')),
});
