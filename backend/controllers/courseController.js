import mongoose from 'mongoose';
import Course from '../models/Course.js';
import InstructorProfile from '../models/InstructorProfile.js';
import AppError from '../utils/appError.js';

// =========================================================================
// 🚀 CREATE NEW COURSE (With ACID Transactions & Full Field Support)
// =========================================================================
export const createCourse = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Destructure all required fields including new fields
    const { 
      title, 
      subtitle, 
      description, 
      category, 
      price, 
      level, 
      curriculum, 
      thumbnailUrl, 
      rating 
    } = req.body;
    
    const instructorId = req.user._id;

    // 2. Create the course document
    const [newCourse] = await Course.create(
      [
        {
          title,
          subtitle,
          description,
          category,
          price,
          level,
          curriculum,
          thumbnailUrl, // Now correctly included
          rating,       // Now correctly included
          instructor: instructorId,
        }
      ],
      { session }
    );

    if (!newCourse) {
      throw new AppError('Failed to create the course.', 400);
    }

    // 3. Update Instructor Profile with the new Course ID
    const updatedProfile = await InstructorProfile.findOneAndUpdate(
      { user: instructorId },
      { $push: { enrolledCourses: newCourse._id } },
      { session, new: true }
    );

    if (!updatedProfile) {
      throw new AppError('Instructor profile not found.', 404);
    }

    // 4. Finalize Transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: 'Course created successfully!',
      course: newCourse
    });

  } catch (error) {
    // Rollback changes if anything fails
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// =========================================================================
// 🔍 GET ALL PUBLISHED COURSES
// =========================================================================
export const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 🧑‍🏫 GET INSTRUCTOR'S COURSES
// =========================================================================
export const getMyCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    next(error);
  }
};