import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import { AppDataSource } from '../../config/database';
import { User } from '../entities/User';

class PushNotificationService {
  private messaging: admin.messaging.Messaging | null = null;

  constructor() {
    try {
      // Initialize Firebase Admin if not already initialized
      if (!admin.apps.length) {
        let serviceAccountPath: string | null = null;

        // Priority 1: Check environment variable for JSON string
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
          try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
              credential: admin.credential.cert(serviceAccount)
            });
            console.log('✅ Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT env variable');
          } catch (parseError) {
            console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT:', parseError);
          }
        }
        // Priority 2: Check environment variable for file path
        else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
          serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        }
        // Priority 3: Check config folder for service account file
        else {
          // Try multiple possible paths for config folder
          const possibleConfigDirs = [
            path.join(__dirname, '../../config'), // From dist/src/services
            path.join(process.cwd(), 'config'), // From project root
            path.join(process.cwd(), 'dist/config'), // From dist/config
          ];
          
          for (const configDir of possibleConfigDirs) {
            if (fs.existsSync(configDir)) {
              const files = fs.readdirSync(configDir);
              const serviceAccountFile = files.find((file: string) => 
                file.endsWith('.json') && file.includes('firebase-adminsdk')
              );
              
              if (serviceAccountFile) {
                serviceAccountPath = path.join(configDir, serviceAccountFile);
                console.log(`📁 Found Firebase service account file: ${serviceAccountFile} in ${configDir}`);
                break;
              }
            }
          }
        }

        // If we found a file path, load and initialize
        if (!admin.apps.length && serviceAccountPath) {
          if (fs.existsSync(serviceAccountPath)) {
            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
            admin.initializeApp({
              credential: admin.credential.cert(serviceAccount)
            });
            console.log(`✅ Firebase Admin initialized from file: ${serviceAccountPath}`);
          } else {
            console.warn(`⚠️ Firebase service account file not found: ${serviceAccountPath}`);
          }
        }

        // If still not initialized, show warning
        if (!admin.apps.length) {
          console.warn('⚠️ Firebase Admin not initialized. Push notifications will be disabled.');
          console.warn('Options:');
          console.warn('  1. Set FIREBASE_SERVICE_ACCOUNT environment variable with JSON string');
          console.warn('  2. Set GOOGLE_APPLICATION_CREDENTIALS environment variable with file path');
          console.warn('  3. Place firebase-adminsdk-*.json file in config/ folder');
        }
      }

      if (admin.apps.length > 0) {
        this.messaging = admin.messaging();
        console.log('✅ Firebase Admin initialized successfully');
      }
    } catch (error) {
      console.error('❌ Error initializing Firebase Admin:', error);
      this.messaging = null;
    }
  }

  /**
   * Send push notification to a user
   * @param notificationType - 'match' for match-related notifications, 'message' for message notifications
   */
  async sendPushNotification(
    userId: number,
    title: string,
    body: string,
    data?: { [key: string]: string },
    notificationType: 'match' | 'message' = 'match'
  ): Promise<boolean> {
    try {
      if (!this.messaging) {
        console.warn('⚠️ Push notification service not available');
        return false;
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: userId }
      });

      if (!user || !user.fcmToken) {
        console.log(`ℹ️ User ${userId} has no FCM token registered`);
        return false;
      }

      // Check if user has notifications enabled for this specific type
      if (notificationType === 'match' && user.matchesNotification !== 1) {
        console.log(`ℹ️ User ${userId} has match notifications disabled`);
        return false;
      }

      if (notificationType === 'message' && user.messageNotification !== 1) {
        console.log(`ℹ️ User ${userId} has message notifications disabled`);
        return false;
      }

      const message: admin.messaging.Message = {
        notification: {
          title,
          body
        },
        data: data || {},
        token: user.fcmToken,
        android: {
          priority: 'high' as const,
          notification: {
            sound: 'default',
            priority: 'high' as const
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await this.messaging.send(message);
      console.log(`✅ Push notification sent successfully to user ${userId}:`, response);
      return true;
    } catch (error: any) {
      if (error.code === 'messaging/invalid-registration-token' || 
          error.code === 'messaging/registration-token-not-registered') {
        console.log(`⚠️ Invalid FCM token for user ${userId}. Token may have been unregistered.`);
        // Optionally: Clear the invalid token from database
        try {
          const userRepository = AppDataSource.getRepository(User);
          await userRepository.update(userId, { fcmToken: undefined as any });
        } catch (updateError) {
          console.error('Error clearing invalid FCM token:', updateError);
        }
      } else {
        console.error(`❌ Error sending push notification to user ${userId}:`, error);
      }
      return false;
    }
  }

  /**
   * Send push notification to multiple users
   */
  async sendPushNotificationToMultiple(
    userIds: number[],
    title: string,
    body: string,
    data?: { [key: string]: string },
    notificationType: 'match' | 'message' = 'match'
  ): Promise<number> {
    let successCount = 0;
    
    for (const userId of userIds) {
      const success = await this.sendPushNotification(userId, title, body, data, notificationType);
      if (success) {
        successCount++;
      }
    }

    return successCount;
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

