import express from 'express';
import { 
  uploadStudyMaterial, 
  getStudyMaterialsByCourse, 
  updateStudyMaterial, 
  deleteStudyMaterial 
} from '../controllers/studyMaterialController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import validateRequest from '../middlewares/validateRequest.js';
import { updateStudyMaterialSchema } from '../validation/studyMaterialValidation.js';
import { upload } from '../utils/storage.js';

const router = express.Router();

// All study materials routes require authentication
router.use(protect);

// 🟢 Student & Instructor route: Get list of study materials for a course (enrollment-restricted inside controller for students)
router.get('/course/:courseId', getStudyMaterialsByCourse);

// 🔴 Instructor-only routes
router.post('/upload', restrictTo('instructor'), upload.single('file'), uploadStudyMaterial);
router.put('/:id', restrictTo('instructor'), validateRequest(updateStudyMaterialSchema), updateStudyMaterial);
router.delete('/:id', restrictTo('instructor'), deleteStudyMaterial);

export default router;
