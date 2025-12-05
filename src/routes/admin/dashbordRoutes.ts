import { Router } from 'express';
import { dashbordController } from '../../controllers/admin/dashbordControlers';
import { authMiddleware } from '../../middleware/AuthMiddleware';
import { uploadSignupFiles } from '../../middleware/SignupUploadMiddleware';

const router = Router();

// All routes require authentication
// router.use(authMiddleware);

// Get user profile
router.get('/count', dashbordController.getCount);
// Delete account


export default router;


