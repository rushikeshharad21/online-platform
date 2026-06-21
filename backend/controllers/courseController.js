import mongoose from 'mongoose';
import Course from '../models/Course.js';
import InstructorProfile from '../models/InstructorProfile.js';
import StudentProfile from '../models/StudentProfile.js';
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
      { session, returnDocument: 'after' }
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

// =========================================================================
// 🔍 GET SINGLE COURSE BY ID
// =========================================================================
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name email');
    if (!course) {
      return next(new AppError('Course not found.', 404));
    }
    return res.status(200).json({
      success: true,
      course
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// ✏️ UPDATE COURSE DETAILS / CURRICULUM
// =========================================================================
export const updateCourse = async (req, res, next) => {
  try {
    const { title, subtitle, description, category, price, level, curriculum, thumbnailUrl, rating, isPublished } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) {
      return next(new AppError('Course not found.', 404));
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      return next(new AppError('You are not authorized to update this course.', 403));
    }

    course.title = title || course.title;
    course.subtitle = subtitle !== undefined ? subtitle : course.subtitle;
    course.description = description || course.description;
    course.category = category || course.category;
    course.price = price !== undefined ? price : course.price;
    course.level = level || course.level;
    course.curriculum = curriculum || course.curriculum;
    course.thumbnailUrl = thumbnailUrl !== undefined ? thumbnailUrl : course.thumbnailUrl;
    course.rating = rating !== undefined ? rating : course.rating;
    course.isPublished = isPublished !== undefined ? isPublished : course.isPublished;

    const updatedCourse = await course.save();

    return res.status(200).json({
      success: true,
      message: 'Course updated successfully!',
      course: updatedCourse
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 💳 ENROLL STUDENT IN COURSE
// =========================================================================
export const enrollInCourse = async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    const studentId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError('Course not found.', 404));
    }

    let profile = await StudentProfile.findOne({ user: studentId });
    if (!profile) {
      profile = await StudentProfile.create({ user: studentId, enrolledCourses: [] });
    }

    if (profile.enrolledCourses.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course.'
      });
    }

    profile.enrolledCourses.push(courseId);
    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Enrolled in course successfully!',
      enrolledCourses: profile.enrolledCourses
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 🎓 GET STUDENT'S ENROLLED COURSES
// =========================================================================
export const getEnrolledCourses = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const profile = await StudentProfile.findOne({ user: studentId }).populate({
      path: 'enrolledCourses',
      populate: { path: 'instructor', select: 'name email' }
    });

    return res.status(200).json({
      success: true,
      courses: profile ? profile.enrolledCourses : []
    });
  } catch (error) {
    next(error);
  }
};