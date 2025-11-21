import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/AuthMiddleware';
import { uploadSignupFiles } from '../middleware/SignupUploadMiddleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get user profile
router.get('/profile', UserController.getProfile);

// Update user profile (JSON)
router.put('/profile', UserController.updateProfile);

// Update user profile with FormData (file uploads)
router.put('/profile-with-files', uploadSignupFiles, UserController.updateProfileWithFiles);

// Change password
router.post('/change-password', UserController.changePassword);

// Delete account
router.delete('/account', UserController.deleteAccount);

// Toggle notification status
router.put('/notification-status', UserController.toggleNotificationStatus);

export default router;


