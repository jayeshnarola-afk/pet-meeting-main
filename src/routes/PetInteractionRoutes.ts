// src/routes/PetInteractionRoutes.ts
import { Router } from 'express';
import { PetInteractionController } from '../controllers/PetInteractionController';
import { authMiddleware } from '../middleware/AuthMiddleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Like a pet
router.post('/:petId/like', PetInteractionController.likePet);

// Pass a pet
router.post('/:petId/pass', PetInteractionController.passPet);

// Get user's matches
router.get('/matches', PetInteractionController.getMatches);

// Get unseen pets (for home feed)
router.get('/unseen', PetInteractionController.getUnseenPets);

// Accept a like request
router.post('/accept-like', PetInteractionController.acceptLike);

// Reject a like request
router.post('/reject-like', PetInteractionController.rejectLike);

export default router;