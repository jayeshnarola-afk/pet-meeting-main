// src/controllers/PetInteractionController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { PetInteraction } from '../entities/PetInteraction';
import { Match } from '../entities/Match';
import { Pet } from '../entities/Pet';
import { Notification } from '../entities/Notification';
import { User } from '../entities/User';
import { Not, In } from 'typeorm';
import { addConversations } from '../models/conversation.model';
import { pushNotificationService } from '../services/PushNotificationService';

const petInteractionRepository = AppDataSource.getRepository(PetInteraction);
const matchRepository = AppDataSource.getRepository(Match);
const petRepository = AppDataSource.getRepository(Pet);
const notificationRepository = AppDataSource.getRepository(Notification);
const userRepository = AppDataSource.getRepository(User);

export class PetInteractionController {
  // Like a pet
  static async likePet(req: Request, res: Response) {
    try {
      const currentUserId = (req as any).user.id;
      const { petId } = req.params;
      let { likerPetId } = req.body;

      const likedPetId = parseInt(petId);

      // If likerPetId is not provided, get the user's first enabled pet
      if (!likerPetId) {
        const userEnabledPet = await petRepository.findOne({
          where: { ownerId: currentUserId, isEnabled: true }
        });

        if (!userEnabledPet) {
          return res.status(400).json({ message: 'No enabled pet found. Please enable a pet first.' });
        }

        likerPetId = userEnabledPet.id;
      }

      const likerPetIdNum = parseInt(likerPetId);

      // Check if user owns the liker pet
      const likerPet = await petRepository.findOne({
        where: { id: likerPetIdNum, ownerId: currentUserId }
      });

      if (!likerPet) {
        return res.status(404).json({ message: 'Liker pet not found or not owned by you' });
      }

      // Check if liked pet exists and is not owned by current user
      const likedPet = await petRepository.findOne({
        where: { id: likedPetId, isEnabled: true },
        relations: ['owner']
      });

      if (!likedPet) {
        return res.status(404).json({ message: 'Pet not found' });
      }

      if (likedPet.ownerId === currentUserId) {
        return res.status(400).json({ message: 'Cannot like your own pet' });
      }

      // Check if already interacted
      const existingInteraction = await petInteractionRepository.findOne({
        where: { likerPetId: likerPetIdNum, likedPetId }
      });

      if (existingInteraction) {
        return res.status(400).json({ message: 'This pet has already received your interaction' });
      }

      // Create interaction
      const interaction = petInteractionRepository.create({
        likerPetId: likerPetIdNum,
        likedPetId,
        action: 'like',
        likerUserId: currentUserId,
        likedUserId: likedPet.ownerId
      });

      await petInteractionRepository.save(interaction);

      // Get the liked pet's owner and the liker's user info
      const likedUser = await userRepository.findOne({
        where: { id: likedPet.ownerId },
        relations: ['pets']
      });

      const likerUser = await userRepository.findOne({
        where: { id: currentUserId }
      });

      if (!likerUser) {
        return res.status(404).json({ message: 'Liker user not found' });
      }

      // Check if it's a mutual like (match)
      const mutualLike = await petInteractionRepository.findOne({
        where: {
          likerPetId: likedPetId,
          likedPetId: likerPetIdNum,
          action: 'like'
        }
      });

      let isMatch = false;
      let matchId = null;
      let conversationResult = null;

      if (mutualLike) {
        // Check if match already exists
        const existingMatch = await matchRepository.findOne({
          where: [
            { pet1Id: likerPetIdNum, pet2Id: likedPetId },
            { pet1Id: likedPetId, pet2Id: likerPetIdNum }
          ]
        });

        if (!existingMatch) {
          // Create match
          const match = matchRepository.create({
            pet1Id: likerPetIdNum,
            pet2Id: likedPetId,
            user1Id: currentUserId,
            user2Id: likedPet.ownerId
          });

          const savedMatch = await matchRepository.save(match);
          isMatch = true;
          matchId = savedMatch.id;

          // Automatically create a conversation when there's a mutual match
          try {
            await new Promise<void>((resolve, reject) => {
              addConversations(
                {
                  type: 'one-to-one',
                  participants: [
                    { user_id: currentUserId },
                    { user_id: likedPet.ownerId }
                  ]
                },
                currentUserId,
                (error: any, result: any) => {
                  if (error) {
                    console.error('Error creating conversation for match:', error);
                    resolve();
                  } else {
                    console.log('Conversation created successfully for match:', result);
                    conversationResult = result;
                    resolve();
                  }
                }
              );
            });
          } catch (conversationError) {
            console.error('Exception while creating conversation for match:', conversationError);
          }

          // Create match notification for the current user (liker)
          const matchNotificationForLiker = notificationRepository.create({
            userId: currentUserId,
            type: 'match_accepted',
            message: `You have a new match with ${likedUser?.fullName || 'a user'}!`,
            relatedPetId: likedPetId,
            interactionId: interaction.id // Save interactionId for reference
          });
          await notificationRepository.save(matchNotificationForLiker);

          // Create match notification for the liked pet's owner
          const matchNotificationForLiked = notificationRepository.create({
            userId: likedPet.ownerId,
            type: 'match_accepted',
            message: `You have a new match with ${likerUser.fullName}!`,
            relatedPetId: likerPetIdNum,
            interactionId: mutualLike.id // Save interactionId for reference
          });
          await notificationRepository.save(matchNotificationForLiked);

          // Send push notification to both users about the match
          if (likerUser && likerUser.matchesNotification === 1 && likerUser.fcmToken) {
            await pushNotificationService.sendPushNotification(
              currentUserId,
              'It\'s a Match! 🎉',
              `You have a new match with ${likedUser?.fullName || 'a user'}!`,
              {
                type: 'match_accepted',
                matchId: savedMatch.id.toString(),
                interactionId: interaction.id.toString()
              }
            );
          }

          if (likedUser && likedUser.matchesNotification === 1 && likedUser.fcmToken) {
            await pushNotificationService.sendPushNotification(
              likedPet.ownerId,
              'It\'s a Match! 🎉',
              `You have a new match with ${likerUser.fullName}!`,
              {
                type: 'match_accepted',
                matchId: savedMatch.id.toString(),
                interactionId: mutualLike.id.toString()
              }
            );
          }

          res.json({
            message: 'It\'s a match! 🎉',
            isMatch: true,
            matchId: savedMatch.id,
            match: {
              id: savedMatch.id,
              pet1Id: savedMatch.pet1Id,
              pet2Id: savedMatch.pet2Id,
              user1Id: savedMatch.user1Id,
              user2Id: savedMatch.user2Id,
              createdAt: savedMatch.createdAt
            },
            conversation: conversationResult,
            interaction: {
              id: interaction.id,
              action: interaction.action,
              createdAt: interaction.createdAt
            }
          });

          return; // Return early if it's a match
        } else {
          isMatch = true;
          matchId = existingMatch.id;
        }
      }

      // If not a match, send like notification
      const notificationMessage = `Your pet was liked by ${likerUser.fullName}'s pet.`;
      const notification = notificationRepository.create({
        userId: likedPet.ownerId,
        type: 'like_sent',
        message: notificationMessage,
        relatedPetId: likerPetIdNum,
        interactionId: interaction.id // Save interactionId for accept/reject
      });

      await notificationRepository.save(notification);

      // Send push notification to the liked pet's owner
      if (likedUser && likedUser.matchesNotification === 1 && likedUser.fcmToken) {
        await pushNotificationService.sendPushNotification(
          likedPet.ownerId,
          'New Like Received',
          notificationMessage,
          {
            type: 'like_sent',
            interactionId: interaction.id.toString(),
            likerPetId: likerPetIdNum.toString(),
            likedPetId: likedPetId.toString(),
            notificationId: notification.id.toString()
          }
        );
      }

      res.json({
        message: 'Pet liked successfully. Notification sent to pet owner.',
        isMatch: false,
        matchId: null,
        interaction: {
          id: interaction.id,
          action: interaction.action,
          createdAt: interaction.createdAt
        }
      });

    } catch (error) {
      console.error('❌ Like pet error:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }

  // Pass a pet
  static async passPet(req: Request, res: Response) {
    try {
      const currentUserId = (req as any).user.id;
      const { petId } = req.params;
      let { likerPetId } = req.body;

      const likedPetId = parseInt(petId);

      // If likerPetId is not provided, get the user's first enabled pet
      if (!likerPetId) {
        const userEnabledPet = await petRepository.findOne({
          where: { ownerId: currentUserId, isEnabled: true }
        });

        if (!userEnabledPet) {
          return res.status(400).json({ message: 'No enabled pet found. Please enable a pet first.' });
        }

        likerPetId = userEnabledPet.id;
      }

      const likerPetIdNum = parseInt(likerPetId);

      // Check if user owns the liker pet
      const likerPet = await petRepository.findOne({
        where: { id: likerPetIdNum, ownerId: currentUserId }
      });

      if (!likerPet) {
        return res.status(404).json({ message: 'Liker pet not found or not owned by you' });
      }

      // Check if liked pet exists and is not owned by current user
      const likedPet = await petRepository.findOne({
        where: { id: likedPetId, isEnabled: true },
        relations: ['owner']
      });

      if (!likedPet) {
        return res.status(404).json({ message: 'Pet not found' });
      }

      if (likedPet.ownerId === currentUserId) {
        return res.status(400).json({ message: 'Cannot pass your own pet' });
      }

      // Check if already interacted
      const existingInteraction = await petInteractionRepository.findOne({
        where: { likerPetId: likerPetIdNum, likedPetId }
      });

      if (existingInteraction) {
        return res.status(400).json({ message: 'This pet has already received your interaction' });
      }

      // Create interaction
      const interaction = petInteractionRepository.create({
        likerPetId: likerPetIdNum,
        likedPetId,
        action: 'pass',
        likerUserId: currentUserId,
        likedUserId: likedPet.ownerId
      });

      await petInteractionRepository.save(interaction);

      res.json({
        message: 'Pet passed successfully',
        interaction: {
          id: interaction.id,
          action: interaction.action,
          createdAt: interaction.createdAt
        }
      });

    } catch (error) {
      console.error('❌ Pass pet error:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }

  // Get user's matches
  static async getMatches(req: Request, res: Response) {
    try {
      const currentUserId = (req as any).user.id;

      const matches = await matchRepository.find({
        where: [
          { user1Id: currentUserId, isActive: true },
          { user2Id: currentUserId, isActive: true }
        ],
        relations: ['pet1', 'pet2', 'user1', 'user2'],
        order: { createdAt: 'DESC' }
      });

      const matchesWithDetails = matches.map(match => {
        const isUser1 = match.user1Id === currentUserId;
        const otherPet = isUser1 ? match.pet2 : match.pet1;
        const otherUser = isUser1 ? match.user2 : match.user1;

        return {
          id: match.id,
          otherPet: {
            id: otherPet.id,
            name: otherPet.name,
            age: otherPet.age,
            gender: otherPet.gender,
            // photos: otherPet.photos ? otherPet.photos.map(photo =>
            //   photo.startsWith('http') ? photo : `https://pet-meeting.onrender.com${photo}`
            // ) : []
            photos: otherPet.photos
              ? otherPet.photos.map(p =>
                p.url.startsWith('http')
                  ? p.url
                  : `https://pet-meeting.onrender.com${p.url}`
              )
              : []
          },
          otherUser: {
            id: otherUser.id,
            fullName: otherUser.fullName,
            location: otherUser.location,
            // profilePhoto: otherUser.profilePhoto ? (
            //   otherUser.profilePhoto.startsWith('http') ? otherUser.profilePhoto : `https://pet-meeting.onrender.com${otherUser.profilePhoto}`
            // ) : null
            profilePhoto: otherUser.profilePhoto
              ? (
                otherUser.profilePhoto.url.startsWith('http')
                  ? otherUser.profilePhoto.url
                  : `https://pet-meeting.onrender.com${otherUser.profilePhoto.url}`
              )
              : null
          },
          createdAt: match.createdAt
        };
      });

      res.json({
        message: 'Matches retrieved successfully',
        matches: matchesWithDetails,
        count: matchesWithDetails.length
      });

    } catch (error) {
      console.error('❌ Get matches error:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }

  // Get pets that user hasn't interacted with (for home feed)
  static async getUnseenPets(req: Request, res: Response) {
    try {
      const currentUserId = (req as any).user.id;
      const { page = '1', limit = '10' } = req.query;

      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 10));
      const offset = (pageNum - 1) * limitNum;

      // Get all pets that current user's pets have interacted with
      const interactedPetIds = await petInteractionRepository
        .createQueryBuilder('interaction')
        .select('interaction.likedPetId')
        .where('interaction.likerUserId = :userId', { userId: currentUserId })
        .getRawMany();

      const interactedIds = interactedPetIds.map(item => item.likedPetId);

      // Get pets excluding current user's pets and already interacted pets
      const pets = await petRepository.find({
        where: {
          ownerId: Not(currentUserId),
          isEnabled: true,
          id: interactedIds.length > 0 ? Not(In(interactedIds)) : undefined
        },
        relations: ['type', 'breed', 'personalities', 'owner'],
        order: { createdAt: 'DESC' },
        skip: offset,
        take: limitNum
      });

      // Convert to response format
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
        // ownerProfilePhoto: pet.owner?.profilePhoto ? (
        //   pet.owner.profilePhoto.startsWith('http') ? pet.owner.profilePhoto : `https://pet-meeting.onrender.com${pet.owner.profilePhoto}`
        // ) : null
        ownerProfilePhoto: pet.owner?.profilePhoto
          ? (
            pet.owner.profilePhoto.url.startsWith('http')
              ? pet.owner.profilePhoto.url
              : `https://pet-meeting.onrender.com${pet.owner.profilePhoto.url}`
          )
          : null,
      }));

      res.json({
        message: 'Unseen pets retrieved successfully',
        pets: petsWithDetails,
        pagination: {
          currentPage: pageNum,
          limit: limitNum,
          hasMore: pets.length === limitNum
        }
      });

    } catch (error) {
      console.error('❌ Get unseen pets error:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }

  // Accept a like request (creates match and conversation)
  static async acceptLike(req: Request, res: Response) {
    try {
      const currentUserId = (req as any).user.id;
      const { interactionId } = req.body;

      if (!interactionId) {
        return res.status(400).json({ message: 'interactionId is required' });
      }

      // Find the interaction
      const interaction = await petInteractionRepository.findOne({
        where: { id: interactionId, action: 'like' },
        relations: ['likerPet', 'likedPet']
      });

      if (!interaction) {
        return res.status(404).json({ message: 'Like interaction not found' });
      }

      // Check if the current user owns the liked pet
      if (interaction.likedUserId !== currentUserId) {
        return res.status(403).json({ message: 'You can only accept likes for your own pets' });
      }

      // Check if match already exists
      const existingMatch = await matchRepository.findOne({
        where: [
          { pet1Id: interaction.likerPetId, pet2Id: interaction.likedPetId },
          { pet1Id: interaction.likedPetId, pet2Id: interaction.likerPetId }
        ]
      });

      if (existingMatch) {
        return res.status(400).json({ message: 'Match already exists' });
      }

      // Create match
      const match = matchRepository.create({
        pet1Id: interaction.likerPetId,
        pet2Id: interaction.likedPetId,
        user1Id: interaction.likerUserId,
        user2Id: interaction.likedUserId
      });

      const savedMatch = await matchRepository.save(match);

      // Automatically create a conversation when match is accepted
      let conversationResult = null;
      try {
        await new Promise<void>((resolve, reject) => {
          addConversations(
            {
              type: 'one-to-one',
              participants: [
                { user_id: interaction.likerUserId },
                { user_id: interaction.likedUserId }
              ]
            },
            interaction.likedUserId,
            (error: any, result: any) => {
              if (error) {
                console.error('Error creating conversation for match:', error);
                resolve();
              } else {
                console.log('Conversation created successfully for match:', result);
                conversationResult = result;
                resolve();
              }
            }
          );
        });
      } catch (conversationError) {
        console.error('Exception while creating conversation for match:', conversationError);
      }

      // Get user info for notification
      const likedUser = await userRepository.findOne({
        where: { id: interaction.likedUserId }
      });

      const likerUser = await userRepository.findOne({
        where: { id: interaction.likerUserId }
      });

      if (!likedUser || !likerUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Create notification for the liker (match_accepted)
      const notificationMessage = `Your like request was accepted by ${likedUser.fullName}.`;
      const notification = notificationRepository.create({
        userId: interaction.likerUserId,
        type: 'match_accepted',
        message: notificationMessage,
        relatedPetId: interaction.likedPetId,
        interactionId: interaction.id // Save interactionId for reference
      });

      await notificationRepository.save(notification);

      // Send push notification to the liker
      if (likerUser && likerUser.matchesNotification === 1 && likerUser.fcmToken) {
        await pushNotificationService.sendPushNotification(
          interaction.likerUserId,
          'Match Accepted! 🎉',
          notificationMessage,
          {
            type: 'match_accepted',
            matchId: savedMatch.id.toString(),
            interactionId: interaction.id.toString()
          }
        );
      }

      res.json({
        message: 'Like request accepted. Match created successfully.',
        match: {
          id: savedMatch.id,
          pet1Id: savedMatch.pet1Id,
          pet2Id: savedMatch.pet2Id,
          user1Id: savedMatch.user1Id,
          user2Id: savedMatch.user2Id,
          createdAt: savedMatch.createdAt
        },
        conversation: conversationResult
      });

    } catch (error) {
      console.error('❌ Accept like error:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }

  // Reject a like request
  static async rejectLike(req: Request, res: Response) {
    try {
      const currentUserId = (req as any).user.id;
      const { interactionId } = req.body;

      if (!interactionId) {
        return res.status(400).json({ message: 'interactionId is required' });
      }

      // Find the interaction
      const interaction = await petInteractionRepository.findOne({
        where: { id: interactionId, action: 'like' }
      });

      if (!interaction) {
        return res.status(404).json({ message: 'Like interaction not found' });
      }

      // Check if the current user owns the liked pet
      if (interaction.likedUserId !== currentUserId) {
        return res.status(403).json({ message: 'You can only reject likes for your own pets' });
      }

      // Get user info for notification
      const likedUser = await userRepository.findOne({
        where: { id: interaction.likedUserId }
      });

      const likerUser = await userRepository.findOne({
        where: { id: interaction.likerUserId }
      });

      if (!likedUser || !likerUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Create notification for the liker (match_rejected)
      const notificationMessage = `Your like request was rejected.`;
      const notification = notificationRepository.create({
        userId: interaction.likerUserId,
        type: 'match_rejected',
        message: notificationMessage,
        relatedPetId: interaction.likedPetId,
        interactionId: interaction.id // Save interactionId for reference
      });

      await notificationRepository.save(notification);

      // Send push notification to the liker
      if (likerUser && likerUser.matchesNotification === 1 && likerUser.fcmToken) {
        await pushNotificationService.sendPushNotification(
          interaction.likerUserId,
          'Like Request Rejected',
          notificationMessage,
          {
            type: 'match_rejected',
            interactionId: interaction.id.toString()
          }
        );
      }

      res.json({
        message: 'Like request rejected successfully',
        notification: {
          id: notification.id,
          type: notification.type,
          message: notification.message,
          createdAt: notification.createdAt
        }
      });

    } catch (error) {
      console.error('❌ Reject like error:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }
}