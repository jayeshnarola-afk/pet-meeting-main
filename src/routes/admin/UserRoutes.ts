import { Router } from 'express';
import { UserController } from '../../controllers/admin/UserController';
import { authMiddleware } from '../../middleware/AuthMiddleware';
import { uploadSignupFiles } from '../../middleware/SignupUploadMiddleware';

const router = Router();

// All routes require authentication
// router.use(authMiddleware);

// Get user profile
router.get('/list', UserController.getProfile);
// Delete account
router.delete('/:id', UserController.deleteAccount);
// Ban user profile (JSON)
router.post('/banUser', UserController.banProfile);
//  profile photo block unblock
router.post('/blockuserphoto', UserController.blockOrUnblockProfilePhoto);

// ------------- no use  ----------------


// Update user profile with FormData (file uploads)
router.put('/profile-with-files', uploadSignupFiles, UserController.updateProfileWithFiles);

// Change password
router.post('/change-password', UserController.changePassword);



// Toggle notification status
router.put('/notification-status', UserController.toggleNotificationStatus);

export default router;


