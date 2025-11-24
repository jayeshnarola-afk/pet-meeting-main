# 💬 Chat Module Testing Guide

## Prerequisites
1. Server running on `http://localhost:4000`
2. Two user accounts with valid JWT tokens
3. Postman or curl for API testing
4. Socket.IO client for real-time testing

---

## 📋 Step-by-Step Testing

### **Step 1: Get User Tokens (Login)**

You need at least 2 users to test chat. Get tokens for both users:

```bash
# User 1 Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "password": "password123"
  }'

# Save the token from response as USER1_TOKEN

# User 2 Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user2@example.com",
    "password": "password123"
  }'

# Save the token from response as USER2_TOKEN
```

---

### **Step 2: Create Conversation**

Create a conversation between User 1 and User 2:

```bash
# Replace YOUR_TOKEN with User 1's token
# Replace USER2_ID with User 2's actual user ID

curl -X POST http://localhost:4000/api/chat/create-conversation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "one-to-one",
    "partcipants": [
      {"user_id": USER2_ID}
    ]
  }'
```

**Expected Response:**
```json
{
  "status": 1,
  "message": "Conversation created successfully.",
  "data": {
    "id": 1,
    "type": "one-to-one",
    "created_at": "2024-11-03T...",
    "participant": {
      "id": 2,
      "fullName": "User 2",
      "email": "user2@example.com",
      ...
    },
    "last_message": null,
    "unread_count": 0
  }
}
```

**Save the `conversation_id` from response!**

---

### **Step 3: Get Conversations List**

Get all conversations for User 1:

```bash
curl -X GET "http://localhost:4000/api/chat/conversations?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "status": 1,
  "message": "Conversations Lists.",
  "data": {
    "conversations": [
      {
        "id": 1,
        "type": "one-to-one",
        "participant": {...},
        "last_message": null,
        "unread_count": 0
      }
    ],
    "pagination": {
      "total": 1,
      "currentPage": 1,
      "totalPages": 1
    }
  }
}
```

---

### **Step 4: Send Message via API**

Send a text message:

```bash
# Replace CONVERSATION_ID with actual conversation ID

curl -X POST http://localhost:4000/api/chat/message/send-message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": CONVERSATION_ID,
    "content": "Hello! This is my first message.",
    "message_type": "text"
  }'
```

**Expected Response:**
```json
{
  "status": 1,
  "message": "Message sent successfully.",
  "data": {
    "id": 1,
    "message_id": 1234567890,
    "conversation_id": 1,
    "content": "Hello! This is my first message.",
    "message_type": "text",
    "status": "sent",
    "created_at": "...",
    "sender": {...}
  }
}
```

---

### **Step 5: Get Messages**

Get all messages from a conversation:

```bash
curl -X GET "http://localhost:4000/api/chat/messages/CONVERSATION_ID?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "status": 1,
  "message": "Messages of chat",
  "data": {
    "messages": [
      {
        "id": 1,
        "content": "Hello! This is my first message.",
        "message_type": "text",
        "status": "sent",
        "sender": {...},
        "created_at": "..."
      }
    ],
    "pagination": {
      "total": 1,
      "currentPage": 1,
      "totalPages": 1
    }
  }
}
```

---

## 🔌 Socket.IO Testing

### **Option 1: Using Browser Console**

Open browser console and paste this code:

```javascript
// Replace with your actual token and user ID
const socket = io('http://localhost:4000', {
  transports: ['websocket', 'polling']
});

// Join personal room
socket.emit('join_self', { user_id: YOUR_USER_ID });

socket.on('join_self', (data) => {
  console.log('✅ Joined personal room:', data);
});

// Join conversation room
socket.emit('join_room', { 
  conversation_id: CONVERSATION_ID, 
  user_id: YOUR_USER_ID 
});

socket.on('room_joined', (data) => {
  console.log('✅ Joined conversation room:', data);
});

// Send message via Socket.IO
socket.emit('send_message', {
  conversation_id: CONVERSATION_ID,
  sender_id: YOUR_USER_ID,
  content: "Hello from Socket.IO!",
  message_type: "text"
}, (response) => {
  console.log('📨 Message sent:', response);
});

// Listen for new messages
socket.on('new_message_received', (data) => {
  console.log('📩 New message received:', data);
});

socket.on('receive_message', (data) => {
  console.log('📬 Message in room:', data);
});

// Mark as read
socket.emit('mark_as_read', {
  conversation_id: CONVERSATION_ID,
  user_id: YOUR_USER_ID,
  last_read_message_id: MESSAGE_ID
});

// Typing indicator
socket.emit('typing', {
  conversation_id: CONVERSATION_ID,
  sender_id: YOUR_USER_ID,
  is_typing: true
});

socket.on('typing_status', (data) => {
  console.log('⌨️ User is typing:', data);
});

// Error handling
socket.on('error_message', (data) => {
  console.error('❌ Error:', data);
});
```

### **Option 2: Using Node.js Test Script**

Create `test-socket.js`:

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:4000', {
  transports: ['websocket', 'polling']
});

const USER_ID = 1; // Replace with actual user ID
const CONVERSATION_ID = 1; // Replace with actual conversation ID

socket.on('connect', () => {
  console.log('✅ Connected to server');
  
  // Join personal room
  socket.emit('join_self', { user_id: USER_ID });
});

socket.on('join_self', (data) => {
  console.log('✅ Joined personal room:', data);
  
  // Join conversation room
  socket.emit('join_room', { 
    conversation_id: CONVERSATION_ID, 
    user_id: USER_ID 
  });
});

socket.on('room_joined', (data) => {
  console.log('✅ Joined conversation room:', data);
  
  // Send a test message
  setTimeout(() => {
    socket.emit('send_message', {
      conversation_id: CONVERSATION_ID,
      sender_id: USER_ID,
      content: "Test message from Socket.IO!",
      message_type: "text"
    }, (response) => {
      console.log('📨 Message sent:', response);
    });
  }, 2000);
});

socket.on('new_message_received', (data) => {
  console.log('📩 New message:', data);
});

socket.on('receive_message', (data) => {
  console.log('📬 Message in room:', data);
});

socket.on('error_message', (data) => {
  console.error('❌ Error:', data);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});
```

Run it:
```bash
npm install socket.io-client
node test-socket.js
```

---

## 🧪 Complete Test Flow

### **Test 1: Basic Chat Flow**
1. ✅ User 1 creates conversation with User 2
2. ✅ User 1 sends message via API
3. ✅ User 2 gets message via API
4. ✅ Both users see conversation in list

### **Test 2: Real-time Messaging**
1. ✅ User 1 connects via Socket.IO
2. ✅ User 2 connects via Socket.IO
3. ✅ User 1 sends message via Socket.IO
4. ✅ User 2 receives message in real-time
5. ✅ User 2 marks message as read
6. ✅ User 1 sees read receipt

### **Test 3: Typing Indicator**
1. ✅ User 1 starts typing
2. ✅ User 2 receives typing status
3. ✅ User 1 stops typing
4. ✅ User 2 receives updated status

### **Test 4: Search & Pagination**
1. ✅ Search conversations by user name
2. ✅ Paginate messages
3. ✅ Search messages by content

---

## 📝 Quick Test Commands

Save these in a script file:

```bash
#!/bin/bash

# Variables
BASE_URL="http://localhost:4000"
USER1_TOKEN="YOUR_USER1_TOKEN"
USER2_TOKEN="YOUR_USER2_TOKEN"
USER2_ID=2
CONVERSATION_ID=1

# Test 1: Create Conversation
echo "📝 Creating conversation..."
curl -X POST $BASE_URL/api/chat/create-conversation \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"type\": \"one-to-one\", \"partcipants\": [{\"user_id\": $USER2_ID}]}"

# Test 2: Get Conversations
echo "\n📋 Getting conversations..."
curl -X GET "$BASE_URL/api/chat/conversations?page=1&limit=20" \
  -H "Authorization: Bearer $USER1_TOKEN"

# Test 3: Send Message
echo "\n📨 Sending message..."
curl -X POST $BASE_URL/api/chat/message/send-message \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"conversation_id\": $CONVERSATION_ID, \"content\": \"Hello!\", \"message_type\": \"text\"}"

# Test 4: Get Messages
echo "\n💬 Getting messages..."
curl -X GET "$BASE_URL/api/chat/messages/$CONVERSATION_ID?page=1&limit=20" \
  -H "Authorization: Bearer $USER1_TOKEN"
```

---

## ✅ Expected Results

1. **Conversation Created**: Should return conversation with participant details
2. **Message Sent**: Should return message object with sender info
3. **Socket.IO**: Should connect and receive messages in real-time
4. **Read Receipts**: Should update message status to "read"
5. **Typing**: Should receive typing status updates

---

## 🐛 Common Issues

1. **401 Unauthorized**: Check if token is valid and properly formatted
2. **Conversation not found**: Verify conversation_id exists
3. **Socket not connecting**: Check if server is running and CORS is enabled
4. **Messages not received**: Verify both users are in the same conversation room

---

## 🎯 Next Steps

After basic testing works:
- Test file uploads (images/videos)
- Test location messages
- Test group conversations
- Test read receipts
- Test pagination with many messages

---

**Happy Testing! 🚀**

