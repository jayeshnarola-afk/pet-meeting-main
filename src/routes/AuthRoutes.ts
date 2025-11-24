import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { uploadSignupFiles } from '../middleware/SignupUploadMiddleware';

const router = Router();

// Signup with file uploads (FormData)
router.post('/signup-with-files', uploadSignupFiles, AuthController.signupWithFiles);

router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

export default router;