import { Router, Request, Response } from 'express';
import { uploadProfilePhoto, uploadPetPhotos } from '../middleware/UploadMiddleware';

const router = Router();

// Upload single profile photo
router.post('/profile', uploadProfilePhoto, (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = `/uploads/profiles/${req.file.filename}`;
    
    res.json({
      message: 'Profile photo uploaded successfully',
      filePath,
      fileDetails: {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        size: req.file.size,
        mimeType: req.file.mimetype,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file', error });
  }
});

// Upload pet photos (max 3)
router.post('/pet', uploadPetPhotos, (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    if (req.files.length > 3) {
      return res.status(400).json({ message: 'Maximum 3 photos allowed per pet' });
    }

    const filePaths = req.files.map(file => ({
      path: `/uploads/pets/${file.filename}`,
      originalName: file.originalname,
      fileName: file.filename,
      size: file.size,
    }));

    res.json({
      message: 'Pet photos uploaded successfully',
      files: filePaths,
      count: filePaths.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading files', error });
  }
});

export default router;

