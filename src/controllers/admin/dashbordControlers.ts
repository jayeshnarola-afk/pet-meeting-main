import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../../../config/database';
import { User } from '../../entities/User';
import { Pet } from '../../entities/Pet';
import { Match } from '../../entities/Match';

const userRepository = AppDataSource.getRepository(User);
const petRepository = AppDataSource.getRepository(Pet);
const matchRepository = AppDataSource.getRepository(Match);

export class dashbordController {

  // Get user profile with pets
  static async getCount(req: Request, res: Response) {
    try {
      // const userId = (req as any).user.id; // From auth middleware




      const totalPetsCount = await petRepository.count({
        where: { isBan: false }
      });
      const petBanCount = await petRepository.count({
        where: { isBan: true }
      });

      const userBanCount = await userRepository.count({
        where: { isBan: true }
      });

      const totaluserCount = await userRepository.count({
        where: { isBan: false }
      });







      return res.json({
        message: 'All count retrieved successfully',
        totalPets: totalPetsCount,
        totalBanPets: petBanCount,
        totalUser: totaluserCount,
        totalBanUsers: userBanCount,
        // totalPages: Math.ceil(totalUsers / limit)
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

}

