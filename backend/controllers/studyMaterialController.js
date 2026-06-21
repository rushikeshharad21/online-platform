import StudyMaterial from '../models/StudyMaterial.js';
import Course from '../models/Course.js';
import StudentProfile from '../models/StudentProfile.js';
import AppError from '../utils/appError.js';
import { isValidObjectId } from 'mongoose';
import {
  isCloudinaryReady,
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteLocalFile,
  getCloudinaryDownloadUrl,
} from '../utils/storage.js';

// =========================================================================
// 🚀 UPLOAD NEW PDF STUDY MATERIAL
// =========================================================================
export const uploadStudyMaterial = async (req, res, next) => {
  try {
    const { title, description, courseId } = req.body;
    const instructorId = req.user._id;

    if (!courseId || !isValidObjectId(courseId)) {
      if (req.file) {
        deleteLocalFile(req.file.path);
      }
      return next(new AppError('Invalid course ID.', 400));
    }

    if (!req.file) {
      return next(new AppError('No PDF file uploaded. Please upload a valid PDF file.', 400));
    }

    // 1. Verify that the course exists and belongs to this instructor
    const course = await Course.findById(courseId);
    if (!course) {
      deleteLocalFile(req.file.path); // clean up local temp file
      return next(new AppError('Course not found.', 404));
    }

    if (course.instructor.toString() !== instructorId.toString()) {
      deleteLocalFile(req.file.path); // clean up local temp file
      return next(new AppError('You are not authorized to upload study materials to this course.', 403));
    }

    let fileUrl = '';
    let downloadUrl = '';
    let publicId = '';
    let storageType = 'local';
    let resourceType = 'image';

    // 2. Perform upload depending on Cloudinary config availability
    if (isCloudinaryReady()) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.path);
        fileUrl = uploadResult.url;
        publicId = uploadResult.publicId;
        resourceType = uploadResult.resourceType || 'image';
        storageType = 'cloudinary';
        // Generate a download-friendly URL with fl_attachment flag
        downloadUrl = getCloudinaryDownloadUrl(fileUrl);
      } catch (cloudinaryError) {
        deleteLocalFile(req.file.path); // clean up local temp file
        return next(new AppError(`Cloudinary Upload Failed: ${cloudinaryError.message}`, 500));
      }
    } else {
      // Store locally
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      downloadUrl = fileUrl; // local files can be downloaded directly
      storageType = 'local';
      publicId = req.file.filename; // we'll use filename for local deletion reference
    }

    // 3. Create database entry
    const newMaterial = await StudyMaterial.create({
      title,
      description,
      fileUrl,
      downloadUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      storageType,
      publicId,
      resourceType,
      course: courseId,
      instructor: instructorId,
    });

    return res.status(201).json({
      success: true,
      message: 'PDF Study Material uploaded successfully!',
      material: newMaterial,
    });
  } catch (error) {
    if (req.file) {
      deleteLocalFile(req.file.path);
    }
    next(error);
  }
};

// =========================================================================
// 🔍 GET STUDY MATERIALS BY COURSE ID (Enforcing Access Control)
// =========================================================================
export const getStudyMaterialsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // 1. Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError('Course not found.', 404));
    }

    // 2. Role-Based Access Control
    if (userRole === 'instructor') {
      // Instructors who created the course can view them
      if (course.instructor.toString() !== userId.toString()) {
        return next(new AppError('You are not authorized to view the materials for this course.', 403));
      }
    } else if (userRole === 'student') {
      // Students must be enrolled to view/download study materials
      const isEnrolled = await StudentProfile.findOne({
        user: userId,
        enrolledCourses: courseId,
      });

      if (!isEnrolled) {
        return res.status(403).json({
          success: false,
          isLocked: true,
          message: 'Study materials are locked. Please enroll in this course to access them.',
        });
      }
    } else if (userRole !== 'admin') {
      return next(new AppError('Unauthorized role.', 403));
    }

    // 3. Fetch materials
    const materials = await StudyMaterial.find({ course: courseId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: materials.length,
      materials,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// ✏️ UPDATE STUDY MATERIAL METADATA
// =========================================================================
export const updateStudyMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const instructorId = req.user._id;

    // 1. Find study material
    const material = await StudyMaterial.findById(id);
    if (!material) {
      return next(new AppError('Study material not found.', 404));
    }

    // 2. Validate ownership
    if (material.instructor.toString() !== instructorId.toString()) {
      return next(new AppError('You are not authorized to update this study material.', 403));
    }

    // 3. Update fields
    material.title = title || material.title;
    material.description = description !== undefined ? description : material.description;

    const updatedMaterial = await material.save();

    return res.status(200).json({
      success: true,
      message: 'Study material metadata updated successfully.',
      material: updatedMaterial,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 🗑️ DELETE STUDY MATERIAL
// =========================================================================
export const deleteStudyMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const instructorId = req.user._id;

    // 1. Find material
    const material = await StudyMaterial.findById(id);
    if (!material) {
      return next(new AppError('Study material not found.', 404));
    }

    // 2. Validate ownership
    if (material.instructor.toString() !== instructorId.toString()) {
      return next(new AppError('You are not authorized to delete this study material.', 403));
    }

    // 3. Delete file from storage
    if (material.storageType === 'cloudinary') {
      if (material.publicId) {
        // Use the stored resourceType instead of inferring from URL
        const resType = material.resourceType || 'image';
        await deleteFromCloudinary(material.publicId, resType);
      }
    } else {
      // Local storage deletion
      if (material.publicId) {
        deleteLocalFile(material.publicId);
      }
    }

    // 4. Delete document from database
    await StudyMaterial.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'PDF Study Material deleted successfully from storage and database.',
    });
  } catch (error) {
    next(error);
  }
};

