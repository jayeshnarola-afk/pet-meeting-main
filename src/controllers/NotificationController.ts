import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Notification } from '../entities/Notification';
import { Pet } from '../entities/Pet';

const notificationRepository = AppDataSource.getRepository(Notification);
const petRepository = AppDataSource.getRepository(Pet);

export class NotificationController {
  // Get user's notifications list
  static async getNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const isReadParam = req.query.isRead; // 'true', 'false', or undefined for all
      const type = req.query.type as string | undefined; // Filter by notification type

      const skip = (page - 1) * limit;

      // Build where clause
      const whereClause: any = {
        userId: userId
      };

      // Filter by read status
      if (isReadParam !== undefined) {
        const isReadValue = String(isReadParam).toLowerCase();
        whereClause.isRead = isReadValue === 'true' || isReadValue === '1';
      }

      // Filter by type
      if (type) {
        whereClause.type = type;
      }

      // Get notifications with pagination
      const [notifications, total] = await notificationRepository.findAndCount({
        where: whereClause,
        relations: ['relatedPet', 'relatedPet.owner'], // Include pet owner (user) info
        order: {
          createdAt: 'DESC'
        },
        skip,
        take: limit
      });

      // Format notifications with related pet and user info
      const formattedNotifications = notifications.map(notification => {
        let relatedPetInfo = null;
        let relatedUserInfo = null;

        if (notification.relatedPet) {
          // Handle photos - TypeORM simple-array can be string or array
          let petPhotos: string[] = [];
          const photos: any = notification.relatedPet.photos;
          if (photos) {
            if (Array.isArray(photos)) {
              petPhotos = photos;
            } else if (typeof photos === 'string') {
              // Parse comma-separated string (TypeORM simple-array format)
              petPhotos = photos.split(',').map((p: string) => p.trim()).filter((p: string) => p.length > 0);
            }
          }

          relatedPetInfo = {
            id: notification.relatedPet.id,
            name: notification.relatedPet.name,
            photos: petPhotos.map((photo: string) =>
              photo.startsWith('http') ? photo : `https://pet-meeting.onrender.com${photo}`
            )
          };

          // Get user info from pet owner (for like_sent, match_accepted, match_rejected notifications)
          if (notification.relatedPet.owner) {
            relatedUserInfo = {
              id: notification.relatedPet.owner.id,
              fullName: notification.relatedPet.owner.fullName,
              profilePhoto: notification.relatedPet.owner.profilePhoto ? (
                notification.relatedPet.owner.profilePhoto.startsWith('http') 
                  ? notification.relatedPet.owner.profilePhoto 
                  : `https://pet-meeting.onrender.com${notification.relatedPet.owner.profilePhoto}`
              ) : null
            };
          }
        }

        return {
          id: notification.id,
          type: notification.type,
          message: notification.message,
          isRead: notification.isRead,
          relatedPetId: notification.relatedPetId,
          relatedPet: relatedPetInfo,
          relatedUser: relatedUserInfo, // User who sent the like/accept/reject
          interactionId: notification.interactionId, // Include interactionId for accept/reject
          createdAt: notification.createdAt
        };
      });

      // Get unread count
      const unreadCount = await notificationRepository.count({
        where: {
          userId: userId,
          isRead: false
        }
      });

      res.json({
        message: 'Notifications retrieved successfully',
        notifications: formattedNotifications,
        pagination: {
          currentPage: page,
          limit: limit,
          total: total,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + limit < total
        },
        unreadCount: unreadCount
      });
    } catch (error) {
      console.error('❌ Get notifications error:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }

  // Mark notification as read
  static async markAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const notificationId = parseInt(req.params.id);

      if (!notificationId) {
        return res.status(400).json({ message: 'Notification ID is required' });
      }

      // Find notification
      const notification = await notificationRepository.findOne({
        where: { id: notificationId, userId: userId }
      });

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      // Update as read
      notification.isRead = true;
      await notificationRepository.save(notification);

      res.json({
        message: 'Notification marked as read',
        notification: {
          id: notification.id,
          type: notification.type,
          message: notification.message,
          isRead: notification.isRead,
          createdAt: notification.createdAt
        }
      });
    } catch (error) {
      console.error('❌ Mark notification as read error:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      // Update all unread notifications
      await notificationRepository.update(
        {
          userId: userId,
          isRead: false
        },
        {
          isRead: true
        }
      );

      res.json({
        message: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('❌ Mark all notifications as read error:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }

  // Delete notification
  static async deleteNotification(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const notificationId = parseInt(req.params.id);

      if (!notificationId) {
        return res.status(400).json({ message: 'Notification ID is required' });
      }

      // Find and delete notification
      const notification = await notificationRepository.findOne({
        where: { id: notificationId, userId: userId }
      });

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      await notificationRepository.remove(notification);

      res.json({
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      console.error('❌ Delete notification error:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }
}

