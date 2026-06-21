import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the local uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ☁️ Configure Cloudinary (lazy — called before each Cloudinary operation)
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

// Helper to determine if Cloudinary is fully configured with real keys
export const isCloudinaryReady = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  return (
    name && name !== 'your_cloudinary_cloud_name' && name.trim() !== '' &&
    key && key !== 'your_cloudinary_api_key' && key.trim() !== '' &&
    secret && secret !== 'your_cloudinary_api_secret' && secret.trim() !== ''
  );
};

// Multer Disk Storage Configuration (acts as temp storage or local storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File type validation (only allow PDF)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

// Multer configuration: 10MB file limit
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// =========================================================================
// ☁️ CLOUDINARY UPLOAD — PDF DELIVERY FIX
// =========================================================================
// ROOT CAUSE of "Blocked for delivery":
//   1. Cloudinary blocks PDF/ZIP delivery by default on most accounts.
//      FIX: Dashboard → Settings → Security → Enable "PDF and ZIP files delivery"
//   2. resource_type must match the file type. For PDFs:
//      - 'raw'  = raw binary, no transformations, fastest — but subject to the
//                 account-level delivery block described above.
//      - 'image' = Cloudinary treats PDFs as renderable pages, but upload may
//                  fail for large/complex PDFs and still blocked if setting is off.
//      - 'auto'  = Cloudinary auto-detects the type. PDFs become 'image' type
//                  with page-based rendering support.
//   3. access_mode must be 'public' so the CDN serves the file without signed URLs.
//   4. type 'upload' is the standard public delivery pipeline.
// =========================================================================
export const uploadToCloudinary = async (localFilePath) => {
  try {
    configureCloudinary();
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: 'study_materials',
      resource_type: 'auto',       // Let Cloudinary detect — works for PDF, images, video
      type: 'upload',              // Standard public delivery pipeline
      access_mode: 'public',       // Explicitly mark as publicly deliverable
    });

    // Remove local temp file after successful upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    // Determine the actual resource_type Cloudinary assigned
    const actualResourceType = result.resource_type || 'image';

    return {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: actualResourceType,  // Store so we can use the right type for delete
    };
  } catch (error) {
    // Clean up temp file even on failure
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw error;
  }
};

// Helper to delete a file from Cloudinary
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    configureCloudinary();
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Infer the resource_type from an existing Cloudinary URL path segment
export const inferCloudinaryResourceType = (fileUrl) => {
  if (typeof fileUrl !== 'string') return 'image';
  if (fileUrl.includes('/raw/'))   return 'raw';
  if (fileUrl.includes('/video/')) return 'video';
  return 'image';
};

// Build a Cloudinary URL that forces the browser to download (Content-Disposition: attachment)
export const getCloudinaryDownloadUrl = (secureUrl) => {
  if (!secureUrl || !secureUrl.includes('cloudinary')) return secureUrl;
  // Insert fl_attachment before the version/public_id segment
  // e.g. .../image/upload/v123/... → .../image/upload/fl_attachment/v123/...
  return secureUrl.replace('/upload/', '/upload/fl_attachment/');
};

// Helper to delete a local file
export const deleteLocalFile = (filePath) => {
  try {
    const fullPath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(uploadsDir, path.basename(filePath));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error('Error deleting local file:', error);
  }
};

