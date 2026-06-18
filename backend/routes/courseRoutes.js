import express from 'express';
import { createCourse, getAllCourses, getMyCourses } from '../controllers/courseController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import validateRequest from '../middlewares/validateRequest.js';
import { createCourseSchema } from '../validation/courseValidation.js';

const router = express.Router();

// १. सार्वजनिक राऊट (कोणताही युझर कोर्सेस पाहू शकतो)
router.get('/', getAllCourses);

// २. इन्स्ट्रक्टरचे स्वतःचे कोर्सेस (पब्लिश असोत वा नसोत)
router.get('/my-courses', protect, restrictTo('instructor'), getMyCourses);

// ३. सुरक्षित राऊट (फक्त लॉग-इन असलेला 'instructor' च कोर्स तयार करू शकतो)
router.post(
  '/create',
  protect,
  restrictTo('instructor'),
  validateRequest(createCourseSchema),
  createCourse
);

export default router;