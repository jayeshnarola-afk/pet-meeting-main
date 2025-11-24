#!/bin/bash

# Chat Module Test Script
# Usage: ./test-chat.sh

BASE_URL="http://localhost:4000"

echo "🔐 Step 1: Login User 1..."
read -p "Enter User 1 Email: " USER1_EMAIL
read -p "Enter User 1 Password: " USER1_PASS

USER1_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$USER1_EMAIL\", \"password\": \"$USER1_PASS\"}")

echo "User 1 Login Response: $USER1_RESPONSE"
USER1_TOKEN=$(echo $USER1_RESPONSE | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
USER1_ID=$(echo $USER1_RESPONSE | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

echo "✅ User 1 Token: $USER1_TOKEN"
echo "✅ User 1 ID: $USER1_ID"

echo ""
echo "🔐 Step 2: Login User 2..."
read -p "Enter User 2 Email: " USER2_EMAIL
read -p "Enter User 2 Password: " USER2_PASS

USER2_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$USER2_EMAIL\", \"password\": \"$USER2_PASS\"}")

echo "User 2 Login Response: $USER2_RESPONSE"
USER2_TOKEN=$(echo $USER2_RESPONSE | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
USER2_ID=$(echo $USER2_RESPONSE | sed -n 's/.*"id":\([0-9]*\).*/\1/p')

echo "✅ User 2 Token: $USER2_TOKEN"
echo "✅ User 2 ID: $USER2_ID"

echo ""
echo "📝 Step 3: Create Conversation..."
CONV_RESPONSE=$(curl -s -X POST $BASE_URL/api/chat/create-conversation \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"type\": \"one-to-one\", \"partcipants\": [{\"user_id\": $USER2_ID}]}")

echo "Create Conversation Response: $CONV_RESPONSE"
CONV_ID=$(echo $CONV_RESPONSE | sed -n 's/.*"id":\([0-9]*\).*/\1/p')
echo "✅ Conversation ID: $CONV_ID"
echo "Response: $CONV_RESPONSE"

echo ""
echo "📨 Step 4: Send Message from User 1..."
MESSAGE_RESPONSE=$(curl -s -X POST $BASE_URL/api/chat/message/send-message \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"conversation_id\": $CONV_ID, \"content\": \"Hello from User 1!\", \"message_type\": \"text\"}")

echo "✅ Message sent!"
echo "Response: $MESSAGE_RESPONSE"

echo ""
echo "💬 Step 5: Get Messages..."
curl -s -X GET "$BASE_URL/api/chat/messages/$CONV_ID?page=1&limit=20" \
  -H "Authorization: Bearer $USER1_TOKEN"

echo ""
echo "📋 Step 6: Get Conversations List..."
curl -s -X GET "$BASE_URL/api/chat/conversations?page=1&limit=20" \
  -H "Authorization: Bearer $USER1_TOKEN"

echo ""
echo "✅ Chat testing complete!"

