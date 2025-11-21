import express from 'express';
import { authMiddleware } from '../middleware/AuthMiddleware';
import { createConversation, getConversations, getOneConversation, getMessagesOfChatId, sendMediaMessageApi } from '../controllers/ConversationController';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Helper function to ensure directory exists
const ensureDirectory = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
};

// Multer configuration for chat file uploads (images, videos, files)
const chatStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use absolute path for Render.com compatibility
    const uploadDir = path.join(process.cwd(), 'uploads', 'chat');
    // Ensure base uploads directory exists
    ensureDirectory(path.join(process.cwd(), 'uploads'));
    // Ensure chat directory exists
    ensureDirectory(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for chat (allow images, videos, and common file types)
const chatFileFilter = (req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    // Videos
    'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo',
    // Documents
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, and PDF/DOC files are allowed.'));
  }
};

const upload = multer({
  storage: chatStorage,
  fileFilter: chatFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  }
});

// Chat routes
router.post("/chat/create-conversation", authMiddleware, createConversation);
router.get("/chat/conversations", authMiddleware, getConversations);
router.get("/chat/conversation/:conversation_id", authMiddleware, getOneConversation);
router.get("/chat/messages/:conversation_id", authMiddleware, getMessagesOfChatId);
router.post("/chat/message/send-message", authMiddleware, upload.array("files", 5), sendMediaMessageApi);

export default router;

