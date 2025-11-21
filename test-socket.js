const io = require('socket.io-client');

const socket = io('http://localhost:4000', {
  transports: ['websocket', 'polling']
});

const USER_ID = 43; // Test User 1
const CONVERSATION_ID = 1; // Conversation ID

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
      content: "Hello from Socket.IO!",
      message_type: "text"
    }, (response) => {
      console.log('📨 Message sent:', response);
    });
  }, 2000);
});

socket.on('new_message_received', (data) => {
  console.log('📩 New message received event:', data);
});

socket.on('receive_message', (data) => {
  console.log('📬 Receive message event:', data);
});

socket.on('messages_read', (data) => {
  console.log('👀 Messages read event:', data);
});

socket.on('typing_status', (data) => {
  console.log('⌨️ Typing status event:', data);
});

socket.on('join_self', (data) => {
  console.log('🔗 Join self event:', data);
});

socket.on('room_joined', (data) => {
  console.log('🏠 Room joined event:', data);
});

socket.on('error_message', (data) => {
  console.error('❌ Error:', data);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});