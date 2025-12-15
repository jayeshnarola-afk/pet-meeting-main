import { Router } from 'express';
import { PetController } from '../../controllers/admin/PetController';
import { authMiddleware } from '../../middleware/AuthMiddleware';
import { uploadPetPhotos } from '../../middleware/UploadMiddleware';

const router = Router();
// Get pet options (public, no auth required)
// router.get('/optionsSave', PetController.createPetType);

// router.post('petType', PetController.createPetOption);

// All other routes require authentication
// router.use(authMiddleware);
router.get('/petTypeList', PetController.getpetTypes);
router.get('/petBreedList', PetController.getpetBreed);
router.get('/options', PetController.getPetOptions);
router.get('/personalities', PetController.getpersonalities);
router.post('/optionsSave', PetController.createPetOption);
router.delete('/optionsdelete', PetController.deletePetOpation);

// Get all  pets  with user
router.get('/list', PetController.getUserPets);
// Delete pet By Admin
router.delete('/:id', PetController.deletePet);
// Ban Pets
router.post('/banPet', PetController.banPets);
// Get single pet
router.get('/:id', PetController.getPetById);

// pet image block unblock
router.post('/blockimage', uploadPetPhotos, PetController.blockPetPhoto);

// ------------- no use  ----------------


// Add new pet (JSON - for backward compatibility)
router.post('/', PetController.addPet);
// Add new pet with FormData (files)
router.post('/add-with-files', uploadPetPhotos, PetController.addPetWithFiles);
// Update pet (handles both JSON and FormData)
router.put('/:id', uploadPetPhotos, PetController.updatePet);
// Enable/Disable pet
router.patch('/:id/status', PetController.togglePetStatus);
// Add photo to pet
router.post('/:id/photos', PetController.addPetPhoto);
// Remove photo from pet
router.delete('/:id/photos', PetController.removePetPhoto);

export default router;


