import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Helper function to ensure directory exists
const ensureDirectory = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
};

// Storage configuration for signup (only profile photo)
const signupStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Use absolute path for Render.com compatibility
    const uploadDir = path.join(process.cwd(), 'uploads', 'profiles');
    // Ensure base uploads directory exists
    ensureDirectory(path.join(process.cwd(), 'uploads'));
    // Ensure profiles directory exists
    ensureDirectory(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow only images
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'));
  }
};

// Signup upload middleware - ONLY profile photo
// Pets will be added separately via /api/pets/add-with-files
export const uploadSignupFiles = multer({
  storage: signupStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  }
}).fields([
  { name: 'profilePhoto', maxCount: 1 }
]);

