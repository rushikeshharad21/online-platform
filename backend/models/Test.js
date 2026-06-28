// models/Test.js
import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  type:        { type: String, enum: ['MCQ', 'INTEGER'], required: true },
  difficulty:  { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  text:        { type: String, required: true, trim: true },
  options:     [String],                          // MCQ only, exactly 4
  correct:     { type: mongoose.Schema.Types.Mixed, required: true }, // 'A'|'B'|'C'|'D' or number
  explanation: { type: String, default: '' },
}, { _id: true });

const TestSchema = new mongoose.Schema({
  course:          { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  instructor:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  title:           { type: String, required: true, trim: true },
  description:     { type: String, default: '' },
  durationSeconds: { type: Number, required: true, min: 60 },
  questions:       { type: [QuestionSchema], validate: v => v.length >= 1 },
  isPublished:     { type: Boolean, default: false },
  allowReview:     { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Test', TestSchema);