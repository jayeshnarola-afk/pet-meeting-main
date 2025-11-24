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

// Storage configuration for profile photos
const profileStorage = multer.diskStorage({
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

// Storage configuration for pet photos
const petStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Use absolute path for Render.com compatibility
    const uploadDir = path.join(process.cwd(), 'uploads', 'pets');
    // Ensure base uploads directory exists
    ensureDirectory(path.join(process.cwd(), 'uploads'));
    // Ensure pets directory exists
    ensureDirectory(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pet-' + uniqueSuffix + path.extname(file.originalname));
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

// Upload middleware for profile photo (single image)
export const uploadProfilePhoto = multer({
  storage: profileStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
}).single('profilePhoto');

// Upload middleware for pet photos (max 3 images)
export const uploadPetPhotos = multer({
  storage: petStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  }
}).array('petPhotos', 3); // Max 3 photos per pet

// Combined upload for signup (profile + multiple pets)
export const uploadSignupImages = multer({
  storage: multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
      // Use absolute path for Render.com compatibility
      // Ensure base uploads directory exists
      ensureDirectory(path.join(process.cwd(), 'uploads'));
      
      // Profile photo goes to profiles folder, pet photos to pets folder
      if (file.fieldname === 'profilePhoto') {
        const uploadDir = path.join(process.cwd(), 'uploads', 'profiles');
        ensureDirectory(uploadDir);
        cb(null, uploadDir);
      } else if (file.fieldname.startsWith('pet')) {
        const uploadDir = path.join(process.cwd(), 'uploads', 'pets');
        ensureDirectory(uploadDir);
        cb(null, uploadDir);
      } else {
        const uploadDir = path.join(process.cwd(), 'uploads');
        ensureDirectory(uploadDir);
        cb(null, uploadDir);
      }
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const prefix = file.fieldname.startsWith('pet') ? 'pet-' : 'profile-';
      cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  }
}).fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'petPhotos0', maxCount: 3 },
  { name: 'petPhotos1', maxCount: 3 },
  { name: 'petPhotos2', maxCount: 3 },
  { name: 'petPhotos3', maxCount: 3 },
  { name: 'petPhotos4', maxCount: 3 },
]);

