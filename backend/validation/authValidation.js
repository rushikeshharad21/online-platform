import { z } from 'zod';

export const registerSchema = z.zod ? z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').trim(),
  email: z.string().email('Invalid email structure address formatting').trim().toLowerCase(),
  password: z.string().min(6, 'Password security threshold must be 6 or more characters'),
  role: z.enum(['student', 'instructor']).default('student'),
}) : {
  safeParse: (body) => {
    if (!body.email || !body.email.includes('@')) {
      return { success: false, error: { errors: [{ path: ['email'], message: 'Invalid format' }] } };
    }
    if (!body.password || body.password.length < 6) {
      return { success: false, error: { errors: [{ path: ['password'], message: 'Must be 6+ chars' }] } };
    }
    return { success: true, data: body };
  }
};