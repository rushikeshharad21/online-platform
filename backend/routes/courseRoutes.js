import express from 'express';
import {
  createCourse,
  getAllCourses,
  getMyCourses,
  getCourseById,
  updateCourse,
  enrollInCourse,
  getEnrolledCourses
} from '../controllers/courseController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import validateRequest from '../middlewares/validateRequest.js';
import { createCourseSchema } from '../validation/courseValidation.js';

const router = express.Router();

router.get('/', getAllCourses);
router.get('/student/enrolled', protect, restrictTo('student'), getEnrolledCourses);
router.get('/my-courses', protect, restrictTo('instructor'), getMyCourses);

router.post(
  '/create',
  protect,
  restrictTo('instructor'),
  validateRequest(createCourseSchema),
  createCourse
);

router.get('/:id', getCourseById);
router.put('/:id', protect, restrictTo('instructor'), updateCourse);
router.post('/:id/enroll', protect, restrictTo('student'), enrollInCourse);

export default router;