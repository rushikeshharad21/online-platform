import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  videoUrl: { type: String, default: '' },
  duration: { type: String, default: '0:00' },
  isFreePreview: { type: Boolean, default: false }
});

const sectionSchema = new mongoose.Schema({
  sectionTitle: { type: String, required: true, trim: true },
  lectures: [lectureSchema]
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    description: { type: String, required: true },
    
    // नवीन फील्ड्स ॲड केल्या आहेत
    thumbnailUrl: { type: String, required: true, default: '' }, 
    rating: { type: Number, default: 0, min: 0, max: 5 }, 
    numReviews: { type: Number, default: 0 }, 
    
    category: { type: String, required: true },
    price: { type: Number, default: 0 },
    level: { 
      type: String, 
      enum: ['Beginner', 'Intermediate', 'Expert'], 
      default: 'Beginner' 
    },
    instructor: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    curriculum: [sectionSchema],
    isPublished: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// इंडेक्सिंग
courseSchema.index({ category: 1, isPublished: 1 });

export default mongoose.model('Course', courseSchema);