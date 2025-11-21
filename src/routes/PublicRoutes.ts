import { Router } from 'express';
import { PetController } from '../controllers/PetController';

const router = Router();

// Public routes that don't require authentication
router.get('/pet-options', PetController.getPetOptions);

export default router;


