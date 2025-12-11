import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Pet } from '../../entities/Pet';
import { PetType } from '../../entities/PetType';
import { PetBreed } from '../../entities/PetBreed';
import { PetPersonality } from '../../entities/PetPersonality';
import { PetInteraction } from '../../entities/PetInteraction';
import { Match } from '../../entities/Match';
import { User } from '../../entities/User';
import { Not, In } from 'typeorm';
import { IsNull } from "typeorm";

const petRepository = AppDataSource.getRepository(Pet);
const petTypeRepository = AppDataSource.getRepository(PetType);
const petBreedRepository = AppDataSource.getRepository(PetBreed);
const petPersonalityRepository = AppDataSource.getRepository(PetPersonality);
const matchRepository = AppDataSource.getRepository(Match);
const userRepository = AppDataSource.getRepository(User);

export class PetController {
  // Get pet options (types, breeds, personalities) from database
  static async getPetOptions(req: Request, res: Response) {

    try {
      // Get all pet types
      const types = await petTypeRepository.find({
        // where: [
        //   { userId: IsNull() },   // common types
        //   { userId: userId }      // user types
        // ],
        order: { name: 'ASC' }
      });

      // Get all breeds with their associated types
      const breeds = await petBreedRepository.find({
        relations: ['type'],
        order: { name: 'ASC' }
      });

      // Create types with their breeds
      const typesWithBreeds = types.map(type => ({
        id: type.id,
        name: type.name,
        // userId: type.userId,
        // isStatic: type.userId ? false : true,
        breeds: breeds
          .filter(breed => breed.typeId === type.id)
          .map(breed => ({
            id: breed.id,
            name: breed.name,
            // isStatic: breed.userId ? false : true,

          }))
      }));

      res.json({
        message: 'Pet options retrieved successfully',
        types: typesWithBreeds,
      });
    } catch (error) {
      console.error('❌ Get pet options error:', error);
      res.status(500).json({
        message: 'Server error',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  static async getpetTypes(req: Request, res: Response) {
    try {
      // Get all personalities
      const petType = await petTypeRepository.find({
        order: { name: 'ASC' }
      });

      res.json({
        message: 'PetType retrieved successfully',
        petType: petType.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description
          // isStatic: p.userId ? false : true,
        }))
      });
    } catch (error) {
      console.error('❌ Get pet options error:', error);
      res.status(500).json({
        message: 'Server error',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  static async getpetBreed(req: Request, res: Response) {
    try {
      const petTypeId = Number(req.query.petTypeId);
      console.log("petTypeId------>", petTypeId);
      if (!petTypeId) return res.status(404).json({ message: "petTypeId Require" });
      // Get all Breeds
      const petType = await petBreedRepository.find({
        where: { typeId: petTypeId },
        order: { name: 'ASC' },
        relations: ['type']
      });


      res.json({
        message: 'Breeds retrieved successfully',
        Breeds: petType.map(p => ({
          id: p.id,
          name: p.name,
          typeId: p.typeId,
          description: p.description
          // isStatic: p.userId ? false : true,
        }))
      });
    } catch (error) {
      console.error('❌ Get pet Breeds error:', error);
      res.status(500).json({
        message: 'Server error',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }




  static async getpersonalities(req: Request, res: Response) {
    try {
      // Get all personalities
      const personalities = await petPersonalityRepository.find({
        order: { name: 'ASC' }
      });

      res.json({
        message: 'personalities retrieved successfully',
        personalities: personalities.map(p => ({
          id: p.id,
          name: p.name,
          // isStatic: p.userId ? false : true,
        }))
      });
    } catch (error) {
      console.error('❌ Get pet options error:', error);
      res.status(500).json({
        message: 'Server error',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }




  static async createPetOption(req: Request, res: Response) {
    const { petTypeName, breed, petTypeId, Personality } = req.body;
    // const userId = (req as any).user.id;
    try {
      // const user = await userRepository.findOneBy({ id: userId });
      // if (!user) return res.status(404).json({ message: "User not found" });

      // save petTypeName 
      if (petTypeName) {
        const checkPettype = await petTypeRepository.findOne({ where: { name: petTypeName } });
        if (checkPettype) {
          return res.status(404).json({ message: "Allready Created  this name" });
        }
        const petType = await petTypeRepository.save({
          name: petTypeName,
          // userId: user.id,
        });
        const { id, ...rest } = petType;
        res.json({
          message: 'save successfully',
          Data: {
            typeId: petType.id,
            ...rest,
          }
        });


      }
      // save  breed &  petTypeId
      if (breed && petTypeId) {

        const checkBreed = await petBreedRepository.findOneBy({ name: breed, typeId: petTypeId });
        if (checkBreed) {
          return res.status(404).json({ message: "Allready Created  this name" });
        }
        const creatBreed = await petBreedRepository.save({
          name: breed,
          typeId: petTypeId,
          // userId: user.id,
        });

        const { id, ...rest } = creatBreed;
        res.json({
          message: 'save successfully',
          Data: {
            breedId: creatBreed.id,   // 👈 renamed key
            ...rest,           // बाकी सब properties same
          }
        });

      }
      // save Personality
      if (Personality) {
        const exists = await petPersonalityRepository.findOne({
          where: { name: Personality }
        });

        if (exists) {
          return res.status(404).json({ message: "Allready Created  this name" });
        }
        const creatPersonality = await petPersonalityRepository.save({
          name: Personality,
          // userId: user.id,
        });
        const { id, ...rest } = creatPersonality;
        res.json({
          message: 'save successfully',
          Data: {
            PersonalityId: creatPersonality.id,   // 👈 renamed key
            ...rest,           // बाकी सब properties same
          }
        });

      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Error saving" });
    }
  };

  static async deletePetOpation(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { isPetType, isbreed, isPersonality, iPetTypeId, iBreedId, iPersonalityId } = req.body

      if (isPetType) {
        const pettype = await petTypeRepository.findOne({ where: { id: iPetTypeId } });
        if (!pettype) {
          return res.status(404).json({ message: "Pet type not found" });
        }
        // DELETE (breeds)
        await petBreedRepository.delete({ typeId: iPetTypeId });
        // DELETE (PetTypes)
        await petTypeRepository.delete(iPetTypeId);
        res.json({
          message: "Pet type And All pet Breed of Type deleted  successfully"
        });
      }
      if (isbreed) {
        const breedFind = await petBreedRepository.findOne({ where: { id: iBreedId } });
        if (!breedFind) {
          return res.status(404).json({ message: "Breed Not  found" });
        }
        // DELETE (breeds will auto delete because of CASCADE)
        await petBreedRepository.delete(iBreedId);
        res.json({
          message: "Pet Breed deleted successfully"
        });

      }
      if (isPersonality) {
        const breedFind = await petPersonalityRepository.findOne({ where: { id: iPersonalityId } });
        if (!breedFind) {
          return res.status(404).json({ message: "Personality Not  found" });
        }
        // DELETE (breeds will auto delete because of CASCADE)
        await petPersonalityRepository.delete(iPersonalityId);
        res.json({
          message: "Pet Personality deleted successfully"
        });

      }

    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }




  // Get all pets with   
  static async getUserPets(req: Request, res: Response) {
    try {
      // const userId = (req as any).user.id; 
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const {
        search,
        typeId,
        breedId,
        personalityId,
        ownerId,
        lookingFor,
        health,
        ageMin,
        age,
        ageMax
      } = req.query;

      const query = petRepository
        .createQueryBuilder("pet")
        .leftJoinAndSelect("pet.type", "type")
        .leftJoinAndSelect("pet.breed", "breed")
        .leftJoinAndSelect("pet.personalities", "personalities")
        .leftJoinAndSelect("pet.owner", "owner")
        .orderBy("pet.id", "DESC")
        .skip(skip)
        .take(limit);

      if (search) {
        query.andWhere(`
        pet.name ILIKE :search OR
        breed.name ILIKE :search OR
        pet.lookingFor ILIKE :search OR
        type.name ILIKE :search OR
        owner.fullName ILIKE :search
      `, { search: `%${search}%` });
      }

      if (typeId) query.andWhere("type.id = :typeId", { typeId });
      if (age) query.andWhere("pet.age = :age", { age });
      if (breedId) query.andWhere("breed.id = :breedId", { breedId });
      if (ownerId) query.andWhere("owner.id = :ownerId", { ownerId });
      if (lookingFor) query.andWhere("pet.lookingFor = :lookingFor", { lookingFor });
      if (health) query.andWhere("pet.health = :health", { health });
      if (personalityId) {
        query.andWhere("personalities.id = :personalityId", { personalityId });
      }

      if (ageMin) query.andWhere("pet.age >= :ageMin", { ageMin });
      if (ageMax) query.andWhere("pet.age <= :ageMax", { ageMax });

      const total = await query.getCount();
      const pets = await query.getMany();

      // Get match counts for all user's pets
      const petIds = pets.map(pet => pet.id);
      let matchCountMap = new Map();

      if (petIds.length > 0) {
        // Get matches where pets are pet1
        const matchCountsAsPet1 = await matchRepository
          .createQueryBuilder('match')
          .select('match.pet1Id', 'petId')
          .addSelect('COUNT(*)', 'matchCount')
          .where('match.pet1Id IN (:...petIds)', { petIds })
          .andWhere('match.isActive = :isActive', { isActive: true })
          .groupBy('match.pet1Id')
          .getRawMany();

        // Get matches where pets are pet2
        const matchCountsAsPet2 = await matchRepository
          .createQueryBuilder('match')
          .select('match.pet2Id', 'petId')
          .addSelect('COUNT(*)', 'matchCount')
          .where('match.pet2Id IN (:...petIds)', { petIds })
          .andWhere('match.isActive = :isActive', { isActive: true })
          .groupBy('match.pet2Id')
          .getRawMany();

        // Create a map of petId -> total match count
        // Add matches where pet is pet1
        matchCountsAsPet1.forEach(match => {
          const petId = parseInt(match.petId);
          const count = parseInt(match.matchCount);
          matchCountMap.set(petId, (matchCountMap.get(petId) || 0) + count);
        });

        // Add matches where pet is pet2
        matchCountsAsPet2.forEach(match => {
          const petId = parseInt(match.petId);
          const count = parseInt(match.matchCount);
          matchCountMap.set(petId, (matchCountMap.get(petId) || 0) + count);
        });
      }

      // Convert photo paths to full URLs and add type/breed/personality names
      const petsWithDetails = pets.map(pet => ({
        ...pet,
        typeName: pet.type?.name,
        breedName: pet.breed?.name,
        personalityNames: pet.personalities?.map(p => p.name) || [],
        // photos: pet.photos ? pet.photos.map(photo =>
        //   photo.startsWith('http') ? photo : `https://pet-meeting.onrender.com${photo}`
        // ) : [],
        photos: pet.photos
          ? pet.photos.map(photo => ({
            ...photo,
            url: photo.url.startsWith('http')
              ? photo.url
              : `https://pet-meeting.onrender.com${photo.url}`
          }))
          : [],
        totalMatches: matchCountMap.get(pet.id) || 0
      }));

      res.json({
        message: 'Pets retrieved successfully',
        pets: petsWithDetails,
        count: petsWithDetails.length,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.log("🔥 INTERNAL ERROR --->", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  // Get all pets excluding current user's pets (for home page) with optional filters and pagination
  // src/controllers/PetController.ts - getAllPetsExcludingUser function ko replace karna (line 96 se)
  // Get all pets excluding current user's pets (for home page) with optional filters and pagination
  static async getAllPetsExcludingUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { typeId, breedId, size, personalityIds, age, page = '1', limit = '10' } = req.query;

      // Parse pagination parameters
      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 10));
      const offset = (pageNum - 1) * limitNum;

      // Get all user's pets (enabled and disabled)
      const allUserPets = await petRepository.find({
        where: { ownerId: userId }
      });

      // Get user's enabled pets
      const userEnabledPets = allUserPets.filter(pet => pet.isEnabled);

      // Check different scenarios and return appropriate messages
      if (allUserPets.length === 0) {
        // User has no pets at all
        return res.json({
          message: 'Please add a pet first to see other pets.',
          pets: [],
          pagination: {
            currentPage: pageNum,
            totalPages: 0,
            totalCount: 0,
            limit: limitNum,
            hasNextPage: false,
            hasPrevPage: false,
            nextPage: null,
            prevPage: null
          },
          filters: {
            typeId: typeId ? parseInt(typeId as string) : null,
            breedId: breedId ? parseInt(breedId as string) : null,
            size: size || null,
            personalityIds: personalityIds ? (
              Array.isArray(personalityIds)
                ? personalityIds.map(id => parseInt(id as string))
                : (personalityIds as string).split(',').map(id => parseInt(id.trim()))
            ) : null,
            age: age ? parseInt(age as string) : null
          },
          userPets: {
            totalPets: 0,
            enabledPets: 0,
            disabledPets: 0
          },
          actionRequired: {
            type: 'add_pet',
            message: 'Add your first pet to start browsing other pets!',
            action: 'POST /api/pets'
          }
        });
      }

      if (userEnabledPets.length === 0) {
        // User has pets but none are enabled
        return res.json({
          message: 'Please enable a pet to see other pets.',
          pets: [],
          pagination: {
            currentPage: pageNum,
            totalPages: 0,
            totalCount: 0,
            limit: limitNum,
            hasNextPage: false,
            hasPrevPage: false,
            nextPage: null,
            prevPage: null
          },
          filters: {
            typeId: typeId ? parseInt(typeId as string) : null,
            breedId: breedId ? parseInt(breedId as string) : null,
            size: size || null,
            personalityIds: personalityIds ? (
              Array.isArray(personalityIds)
                ? personalityIds.map(id => parseInt(id as string))
                : (personalityIds as string).split(',').map(id => parseInt(id.trim()))
            ) : null,
            age: age ? parseInt(age as string) : null
          },
          userPets: {
            totalPets: allUserPets.length,
            enabledPets: 0,
            disabledPets: allUserPets.length
          },
          actionRequired: {
            type: 'enable_pet',
            message: 'Enable one of your pets to start browsing other pets!',
            action: 'PATCH /api/pets/{petId}/status',
            availablePets: allUserPets.map(pet => ({
              id: pet.id,
              name: pet.name,
              isEnabled: pet.isEnabled
            }))
          }
        });
      }

      // User has enabled pets, proceed with normal logic
      // Get all pets that current user has interacted with
      const petInteractionRepository = AppDataSource.getRepository(PetInteraction);

      const interactions = await petInteractionRepository.find({
        where: { likerUserId: userId }
      });

      // Separate liked and passed pets
      const likedPetIds = interactions
        .filter(interaction => interaction.action === 'like')
        .map(interaction => interaction.likedPetId);

      const passedPetIds = interactions
        .filter(interaction => interaction.action === 'pass')
        .map(interaction => interaction.likedPetId);

      // Get pets that should be excluded (only liked pets, not passed pets)
      // Passed pets will be shown again on home page
      const excludedPetIds = [...likedPetIds];

      // Build where conditions
      const whereConditions: any = {
        ownerId: Not(userId),
        isEnabled: true
      };

      // Exclude interacted pets
      if (excludedPetIds.length > 0) {
        whereConditions.id = Not(In(excludedPetIds));
      }

      // Add filters if provided
      if (typeId) {
        whereConditions.typeId = parseInt(typeId as string);
      }
      if (breedId) {
        whereConditions.breedId = parseInt(breedId as string);
      }
      if (size) {
        whereConditions.size = size as string;
      }

      // Add age filter if provided
      if (age !== undefined) {
        whereConditions.age = parseInt(age as string);
      }

      // Get total count for pagination
      const totalCount = await petRepository.count({ where: whereConditions });

      let pets = await petRepository.find({
        where: whereConditions,
        relations: ['type', 'breed', 'personalities', 'owner'],
        order: { createdAt: 'DESC' },
        skip: offset,
        take: limitNum
      });

      // Filter by personality if provided
      if (personalityIds) {
        const personalityIdArray = Array.isArray(personalityIds)
          ? personalityIds.map(id => parseInt(id as string))
          : (personalityIds as string).split(',').map(id => parseInt(id.trim()));

        pets = pets.filter(pet =>
          pet.personalities && personalityIdArray.some(pid =>
            pet.personalities.some(p => p.id === pid)
          )
        );
      }

      // Get current user's pets to check if they were already liked
      const userPets = await petRepository.find({
        where: { ownerId: userId, isEnabled: true }
      });

      const userPetIds = userPets.map(pet => pet.id);

      // Check which pets have already liked current user's pets
      const alreadyLikedInteractions = await petInteractionRepository.find({
        where: {
          likedPetId: In(userPetIds),
          action: 'like'
        }
      });

      // Create a map of petId -> isAlreadyLike
      const alreadyLikedMap = new Map();
      alreadyLikedInteractions.forEach(interaction => {
        alreadyLikedMap.set(interaction.likerPetId, true);
      });

      // Convert photo paths to full URLs and add type/breed/personality names and owner details
      const petsWithDetails = pets.map(pet => ({
        ...pet,
        typeName: pet.type?.name,
        breedName: pet.breed?.name,
        personalityNames: pet.personalities?.map(p => p.name) || [],
        // photos: pet.photos ? pet.photos.map(photo =>
        //   photo.startsWith('http') ? photo : `https://pet-meeting.onrender.com${photo}`
        // ) : [],
        photos: pet.photos
          ? pet.photos.map(photo => ({
            ...photo,
            url: photo.url.startsWith('http')
              ? photo.url
              : `https://pet-meeting.onrender.com${photo.url}`
          }))
          : [],
        ownerName: pet.owner?.fullName,
        ownerLocation: pet.owner?.location,
        ownerProfilePhoto: pet.owner?.profilePhoto ? (
          pet.owner.profilePhoto.startsWith('http') ? pet.owner.profilePhoto : `https://pet-meeting.onrender.com${pet.owner.profilePhoto}`
        ) : null,
        isAlreadyLike: alreadyLikedMap.has(pet.id) || false
      }));

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

      // Get user's pet statistics
      const userPetsStats = {
        totalPets: allUserPets.length,
        enabledPets: userEnabledPets.length,
        disabledPets: allUserPets.length - userEnabledPets.length
      };

      res.json({
        message: 'No pet profiles available at the moment',
        pets: petsWithDetails,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? pageNum + 1 : null,
          prevPage: hasPrevPage ? pageNum - 1 : null
        },
        filters: {
          typeId: typeId ? parseInt(typeId as string) : null,
          breedId: breedId ? parseInt(breedId as string) : null,
          size: size || null,
          personalityIds: personalityIds ? (
            Array.isArray(personalityIds)
              ? personalityIds.map(id => parseInt(id as string))
              : (personalityIds as string).split(',').map(id => parseInt(id.trim()))
          ) : null,
          age: age ? parseInt(age as string) : null
        },
        userPets: userPetsStats,
        // Debug info (remove in production)
        debug: {
          excludedPetIds,
          likedPetIds,
          passedPetIds,
          totalInteractions: interactions.length,
          userPetIds,
          alreadyLikedCount: alreadyLikedInteractions.length
        }
      });
    } catch (error) {
      console.error('❌ Get all pets error:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }

  // Get single pet details
  static async getPetById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const petId = parseInt(req.params.id);

      // Validate pet ID
      if (isNaN(petId) || petId <= 0) {
        return res.status(400).json({ message: 'Invalid pet ID' });
      }

      const pet = await petRepository.findOne({
        where: { id: petId, ownerId: userId },
        relations: ['type', 'breed', 'personalities']
      });

      if (!pet) {
        return res.status(404).json({ message: 'Pet not found' });
      }

      // Get match counts for this pet
      const matchCountsAsPet1 = await matchRepository
        .createQueryBuilder('match')
        .select('COUNT(*)', 'matchCount')
        .where('match.pet1Id = :petId', { petId })
        .andWhere('match.isActive = :isActive', { isActive: true })
        .getRawOne();

      const matchCountsAsPet2 = await matchRepository
        .createQueryBuilder('match')
        .select('COUNT(*)', 'matchCount')
        .where('match.pet2Id = :petId', { petId })
        .andWhere('match.isActive = :isActive', { isActive: true })
        .getRawOne();

      // Calculate total matches
      const totalMatches = (parseInt(matchCountsAsPet1?.matchCount || '0') +
        parseInt(matchCountsAsPet2?.matchCount || '0'));

      // Convert photo paths to full URLs and add type/breed/personality names
      const petWithDetails = {
        ...pet,
        typeName: pet.type?.name,
        breedName: pet.breed?.name,
        personalityNames: pet.personalities?.map(p => p.name) || [],
        // photos: pet.photos ? pet.photos.map(photo =>
        //   photo.startsWith('http') ? photo : `https://pet-meeting.onrender.com${photo}`
        // ) : [],
        photos: pet.photos
          ? pet.photos.map(photo => ({
            ...photo,
            url: photo.url.startsWith('http')
              ? photo.url
              : `https://pet-meeting.onrender.com${photo.url}`
          }))
          : [],

        totalMatches: totalMatches
      };

      res.json({
        message: 'Pet retrieved successfully',
        pet: petWithDetails
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  // Add new pet (JSON)
  static async addPet(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const petData = req.body;

      // Validate user exists in database
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        console.error(`❌ User with ID ${userId} not found in database`);
        return res.status(404).json({
          message: 'User not found. Please login again or check your authentication token.'
        });
      }

      // Validate required fields
      if (!petData.name || !petData.typeId || !petData.breedId || !petData.age || !petData.gender) {
        return res.status(400).json({
          message: 'Missing required fields: name, typeId, breedId, age, gender'
        });
      }

      // Check if user has any enabled pets
      const existingEnabledPets = await petRepository.find({
        where: { ownerId: userId, isEnabled: true }
      });

      // Determine isEnabled status for new pet
      let isEnabled = true;
      if (existingEnabledPets.length > 0) {
        // User already has enabled pets, so new pet should be disabled
        isEnabled = false;
      }

      // Validate typeId exists
      const type = await petTypeRepository.findOne({ where: { id: petData.typeId } });
      if (!type) {
        return res.status(400).json({ message: 'Invalid typeId' });
      }

      // Validate breedId exists and belongs to the type
      const breed = await petBreedRepository.findOne({ where: { id: petData.breedId, typeId: petData.typeId } });
      if (!breed) {
        return res.status(400).json({ message: 'Invalid breedId for the selected type' });
      }

      // Validate personalities if provided
      let personalities: PetPersonality[] = [];
      if (petData.personalityIds && Array.isArray(petData.personalityIds)) {
        personalities = await petPersonalityRepository.findByIds(petData.personalityIds);
        if (personalities.length !== petData.personalityIds.length) {
          return res.status(400).json({ message: 'One or more invalid personalityIds' });
        }
      }

      // Validate photos (max 3)
      if (petData.photos && Array.isArray(petData.photos) && petData.photos.length > 3) {
        return res.status(400).json({
          message: `Maximum 3 photos allowed per pet. You provided ${petData.photos.length} photos.`
        });
      }

      // Ensure photos is an array
      if (!petData.photos) {
        petData.photos = [];
      }

      const pet = petRepository.create({
        name: petData.name,
        typeId: petData.typeId,
        breedId: petData.breedId,
        age: petData.age,
        gender: petData.gender,
        size: petData.size || undefined,
        color: petData.color || undefined,
        bio: petData.bio || undefined,
        vaccinationNotes: petData.vaccinationNotes || undefined,
        specialNeeds: petData.specialNeeds || undefined,
        lookingFor: petData.lookingFor || undefined,
        isEnabled: isEnabled, // Set based on existing pets
        photos: petData.photos,
        ownerId: userId,
        personalities: personalities
      });

      const savedPet = await petRepository.save(pet);

      res.status(201).json({
        message: `Pet added successfully${isEnabled ? '' : ' (disabled - you already have enabled pets)'}`,
        pet: savedPet,
        isEnabled: isEnabled,
        existingEnabledPets: existingEnabledPets.length
      });
    } catch (error) {
      console.error('❌ Add pet error:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }

  // Add new pet with FormData (files)
  static async addPetWithFiles(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { name, typeId, breedId, age, gender, size, color, personalityIds, bio, vaccinationNotes, specialNeeds, lookingFor, isEnabled } = req.body;

      // Debug logging
      console.log('🔍 PetController.addPetWithFiles called');
      console.log('📝 Request body:', req.body);
      console.log('🔑 Extracted fields:', { name, typeId, breedId, age, gender });
      console.log('👤 User ID from token:', userId);

      // Validate user exists in database
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        console.error(`❌ User with ID ${userId} not found in database`);
        return res.status(404).json({
          message: 'User not found. Please login again or check your authentication token.'
        });
      }

      // Validate required fields
      if (!name || !typeId || !breedId || !age || !gender) {
        console.log('❌ Validation failed:', { name, typeId, breedId, age, gender });
        return res.status(400).json({
          message: 'Missing required fields: name, typeId, breedId, age, gender'
        });
      }

      // Check if user has any enabled pets
      const existingEnabledPets = await petRepository.find({
        where: { ownerId: userId, isEnabled: true }
      });

      // Determine isEnabled status for new pet
      let newPetIsEnabled = true;
      if (existingEnabledPets.length > 0) {
        // User already has enabled pets, so new pet should be disabled
        newPetIsEnabled = false;
      }

      // Validate typeId exists
      const type = await petTypeRepository.findOne({ where: { id: parseInt(typeId) } });
      if (!type) {
        return res.status(400).json({ message: 'Invalid typeId' });
      }

      // Validate breedId exists and belongs to the type
      const breed = await petBreedRepository.findOne({ where: { id: parseInt(breedId), typeId: parseInt(typeId) } });
      if (!breed) {
        return res.status(400).json({ message: 'Invalid breedId for the selected type' });
      }

      // Validate personalities if provided
      let personalities: PetPersonality[] = [];
      if (personalityIds) {
        const personalityIdArray = Array.isArray(personalityIds) ? personalityIds : personalityIds.split(',').map((id: string) => parseInt(id.trim()));
        personalities = await petPersonalityRepository.findByIds(personalityIdArray);
        if (personalities.length !== personalityIdArray.length) {
          return res.status(400).json({ message: 'One or more invalid personalityIds' });
        }
      }

      // Get uploaded pet photos
      // const files = req.files as Express.Multer.File[] | undefined;
      // let petPhotos: string[] = [];

      // if (files && files.length > 0) {
      //   // Validate max 3 photos
      //   if (files.length > 3) {
      //     return res.status(400).json({
      //       message: `Maximum 3 photos allowed per pet. You uploaded ${files.length} photos.`
      //     });
      //   }

      //   petPhotos = files.map(file => `/uploads/pets/${file.filename}`);
      // }
      let petPhotos: { url: string; isBlocked: boolean }[] = [];
      const files = req.files as Express.Multer.File[] | undefined;
      if (files && files.length > 0) {
        if (files.length > 3) {
          return res.status(400).json({
            message: `Maximum 3 photos allowed per pet. You uploaded ${files.length} photos.`,
          });
        }

        petPhotos = files.map(file => ({
          url: `/uploads/pets/${file.filename}`,
          isBlocked: false, // default
        }));
      }

      // Create pet
      const pet = petRepository.create({
        name,
        typeId: parseInt(typeId),
        breedId: parseInt(breedId),
        age: parseInt(age),
        gender,
        size: size || undefined,
        color: color || undefined,
        bio: bio || undefined,
        vaccinationNotes: vaccinationNotes || undefined,
        specialNeeds: specialNeeds || undefined,
        lookingFor: lookingFor || undefined,
        isEnabled: newPetIsEnabled, // Set based on existing pets
        photos: petPhotos,
        ownerId: userId,
        personalities: personalities
      });

      const savedPet = await petRepository.save(pet);

      console.log(`✅ Pet added successfully: ${name} (${type.name}) - Enabled: ${newPetIsEnabled}`);

      res.status(201).json({
        message: `Pet added successfully${newPetIsEnabled ? '' : ' (disabled - you already have enabled pets)'}`,
        pet: {
          id: savedPet.id,
          name: savedPet.name,
          type: savedPet.type,
          breed: savedPet.breed,
          age: savedPet.age,
          gender: savedPet.gender,
          photos: savedPet.photos,
          isEnabled: savedPet.isEnabled,
          createdAt: savedPet.createdAt,
        },
        isEnabled: newPetIsEnabled,
        existingEnabledPets: existingEnabledPets.length
      });
    } catch (error) {
      console.error('❌ Add pet with files error:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }

  // Update pet
  static async updatePet(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const petId = parseInt(req.params.id);
      const { name, typeId, breedId, age, gender, size, color, personalityIds, bio, vaccinationNotes, specialNeeds, lookingFor, isEnabled } = req.body;

      // Debug logging
      console.log('🔍 PetController.updatePet called');
      // console.log('📝 Request body:', req.body);

      // Validate pet ID
      if (isNaN(petId) || petId <= 0) {
        return res.status(400).json({ message: 'Invalid pet ID' });
      }

      const pet = await petRepository.findOne({
        where: { id: petId, ownerId: userId }
      });

      if (!pet) {
        return res.status(404).json({ message: 'Pet not found or you do not have permission' });
      }

      // Validate typeId if being updated
      if (typeId !== undefined) {
        const type = await petTypeRepository.findOne({ where: { id: parseInt(typeId) } });
        if (!type) return res.status(400).json({ message: 'Invalid typeId' });
        pet.typeId = parseInt(typeId);
      }

      // Validate breedId if being updated
      if (breedId !== undefined) {
        const breed = await petBreedRepository.findOne({ where: { id: parseInt(breedId), typeId: pet.typeId } });
        if (!breed) return res.status(400).json({ message: 'Invalid breedId for the selected type' });
        pet.breedId = parseInt(breedId);
      }

      // Validate personalities if being updated
      if (personalityIds !== undefined) {
        const personalityIdArray = Array.isArray(personalityIds) ? personalityIds : personalityIds.split(',').map((id: string) => parseInt(id.trim()));
        const personalities = await petPersonalityRepository.findByIds(personalityIdArray);
        if (personalities.length !== personalityIdArray.length) {
          return res.status(400).json({ message: 'One or more invalid personalityIds' });
        }
        pet.personalities = personalities;
      }

      // Handle file uploads (FormData)
      // const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      // if (files && files['petPhotos']) {
      //   const uploadedFiles = files['petPhotos'];
      //   const photoPaths = uploadedFiles.map(file => `/uploads/pets/${file.filename}`);

      //   // Validate max 3 photos
      //   if (photoPaths.length > 3) {
      //     return res.status(400).json({
      //       message: `Maximum 3 photos allowed per pet. You provided ${photoPaths.length} photos.`
      //     });
      //   }

      //   pet.photos = photoPaths;
      // }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      if (files && files['petPhotos']) {
        const uploadedFiles = files['petPhotos'];

        // Validate max 3 photos
        if (uploadedFiles.length > 3) {
          return res.status(400).json({
            message: `Maximum 3 photos allowed per pet. You provided ${uploadedFiles.length} photos.`
          });
        }

        // Convert each file → { url, isBlocked }
        pet.photos = uploadedFiles.map(file => ({
          url: `/uploads/pets/${file.filename}`,
          isBlocked: false,  // default value
        }));
      }

      // Update only provided fields
      if (name !== undefined) pet.name = name;
      if (age !== undefined) pet.age = parseInt(age);
      if (gender !== undefined) pet.gender = gender;
      if (size !== undefined) pet.size = size;
      if (color !== undefined) pet.color = color;
      if (bio !== undefined) pet.bio = bio;
      if (vaccinationNotes !== undefined) pet.vaccinationNotes = vaccinationNotes;
      if (specialNeeds !== undefined) pet.specialNeeds = specialNeeds;
      if (lookingFor !== undefined) pet.lookingFor = lookingFor;
      if (isEnabled !== undefined) pet.isEnabled = isEnabled === 'true' || isEnabled === true;

      await petRepository.save(pet);

      // Fetch updated pet with relations for response
      const updatedPet = await petRepository.findOne({
        where: { id: petId },
        relations: ['type', 'breed', 'personalities']
      });

      // Map pet data for response
      const petWithDetails = {
        ...updatedPet,
        typeName: updatedPet?.type?.name,
        breedName: updatedPet?.breed?.name,
        personalityNames: updatedPet?.personalities?.map(p => p.name) || [],
        photos: pet.photos
          ? pet.photos.map(photo => ({
            ...photo,
            url: photo.url.startsWith('http')
              ? photo.url
              : `https://pet-meeting.onrender.com${photo.url}`
          }))
          : [],
      };

      res.json({
        message: 'Pet updated successfully',
        pet: petWithDetails
      });
    } catch (error) {
      console.error('❌ Update pet error:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }
  // ---------- Ban pets ----------
  static async banPets(req: Request, res: Response) {
    try {
      const { isBan, petId } = req.body;

      if (typeof isBan !== "boolean") {
        return res.status(404).json({ message: 'require isBan' });
      }
      if (!petId) {
        return res.status(404).json({ message: 'require petId' });
      }

      const pet = await petRepository.findOne({
        where: { id: petId }
      });

      if (!pet) {
        return res.status(404).json({ message: 'Pet not found' });
      }

      pet.isBan = isBan;

      await petRepository.save(pet);
      res.json({
        message: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('❌ Toggle pet status error:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }



  // Enable/Disable pet
  static async togglePetStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const petId = parseInt(req.params.id);
      const { isEnabled } = req.body;

      // Debug logging
      console.log('🔍 PetController.togglePetStatus called');
      console.log('📝 Request body:', req.body);

      // Validate pet ID
      if (isNaN(petId) || petId <= 0) {
        return res.status(400).json({ message: 'Invalid pet ID' });
      }

      // Validate isEnabled field
      if (typeof isEnabled !== 'boolean') {
        return res.status(400).json({ message: 'isEnabled must be a boolean value (true/false)' });
      }

      const pet = await petRepository.findOne({
        where: { id: petId, ownerId: userId }
      });

      if (!pet) {
        return res.status(404).json({ message: 'Pet not found or you do not have permission' });
      }

      // If enabling a pet, disable all other pets of the user
      if (isEnabled) {
        // First, disable all other pets of the user
        await petRepository.update(
          { ownerId: userId, id: Not(petId) },
          { isEnabled: false }
        );

        console.log(`�� Disabled all other pets for user ${userId}`);
      }

      // Update current pet status
      pet.isEnabled = isEnabled;
      await petRepository.save(pet);

      // Get all user's pets to show updated status
      const allUserPets = await petRepository.find({
        where: { ownerId: userId },
        relations: ['type', 'breed', 'personalities'],
        order: { createdAt: 'DESC' }
      });

      // Fetch updated pet with relations for response
      const updatedPet = await petRepository.findOne({
        where: { id: petId },
        relations: ['type', 'breed', 'personalities']
      });

      // Map pet data for response
      const petWithDetails = {
        ...updatedPet,
        typeName: updatedPet?.type?.name,
        breedName: updatedPet?.breed?.name,
        personalityNames: updatedPet?.personalities?.map(p => p.name) || [],
        photos: pet.photos
          ? pet.photos.map(photo => ({
            ...photo,
            url: photo.url.startsWith('http')
              ? photo.url
              : `https://pet-meeting.onrender.com${photo.url}`
          }))
          : [],
      };

      // Map all pets for response
      const allPetsWithDetails = allUserPets.map(pet => ({
        ...pet,
        typeName: pet.type?.name,
        breedName: pet.breed?.name,
        personalityNames: pet.personalities?.map(p => p.name) || [],
        photos: pet.photos
          ? pet.photos.map(photo => ({
            ...photo,
            url: photo.url.startsWith('http')
              ? photo.url
              : `https://pet-meeting.onrender.com${photo.url}`
          }))
          : [],
      }));

      res.json({
        message: `Pet ${isEnabled ? 'enabled' : 'disabled'} successfully${isEnabled ? ' (other pets disabled)' : ''}`,
        pet: petWithDetails,
        allPets: allPetsWithDetails, // Show all pets with updated status
        enabledPetsCount: allPetsWithDetails.filter(p => p.isEnabled).length
      });
    } catch (error) {
      console.error('❌ Toggle pet status error:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }

  // Delete pet
  static async deletePet(req: Request, res: Response) {
    try {
      // const userId = (req as any).user.id;
      const petId = parseInt(req.params.id);

      // Validate pet ID
      if (isNaN(petId) || petId <= 0) {
        return res.status(400).json({ message: 'Invalid pet ID' });
      }

      const pet = await petRepository.findOne({
        where: { id: petId }
      });

      if (!pet) {
        return res.status(404).json({ message: 'Pet not found' });
      }

      await petRepository.remove(pet);

      res.json({ message: 'Pet deleted successfully' });
    } catch (error) {
      console.log("error--------->", error)
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  // Add photo to pet
  static async addPetPhoto(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const petId = parseInt(req.params.id);
      const { photoPath } = req.body;

      // Validate pet ID
      if (isNaN(petId) || petId <= 0) {
        return res.status(400).json({ message: 'Invalid pet ID' });
      }

      if (!photoPath) {
        return res.status(400).json({ message: 'Photo path is required' });
      }

      const pet = await petRepository.findOne({
        where: { id: petId, ownerId: userId }
      });

      if (!pet) {
        return res.status(404).json({ message: 'Pet not found or you do not have permission' });
      }

      // Check if already has 3 photos
      if (pet.photos && pet.photos.length >= 3) {
        return res.status(400).json({
          message: 'Maximum 3 photos allowed per pet. Please delete a photo first.'
        });
      }

      // Add photo
      if (!pet.photos) {
        pet.photos = [];
      }
      pet.photos.push(photoPath);

      await petRepository.save(pet);

      res.json({
        message: 'Photo added successfully',
        pet
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  // Remove photo from pet
  static async removePetPhoto(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const petId = parseInt(req.params.id);
      const { photoPath } = req.body;

      // Validate pet ID
      if (isNaN(petId) || petId <= 0) {
        return res.status(400).json({ message: 'Invalid pet ID' });
      }

      if (!photoPath) {
        return res.status(400).json({ message: 'Photo path is required' });
      }

      const pet = await petRepository.findOne({
        where: { id: petId, ownerId: userId }
      });

      if (!pet) {
        return res.status(404).json({ message: 'Pet not found or you do not have permission' });
      }

      // Remove photo
      if (pet.photos) {
        pet.photos = pet.photos.filter(photo => photo !== photoPath);
        await petRepository.save(pet);
      }

      res.json({
        message: 'Photo removed successfully',
        pet
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }
}


