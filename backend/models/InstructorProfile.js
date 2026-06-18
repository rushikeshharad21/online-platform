import mongoose from 'mongoose';

const instructorProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bio: { type: String, default: 'Welcome to my instructor page.' },
    totalEarnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('InstructorProfile', instructorProfileSchema);