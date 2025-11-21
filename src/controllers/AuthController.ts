import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../../config/database';
import { User } from '../entities/User';
import { Pet } from '../entities/Pet';
import { EmailService } from '../services/EmailService';

const userRepository = AppDataSource.getRepository(User);
const petRepository = AppDataSource.getRepository(Pet);
const emailService = new EmailService();

interface MulterRequest extends Request {
  files?: {
    [fieldname: string]: Express.Multer.File[];
  } | Express.Multer.File[];
}

export class AuthController {
  // Signup method with FormData (file uploads) - USER ONLY
  static async signupWithFiles(req: Request, res: Response) {
    try {
      const { fullName, age, email, password, location, lat, lng, fcmToken, deviceType } = req.body;

      // Debug logging
      console.log('🔍 Signup request body:', req.body);
      console.log('📍 Location fields:', { lat, lng, fcmToken, deviceType });

      // Validate required fields
      if (!fullName || !age || !email || !password || !location) {
        return res.status(400).json({
          message: 'Missing required fields: fullName, age, email, password, location'
        });
      }

      // Check if user already exists
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Get uploaded profile photo
      let profilePhotoPath: string | undefined;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      if (files && files['profilePhoto']) {
        profilePhotoPath = `/uploads/profiles/${files['profilePhoto'][0].filename}`;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user (NO PETS in signup)
      const userData = {
        fullName,
        age: parseInt(age),
        email,
        password: hashedPassword,
        location,
        profilePhoto: profilePhotoPath,
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined,
        fcmToken: fcmToken || undefined,
        deviceType: deviceType || undefined,
      };

      console.log('👤 Creating user with data:', userData);
      const user = userRepository.create(userData);

      const savedUser = await userRepository.save(user);
      console.log('💾 Saved user data:', {
        id: savedUser.id,
        lat: savedUser.lat,
        lng: savedUser.lng,
        fcmToken: savedUser.fcmToken,
        deviceType: savedUser.deviceType
      });

      // Generate JWT token
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key');

      console.log(`✅ User registered successfully: ${email}`);

      res.status(201).json({
        message: 'User registered successfully. You can now add your pets!',
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          age: user.age,
          location: user.location,
          profilePhoto: user.profilePhoto ?
            (user.profilePhoto.startsWith('http') ? user.profilePhoto : `https://pet-meeting.onrender.com${user.profilePhoto}`) :
            null,
          lat: user.lat,
          lng: user.lng,
          fcmToken: user.fcmToken,
          deviceType: user.deviceType,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      console.error('❌ Signup with files error:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));

      // Handle different types of errors
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error, null, 2);
      }

      res.status(500).json({
        message: 'Server error',
        error: errorMessage
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password, fcmToken, deviceType } = req.body;

      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Update FCM token and device type if provided
      if (fcmToken) {
        user.fcmToken = fcmToken;
        console.log(`📱 Updating FCM token for user ${user.id}: ${fcmToken}`);
      }

      if (deviceType) {
        user.deviceType = deviceType;
        console.log(`📱 Updating device type for user ${user.id}: ${deviceType}`);
      }

      // Save updated user (FCM token and device type)
      if (fcmToken || deviceType) {
        await userRepository.save(user);
        console.log(`✅ Updated user ${user.id} with FCM token and device type`);
      }

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key');

      console.log('🔍 Login successful for user:', user.email);
      console.log('👤 User details:', {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        age: user.age,
        location: user.location,
        profilePhoto: user.profilePhoto,
        fcmToken: user.fcmToken,
        deviceType: user.deviceType
      });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          age: user.age,
          location: user.location,
          profilePhoto: user.profilePhoto ?
            (user.profilePhoto.startsWith('http') ? user.profilePhoto : `https://pet-meeting.onrender.com${user.profilePhoto}`) :
            null,
          lat: user.lat,
          lng: user.lng,
          fcmToken: user.fcmToken,
          deviceType: user.deviceType,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      console.error('❌ Login error:', error);
      res.status(500).json({
        message: 'Server error',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: 'User not found with this email' });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Save OTP to database
      user.otp = otp;
      user.otpExpires = otpExpires;
      await userRepository.save(user);

      // Send OTP email
      try {
        console.log(`✅ OTP generated for ${email}: ${otp}`); // For testing/debugging

        await emailService.sendOTP(email, otp);

        res.json({
          message: 'OTP sent successfully to your email',
          email: email,
          // For testing only - remove in production
          debug: process.env.NODE_ENV === 'development' ? { otp, expiresIn: '10 minutes' } : undefined
        });
      } catch (emailError) {
        
        console.error('❌ Email sending failed:', emailError);
        // OTP is still saved, so user can try resending
        res.status(500).json({
          message: 'OTP generated but email sending failed. Please try again.',
          error: process.env.NODE_ENV === 'development' ? emailError : undefined
        });
      }
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      res.status(500).json({
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, otp, newPassword } = req.body;

      // Validate input
      if (!email || !otp || !newPassword) {
        return res.status(400).json({
          message: 'Email, OTP, and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          message: 'Password must be at least 6 characters long'
        });
      }

      const user = await userRepository.findOne({ where: { email } });

      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }

      if (!user.otp || !user.otpExpires) {
        return res.status(400).json({
          message: 'No OTP found. Please request a new OTP.'
        });
      }

      if (user.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }

      if (user.otpExpires < new Date()) {
        return res.status(400).json({
          message: 'OTP has expired. Please request a new one.'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear OTP
      user.password = hashedPassword;
      user.otp = undefined as any;
      user.otpExpires = undefined as any;
      await userRepository.save(user);

      console.log(`✅ Password reset successful for ${email}`);

      res.json({
        message: 'Password reset successfully. You can now login with your new password.',
        success: true
      });
    } catch (error) {
      console.error('❌ Reset password error:', error);
      res.status(500).json({
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}