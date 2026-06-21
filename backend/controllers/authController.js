import mongoose from 'mongoose';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import InstructorProfile from '../models/InstructorProfile.js';
import generateTokenAndSetCookie from '../utils/generateToken.js';
import AppError from '../utils/appError.js';

export const registerUser = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Establish production database cluster synchronization context session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userExists = await User.findOne({ email }).session(session);
    if (userExists) {
      throw new AppError('An identity profile already exists matching that email.', 400);
    }

    // Pass session reference down to array configuration array writes
    const [newUser] = await User.create([{ name, email, password, role: role || 'student' }], { session });

    if (!newUser) {
      throw new AppError('Invalid authentication parameters mapping execution.', 400);
    }

    if (newUser.role === 'instructor') {
      await InstructorProfile.create([{ user: newUser._id }], { session });
    } else {
      await StudentProfile.create([{ user: newUser._id }], { session });
    }

    // Commit changes safely to storage
    await session.commitTransaction();
    session.endSession();

    const token = generateTokenAndSetCookie(res, newUser._id);

    return res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token: token,
    });

  } catch (error) {
    // Drop all partial collections updates if an internal write collapses mid-flight
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      // १. टोकन जनरेट करा (हे फंक्शन टोकन रिटर्न करेल याची खात्री करा)
      const token = generateTokenAndSetCookie(res, user._id); 

      // २. रिस्पॉन्समध्ये टोकन 'key' समाविष्ट करा
      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token, // <--- हे सर्वात महत्त्वाचे आहे
      });
    } else {
      throw new AppError('Invalid credentials validation keys provided.', 401);
    }
  } catch (error) {
    next(error);
  }
};