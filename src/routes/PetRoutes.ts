import { Router } from 'express';
import { PetController } from '../controllers/PetController';
import { authMiddleware } from '../middleware/AuthMiddleware';
import { uploadPetPhotos } from '../middleware/UploadMiddleware';

const router = Router();

// Get pet options (public, no auth required)
// router.get('/optionsSave', PetController.createPetType);

// All other routes require authentication
router.use(authMiddleware);

router.get('/options', PetController.getPetOptions);


router.post('/optionsSave', PetController.createPetOption);
router.delete('/optionsdelete', PetController.deletePetOpation);


// Get all user's pets
router.get('/', PetController.getUserPets);

// Get single pet
router.get('/:id', PetController.getPetById);

// Add new pet (JSON - for backward compatibility)
router.post('/', PetController.addPet);

// Add new pet with FormData (files)
router.post('/add-with-files', uploadPetPhotos, PetController.addPetWithFiles);

// Update pet (handles both JSON and FormData)
router.put('/:id', uploadPetPhotos, PetController.updatePet);

// Enable/Disable pet
router.patch('/:id/status', PetController.togglePetStatus);

// Delete pet
router.delete('/:id', PetController.deletePet);

// Add photo to pet
router.post('/:id/photos', PetController.addPetPhoto);

// Remove photo from pet
router.delete('/:id/photos', PetController.removePetPhoto);

export default router;


