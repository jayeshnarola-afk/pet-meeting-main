import { AppDataSource } from '../config/database';
import { PetType } from './entities/PetType';
import { PetBreed } from './entities/PetBreed';
import { PetPersonality } from './entities/PetPersonality';

async function seedDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected for seeding');

    // Clear existing data using raw query to handle foreign key constraints
    await AppDataSource.query('TRUNCATE TABLE "pet_breed" CASCADE');
    await AppDataSource.query('TRUNCATE TABLE "pet_type" CASCADE');
    await AppDataSource.query('TRUNCATE TABLE "pet_personality" CASCADE');
    console.log('Cleared existing data');

    // Seed pet types
    const types = [
      { name: 'Dog', description: 'Canine pets' },
      { name: 'Cat', description: 'Feline pets' },
      { name: 'Bird', description: 'Avian pets' },
      { name: 'Fish', description: 'Aquatic pets' },
      { name: 'Rabbit', description: 'Lagomorph pets' }
    ];

    const savedTypes: PetType[] = [];
    for (const typeData of types) {
      const type = AppDataSource.getRepository(PetType).create(typeData);
      const savedType = await AppDataSource.getRepository(PetType).save(type);
      savedTypes.push(savedType);
      console.log(`Created type: ${savedType.name}`);
    }

    // Get type IDs
    const dogType = savedTypes.find(t => t.name === 'Dog')!;
    const catType = savedTypes.find(t => t.name === 'Cat')!;
    const birdType = savedTypes.find(t => t.name === 'Bird')!;
    const fishType = savedTypes.find(t => t.name === 'Fish')!;
    const rabbitType = savedTypes.find(t => t.name === 'Rabbit')!;

    // Seed breeds by type
    const breeds = [
      // Dog breeds
      { name: 'Labrador', typeId: dogType.id },
      { name: 'Golden Retriever', typeId: dogType.id },
      { name: 'German Shepherd', typeId: dogType.id },
      { name: 'Beagle', typeId: dogType.id },
      { name: 'Bulldog', typeId: dogType.id },
      { name: 'Pomeranian', typeId: dogType.id },

      // Cat breeds
      { name: 'Persian', typeId: catType.id },
      { name: 'Siamese', typeId: catType.id },
      { name: 'Maine Coon', typeId: catType.id },
      { name: 'British Shorthair', typeId: catType.id },
      { name: 'Ragdoll', typeId: catType.id },

      // Bird breeds
      { name: 'Parakeet', typeId: birdType.id },
      { name: 'Cockatiel', typeId: birdType.id },
      { name: 'Canary', typeId: birdType.id },
      { name: 'Lovebird', typeId: birdType.id },

      // Fish breeds
      { name: 'Goldfish', typeId: fishType.id },
      { name: 'Betta', typeId: fishType.id },
      { name: 'Guppy', typeId: fishType.id },
      { name: 'Tetra', typeId: fishType.id },

      // Rabbit breeds
      { name: 'Holland Lop', typeId: rabbitType.id },
      { name: 'Netherland Dwarf', typeId: rabbitType.id },
      { name: 'Lionhead', typeId: rabbitType.id },
      { name: 'Mini Rex', typeId: rabbitType.id }
    ];

    for (const breedData of breeds) {
      const breed = AppDataSource.getRepository(PetBreed).create(breedData);
      await AppDataSource.getRepository(PetBreed).save(breed);
      console.log(`Created breed: ${breed.name} (${savedTypes.find(t => t.id === breed.typeId)?.name})`);
    }

    // Seed personalities
    const personalities = [
      { name: 'Playful', description: 'Loves to play and have fun' },
      { name: 'Calm', description: 'Relaxed and peaceful' },
      { name: 'Energetic', description: 'Full of energy and activity' },
      { name: 'Friendly', description: 'Sociable and affectionate' },
      { name: 'Curious', description: 'Inquisitive and exploratory' },
      { name: 'Gentle', description: 'Mild and tender' },
      { name: 'Protective', description: 'Defensive and guarding' },
      { name: 'Independent', description: 'Self-reliant and autonomous' },
      { name: 'Lazy', description: 'Prefers relaxation over activity' },
      { name: 'Cute', description: 'Adorable and charming' }
    ];

    for (const personalityData of personalities) {
      const personality = AppDataSource.getRepository(PetPersonality).create(personalityData);
      await AppDataSource.getRepository(PetPersonality).save(personality);
      console.log(`Created personality: ${personality.name}`);
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

// Run the seeding
seedDatabase();