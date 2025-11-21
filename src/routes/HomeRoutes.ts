import { Router } from 'express';
import { PetController } from '../controllers/PetController';
import { authMiddleware } from '../middleware/AuthMiddleware';

const router = Router();

// All home routes require authentication
router.use(authMiddleware);

// Get all pets excluding current user (for home page)
router.get('/', PetController.getAllPetsExcludingUser);

export default router;