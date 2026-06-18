import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
  },
  { timestamps: true }
);

// पासवर्ड सेव्ह करण्यापूर्वी हॅश (Hash) करणे
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// लॉगिन वेळी पासवर्ड मॅच करणे
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🟢 CRITICAL FIX: ओव्हरराईट एरर टाळण्यासाठी कॅश तपासणे
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;