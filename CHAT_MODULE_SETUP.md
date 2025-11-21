# 💬 Chat Module - Complete Setup

Chat module successfully integrated into PetMeeter project following your coding structure!

## ✅ Completed Implementation

### 1. **Entities** ✅
- `src/entities/conversation.entities.ts` - Conversation entity with enum type (one-to-one, group)
- `src/entities/conversation.participant.entities.ts` - Participant entity with read receipts
- `src/entities/message.entity.ts` - Message entity with all required fields
- `src/entities/message_meetings.entity.ts` - Dating message entity (already created)

### 2. **Models (Business Logic)** ✅
- `src/models/message.model.ts` - addMessage, getMessageDetails
- `src/models/conversation.model.ts` - addConversations, getChatConversations, findOneConversation, messagesOfChat, sendMediaMessage

### 3. **Controllers** ✅
- `src/controllers/ConversationController.ts` - All chat API endpoints

### 4. **Routes** ✅
- `src/routes/ChatRoutes.ts` - Chat routes with authentication

### 5. **Socket.IO** ✅
- `src/socket/socket.io.ts` - Complete Socket.IO event handlers
- Integrated into `src/index.ts` with HTTP server

### 6. **Helpers** ✅
- `src/helpers/apiResponse.ts` - API response helpers (successResponse, ErrorResponse, etc.)
- `src/helpers/responseDto.ts` - formatMessage, formatParticipant DTOs

### 7. **Migrations** ✅
- Updated `CreateConversationsTable1740137686345.ts` - Conversations table with enum
- Updated `CreateMessageTable1234567890.ts` - Message table with all fields
- `CreateConversationsParticipant1740137686346.ts` - Already exists
- `CreateMessageMeetingsTable1740137686347.ts` - Already exists

## 📡 API Endpoints

All endpoints are prefixed with `/api`:

1. **POST** `/api/chat/create-conversation` - Create new conversation
2. **GET** `/api/chat/conversations` - Get conversations list (with pagination & search)
3. **GET** `/api/chat/conversation/:conversation_id` - Get one conversation
4. **GET** `/api/chat/messages/:conversation_id` - Get messages (with pagination & search)
5. **POST** `/api/chat/message/send-message` - Send message (supports file uploads)

All endpoints require authentication via `Authorization: Bearer <token>` header.

## 🔌 Socket.IO Events

### Client Events (emit):
- `join_self` - Join personal room: `{ user_id: number }`
- `join_room` - Join conversation room: `{ conversation_id: number, user_id: number }`
- `send_message` - Send message: `{ conversation_id, sender_id, content, message_type, images, message_id, created_at }`
- `mark_as_read` - Mark messages as read: `{ conversation_id, user_id, last_read_message_id }`
- `typing` - Typing indicator: `{ conversation_id, sender_id, is_typing }`

### Server Events (listen):
- `join_self` - Confirmation of joining personal room
- `room_joined` - Confirmation of joining conversation room
- `receive_message` - New message received in conversation room
- `new_message_received` - New message received (personal notification)
- `messages_read` - Messages marked as read notification
- `typing_status` - Typing status update
- `error_message` - Error occurred
- `typing_error` - Typing error

## 📝 Usage Example

### Socket.IO Client (JavaScript/TypeScript):
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

// Join personal room
socket.emit('join_self', { user_id: 1 });

// Join conversation room
socket.emit('join_room', { conversation_id: 1, user_id: 1 });

// Send message
socket.emit('send_message', {
  conversation_id: 1,
  sender_id: 1,
  content: "Hello!",
  message_type: "text"
}, (response) => {
  console.log('Message sent:', response);
});

// Listen for new messages
socket.on('new_message_received', (data) => {
  console.log('New message:', data);
});

// Mark as read
socket.emit('mark_as_read', {
  conversation_id: 1,
  user_id: 1,
  last_read_message_id: 123
});
```

## 🗄️ Database Tables

1. **conversations** - Chat conversations
   - id, type (enum: one-to-one, group), created_at

2. **conversations_participant** - Participants & read receipts
   - id, conversation_id, user_id, role, last_read_message_id, last_cleared_message_id, is_notification_mute, is_unmatched_user

3. **message** - Messages
   - id, message_id (bigint), conversation_id, sender_id, content, message_type, status, images (json), media_url, is_location_active, schedule_time, meeting_status, is_deleted_by_admin, deleted_at

4. **message_meetings** - Dating/location messages (already exists)

## 🔧 Configuration

- Socket.IO is configured with CORS enabled
- Server runs on HTTP server (required for Socket.IO)
- All routes protected with `authMiddleware`
- File uploads supported via multer (max 5 files)

## 📦 Dependencies

All required dependencies are already in `package.json`:
- socket.io ✅
- typeorm ✅
- multer ✅
- express ✅
- cors ✅

## 🚀 Next Steps

1. Run migrations (if not using synchronize):
   ```bash
   npm run build
   # Run TypeORM migrations
   ```

2. Test the endpoints:
   ```bash
   # Start server
   npm run dev
   ```

3. Test Socket.IO connection from client

## 📝 Notes

- Authentication uses `req.user.id` (from JWT token)
- All callbacks follow your pattern (error-first callback)
- Response format matches your structure (status, message, data)
- Socket.IO is properly initialized and integrated
- All TypeScript types are properly defined

Chat module is ready to use! 🎉

