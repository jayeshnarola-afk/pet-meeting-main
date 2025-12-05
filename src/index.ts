import 'reflect-metadata';
import express from 'express';
import path from 'path';
import http from 'http';
import fs from 'fs';
import { Server } from 'socket.io';
import { AppDataSource } from '../config/database';
import authRoutes from './routes/AuthRoutes';
import uploadRoutes from './routes/UploadRoutes';
import userRoutes from './routes/UserRoutes';
import petRoutes from './routes/PetRoutes';
import publicPetRoutes from './routes/PublicPetRoutes';
import publicRoutes from './routes/PublicRoutes';
import homeRoutes from './routes/HomeRoutes';
import petInteractionRoutes from './routes/PetInteractionRoutes';
import chatRoutes from './routes/ChatRoutes';
import notificationRoutes from './routes/NotificationRoutes';
// ---------------------- All Admin Router -------------------

import adminPetRoutes from './routes/admin/PetRoutes';
import adminUserRoutes from './routes/admin/UserRoutes';
import dashbordRoutes from './routes/admin/dashbordRoutes';



import { handleSocketEvents } from './socket/socket.io';
import cors from 'cors';
import { Admin } from 'typeorm';

const app = express();
const PORT = process.env.PORT || 4000;



// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with Render.com compatible settings
const io = new Server(server, {
  path: '/socket.io/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Handle Socket.IO events
handleSocketEvents(io);

// CORS
app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (uploaded images)
// Use process.cwd() for Render.com compatibility (works in both dev and production)
const uploadsPath = path.join(process.cwd(), 'uploads');
console.log(`📁 Serving static files from: ${uploadsPath}`);
console.log(`📁 Current working directory: ${process.cwd()}`);
console.log(`📁 __dirname: ${__dirname}`);

// Ensure uploads directory exists
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log(`✅ Created uploads directory: ${uploadsPath}`);
}

app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    // Set proper headers for images
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') ||
      filePath.endsWith('.png') || filePath.endsWith('.gif') ||
      filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/jpeg');
    }
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/user', userRoutes);
app.use('/api/home', homeRoutes);
app.use('/api', publicRoutes);
app.use('/api', publicPetRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/pet-interactions', petInteractionRoutes);
app.use('/api', chatRoutes);
app.use('/api/notifications', notificationRoutes);



// -------------------------------- All Admin Router----------------

app.use('/admin/api/user', adminUserRoutes)
app.use('/admin/api/pets', adminPetRoutes)
app.use('/admin/api/dashbord', dashbordRoutes)





app.get('/', (req, res) => {
  res.json({
    message: 'PetMeeter API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      upload: '/api/upload',
      user: '/api/user',
      pets: '/api/pets',
      petInteractions: '/api/pet-interactions',
      chat: '/api/chat',
      uploads: '/uploads'
    }
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working' });
});


AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Socket.IO is ready for connections`);
    });
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });