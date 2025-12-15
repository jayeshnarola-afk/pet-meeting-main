import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../../../config/database';
import { User } from '../../entities/User';
import { Pet } from '../../entities/Pet';
import { Match } from '../../entities/Match';
import { BASE_IMAGE_URL } from '../../../config/constants';

const userRepository = AppDataSource.getRepository(User);
const petRepository = AppDataSource.getRepository(Pet);
const matchRepository = AppDataSource.getRepository(Match);

export class UserController {

  // Get user profile with pets
  static async getProfile(req: Request, res: Response) {
    try {
      // const userId = (req as any).user.id; // From auth middleware
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const totalUsers = await userRepository.count();

      const users = await userRepository.find({
        // where: { id: userId },
        relations: ['pets', 'pets.type', 'pets.breed', 'pets.personalities'],
        select: ['id', 'fullName', 'age', 'email', 'location', 'profilePhoto', 'matchesNotification', 'messageNotification', 'isBan'], skip,
        take: limit,
      });
      // if (!users || users.length === 0) {
      //   return res.status(404).json({ message: 'No users found' });
      // }

      // Get match counts for all user's pets

      let finalUsers = [];

      for (const user of users) {

        const petIds = user.pets?.map(pet => pet.id) || [];
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

        // Convert photo paths to full URLs and add pet details
        const petsWithDetails = user.pets?.map(pet => ({
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
                : `${photo.url}`
            }))
            : [],
          totalMatches: matchCountMap.get(pet.id) || 0
        })) || [];


        let formattedProfilePhoto = null;

        if (user.profilePhoto && user.profilePhoto.url) {
          formattedProfilePhoto = {
            url: user.profilePhoto.url.startsWith('http')
              ? user.profilePhoto.url
              : `${BASE_IMAGE_URL}${user.profilePhoto.url}`,
            isBlocked: user.profilePhoto.isBlocked
          };
        }
        finalUsers.push({
          ...user,
          profilePhoto: formattedProfilePhoto,
          matchesNotification: user.matchesNotification === 1,
          messageNotification: user.messageNotification === 1,
          pets: petsWithDetails,
          petCount: petsWithDetails.length
        });
      }

      return res.json({
        message: 'All users retrieved successfully',
        users: finalUsers,
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  // Update user profile (JSON)
  static async banProfile(req: Request, res: Response) {
    try {
      // const userId = parseInt(req.params.id);
      const { isBan, userId } = req.body;

      if (typeof isBan !== "boolean") {
        return res.status(404).json({ message: 'require isBan' });
      }
      if (!userId) {
        return res.status(404).json({ message: 'require userId' });
      }
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update only provided fields
      user.isBan = isBan;

      await userRepository.save(user);
      res.json({
        message: 'Profile updated successfully',
      });
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Server error', error });
    }
  }

  // Update user profile with FormData (file uploads)
  static async updateProfileWithFiles(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { fullName, age, location, lat, lng } = req.body;

      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Store old profile photo path for deletion
      const oldProfilePhoto = user.profilePhoto;

      // Get uploaded profile photo
      let profilePhotoPath: string | undefined;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      if (files && files['profilePhoto']) {
        profilePhotoPath = `/uploads/profiles/${files['profilePhoto'][0].filename}`;
      }

      // Update only provided fields
      if (fullName !== undefined) user.fullName = fullName;
      if (age !== undefined) user.age = parseInt(age);
      if (location !== undefined) user.location = location;
      // if (profilePhotoPath !== undefined) user.profilePhoto = profilePhotoPath;
      if (profilePhotoPath !== undefined) {
        user.profilePhoto = {
          url: profilePhotoPath,
          isBlocked: false
        };
      }
      if (lat !== undefined) user.lat = lat ? parseFloat(lat) : null;
      if (lng !== undefined) user.lng = lng ? parseFloat(lng) : null;

      await userRepository.save(user);

      // Delete old profile photo if new one is uploaded
      // if (profilePhotoPath && oldProfilePhoto && oldProfilePhoto !== profilePhotoPath) {
      //   try {
      //     const fs = require('fs');
      //     const path = require('path');
      //     const oldPhotoPath = path.join(__dirname, '..', '..', oldProfilePhoto);
      //     if (fs.existsSync(oldPhotoPath)) {
      //       fs.unlinkSync(oldPhotoPath);
      //       console.log(`🗑️ Deleted old profile photo: ${oldProfilePhoto}`);
      //     }
      //   } catch (deleteError) {
      //     console.error('❌ Error deleting old profile photo:', deleteError);
      //   }
      if (profilePhotoPath && oldProfilePhoto && oldProfilePhoto.url !== profilePhotoPath) {
        try {
          const fs = require('fs');
          const path = require('path');
          const oldPhotoPath = path.join(__dirname, '..', '..', oldProfilePhoto);
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
            console.log(`🗑️ Deleted old profile photo: ${oldProfilePhoto}`);
          }
        } catch (deleteError) {
          console.error('❌ Error deleting old profile photo:', deleteError);
        }
      }

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          fullName: user.fullName,
          age: user.age,
          email: user.email,
          location: user.location,
          // profilePhoto: user.profilePhoto ?
          //   (user.profilePhoto.startsWith('http') ? user.profilePhoto : `https://pet-meeting.onrender.com${user.profilePhoto}`) :
          //   null,
          profilePhoto: user.profilePhoto
            ? (
              user.profilePhoto.url.startsWith('http')
                ? user.profilePhoto.url
                : `${BASE_IMAGE_URL}${user.profilePhoto.url}`
            )
            : null,
          lat: user.lat,
          lng: user.lng,
          fcmToken: user.fcmToken,
          deviceType: user.deviceType,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  // Change password
  static async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
      }

      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash and save new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await userRepository.save(user);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  // Delete account
  static async deleteAccount(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      if (!userId) {
        return res.status(400).json({ message: ' userId is required to delete account' });
      }

      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Delete user (pets will be cascade deleted if configured)
      await userRepository.remove(user);

      res.json({ message: 'user deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }


  static async blockOrUnblockProfilePhoto(req: Request, res: Response) {
    try {
      // const userId = Number(req.params.id);
      const { isBlocked, userId } = req.body; // true / false

      if (!userId) {
        return res.status(404).json({ error: "UserId is requre" });
      }
      const userRepo = AppDataSource.getRepository(User);


      const user = await userRepo.findOne({
        where: { id: userId }
      });

      console.log("user------>", user);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!user.profilePhoto) {
        return res.status(400).json({ error: "User does not have a profile photo" });
      }

      // Block / Unblock
      user.profilePhoto.isBlocked = isBlocked;

      await userRepo.save(user);

      return res.status(200).json({
        message: isBlocked ? "Profile photo blocked" : "Profile photo unblocked",
        profilePhoto: user.profilePhoto,
      });
    } catch (error) {
      return res.status(500).json({ message: "Server Error", error });
    }
  };








  // Toggle notification status
  static async toggleNotificationStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { notificationType, status } = req.body;

      // Validate notification type
      if (!notificationType || !['matches', 'message'].includes(notificationType)) {
        return res.status(400).json({
          message: 'Invalid notification type. Must be "matches" or "message"'
        });
      }

      // Validate status - accept various formats
      let notificationValue: number;
      if (status === true || status === 'true' || status === 'yes' || status === '1' || status === 1) {
        notificationValue = 1;
      } else if (status === false || status === 'false' || status === 'no' || status === '0' || status === 0) {
        notificationValue = 0;
      } else {
        return res.status(400).json({
          message: 'Invalid status. Must be true/yes/1 or false/no/0'
        });
      }

      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update the appropriate notification field
      if (notificationType === 'matches') {
        user.matchesNotification = notificationValue;
      } else if (notificationType === 'message') {
        user.messageNotification = notificationValue;
      }

      await userRepository.save(user);

      res.json({
        message: `${notificationType} notification ${notificationValue === 1 ? 'enabled' : 'disabled'} successfully`,
        notificationType,
        status: notificationValue,
        currentSettings: {
          matchesNotification: user.matchesNotification,
          messageNotification: user.messageNotification
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }
}

