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

// १. सार्वजनिक राऊट (कोणताही युझर कोर्सेस पाहू शकतो)
router.get('/', getAllCourses);

// २. स्टुडन्टचे स्वतःचे कोर्सेस (ज्या कोर्सेसमध्ये त्यांनी एनरोल केले आहे)
router.get('/student/enrolled', protect, restrictTo('student'), getEnrolledCourses);

// ३. इन्स्ट्रक्टरचे स्वतःचे कोर्सेस (पब्लिश असोत वा नसोत)
router.get('/my-courses', protect, restrictTo('instructor'), getMyCourses);

// ४. कोर्सेस मॅनेजमेंट (कोर्स तयार करणे, बदलणे आणि डिटेल्स मिळवणे)
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