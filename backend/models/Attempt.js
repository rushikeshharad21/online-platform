// models/Attempt.js
import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  answer:     { type: mongoose.Schema.Types.Mixed },  // 'A'|'B'|'C'|'D' or number
  isCorrect:  { type: Boolean, required: true },
}, { _id: false });

const AttemptSchema = new mongoose.Schema({
  test:        { type: mongoose.Schema.Types.ObjectId, ref: 'Test',   required: true },
  student:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  course:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  answers:     [AnswerSchema],
  score:       { type: Number, required: true },   // raw correct count
  total:       { type: Number, required: true },
  percentage:  { type: Number, required: true },
  timeTakenSeconds: { type: Number },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// One attempt per student per test
AttemptSchema.index({ test: 1, student: 1 }, { unique: true });

export default mongoose.model('Attempt', AttemptSchema);