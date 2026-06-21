import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    fileUrl: { type: String, required: true },
    downloadUrl: { type: String },  // fl_attachment URL for forced download
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true }, // in bytes
    storageType: { type: String, enum: ['local', 'cloudinary'], default: 'local' },
    publicId: { type: String }, // Cloudinary public_id for deletion
    resourceType: { type: String, default: 'image' }, // Cloudinary resource_type for correct deletion
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('StudyMaterial', studyMaterialSchema);

