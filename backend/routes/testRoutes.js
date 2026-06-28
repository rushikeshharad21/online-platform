import express from 'express';
import {
  createTest,
  getTestsByCourse,
  togglePublish,
  getTestResults,
  getStudentTests,
  getTestForAttempt,
  submitAttempt,
  getMyResult,
} from '../controllers/testController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Instructor only
router.post('/',                         protect, restrictTo('instructor'), createTest);
router.get('/course/:courseId',          protect, restrictTo('instructor'), getTestsByCourse);
router.patch('/:testId/publish',         protect, restrictTo('instructor'), togglePublish);
router.get('/:testId/results',           protect, restrictTo('instructor'), getTestResults);

// Student
router.get('/student/course/:courseId',  protect, getStudentTests);
router.get('/:testId/attempt',           protect, getTestForAttempt);
router.post('/:testId/submit',           protect, submitAttempt);
router.get('/:testId/my-result',         protect, getMyResult);

export default router;