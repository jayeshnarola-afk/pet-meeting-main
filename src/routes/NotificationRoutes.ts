import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authMiddleware } from '../middleware/AuthMiddleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get notifications list (with pagination and filters)
// Query params: page, limit, isRead (true/false), type (like_sent, match_accepted, etc.)
router.get('/', NotificationController.getNotifications);

// Mark notification as read
router.put('/:id/read', NotificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', NotificationController.markAllAsRead);

// Delete notification
router.delete('/:id', NotificationController.deleteNotification);

export default router;

