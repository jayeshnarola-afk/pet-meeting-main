import { Router } from 'express';
import { activeUserController } from '../../controllers/admin/activeUser';
import { authMiddleware } from '../../middleware/AuthMiddleware';
import { uploadSignupFiles } from '../../middleware/SignupUploadMiddleware';

const router = Router();

// All routes require authentication
// router.use(authMiddleware);

// Get user profile
router.get('/save', authMiddleware, activeUserController.saveActive);
// Delete account


export default router;


