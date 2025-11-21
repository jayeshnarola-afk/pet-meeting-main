import { Server, Socket } from "socket.io";
import { AppDataSource } from "../../config/database";
import { User } from "../entities/User";
import { addMessage } from "../models/message.model";
import { ConversationParticipant } from "../entities/conversation.participant.entities";
import { Message } from "../entities/message.entity";
import { Not } from "typeorm";
import { formatMessage } from "../helpers/responseDto";
import { pushNotificationService } from "../services/PushNotificationService";

interface UserSocketMap {
    [userId: string]: string;
}

export const connectedSocketUser: UserSocketMap = {};

let ioInstance: Server | null = null;

export const setIo = (io: Server) => {
    ioInstance = io;
};

export const getIo = () => {
    if (!ioInstance) {
        throw new Error("Socket.IO not initialized!");
    }
    return ioInstance;
};

// Helper function to automatically join user to rooms from backend
export const autoJoinRooms = async (userId: number, conversationId: number) => {
    try {
        if (!ioInstance) {
            console.log(`⚠️ Socket.IO not initialized - cannot auto-join user ${userId}`);
            return false;
        }

        // First check if user is in connectedSocketUser (from join_self)
        let userSocketId = connectedSocketUser[userId.toString()];
        let socket = null;

        if (userSocketId) {
            // User already called join_self
            socket = ioInstance.sockets.sockets.get(userSocketId);
        }

        // If not found, try to find any connected socket for this user
        // This handles case where user connected but didn't call join_self
        if (!socket) {
            console.log(`⚠️ User ${userId} not in connectedSocketUser, searching all sockets...`);
            
            // Search through all connected sockets
            for (const [socketId, connectedSocket] of ioInstance.sockets.sockets) {
                // Check if this socket has the user_id in any room
                const personalRoom = `personal_data_${userId}`;
                if (connectedSocket.rooms.has(personalRoom) || connectedSocket.rooms.has(userId.toString())) {
                    socket = connectedSocket;
                    userSocketId = socketId;
                    // Add to connectedSocketUser for future reference
                    connectedSocketUser[userId.toString()] = socketId;
                    console.log(`✅ Found socket for user ${userId} via room search`);
                    break;
                }
            }
        }

        // If still not found, join ALL connected sockets to conversation room (last resort)
        // This ensures events are delivered even if user_id mapping is not available
        if (!socket) {
            const allSockets = Array.from(ioInstance.sockets.sockets.values());
            if (allSockets.length > 0) {
                console.log(`⚠️ User ${userId} not found in connectedSocketUser, joining all ${allSockets.length} connected sockets to conversation room ${conversationId}`);
                
                // Join all connected sockets to conversation room
                // This ensures events are delivered to any connected user
                for (const connectedSocket of allSockets) {
                    const conversationRoom = `room_${conversationId}`;
                    if (!connectedSocket.rooms.has(conversationRoom)) {
                        connectedSocket.join(conversationRoom);
                    }
                }
                
                // Also join to personal room (for notifications)
                for (const connectedSocket of allSockets) {
                    const personalRoom = `personal_data_${userId}`;
                    if (!connectedSocket.rooms.has(personalRoom)) {
                        connectedSocket.join(personalRoom);
                    }
                }
                
                console.log(`✅ Joined all ${allSockets.length} connected sockets to rooms for user ${userId}`);
                return true;
            }
        }

        if (!socket) {
            console.log(`⚠️ User ${userId} is not connected via Socket.IO`);
            return false;
        }

        // Join personal room if not already joined
        const personalRoom = `personal_data_${userId}`;
        if (!socket.rooms.has(personalRoom)) {
            socket.join(personalRoom);
            console.log(`✅ Auto-joined user ${userId} to personal room`);
        }

        // Join conversation room if not already joined
        const conversationRoom = `room_${conversationId}`;
        if (!socket.rooms.has(conversationRoom)) {
            socket.join(conversationRoom);
            console.log(`✅ Auto-joined user ${userId} to conversation room ${conversationId}`);
        }

        return true;
    } catch (error) {
        console.error(`❌ Error auto-joining user ${userId} to rooms:`, error);
        return false;
    }
};

export const handleSocketEvents = (io: Server) => {
    setIo(io);

    io.on("connection", (socket: Socket) => {
        console.log("New client connected successfully:", socket.id);

        // Try to get user_id from handshake query params (if passed from client)
        const userIdFromQuery = socket.handshake.query.user_id;
        if (userIdFromQuery) {
            const userId = parseInt(userIdFromQuery.toString());
            if (userId && !isNaN(userId)) {
                // Automatically join personal room on connection
                socket.join(userId.toString());
                connectedSocketUser[userId] = socket.id;
                socket.join(`personal_data_${userId}`);
                console.log(`✅ Auto-joined user ${userId} to personal room on connection`);
                socket.emit("join_self", { user_id: userId });
            }
        }

        // Join personal room (manual call from client - still supported)
        socket.on("join_self", (data) => {
            const { user_id } = data;
            socket.join(user_id.toString());
            connectedSocketUser[user_id] = socket.id;
            socket.join(`personal_data_${data.user_id}`);
            console.log(`✅ User ${user_id} joined personal room (manual)`);
            socket.emit("join_self", { user_id });
        });

        // Join conversation room
        socket.on("join_room", async (data): Promise<any> => {
            const { conversation_id, user_id } = data;

            if (!conversation_id || !user_id) {
                return socket.emit("error_message", { message: "Invalid room or user_id." });
            }

            socket.join(`room_${conversation_id}`);
            console.log(`User ${user_id} joined room_${conversation_id}`);
            socket.emit("room_joined", { conversation_id });
        });

        // Send Message
        socket.on("send_message", async (data, callback): Promise<any> => {
            const { conversation_id, sender_id, content, message_type, images, message_id, created_at } = data;
            const messageCreatedDate = created_at ? new Date(created_at) : new Date();
            const messageId = message_id || Date.now();

            try {
                const userRepo = AppDataSource.getRepository(User);
                await addMessage(
                    conversation_id,
                    sender_id,
                    content,
                    message_type,
                    images,
                    [],
                    null,
                    null,
                    null,
                    messageId,
                    messageCreatedDate,
                    async (error: any, result: any): Promise<any> => {
                        if (error) {
                            if (callback) {
                                callback({ resStatus: "failed" });
                            }
                            console.log("Error sending message:", error);
                        } else {
                            console.log("Message successfully sent.");
                            const sender = await userRepo.findOne({ where: { id: sender_id } });
                            if (!sender) {
                                return socket.emit("error_message", { message: "Sender not found" });
                            }

                            io.to(`room_${conversation_id}`).emit("receive_message", data);
                            const response = formatMessage(result);

                            if (callback) {
                                callback({ ...response, resStatus: "success", created_at: messageCreatedDate, message_id: messageId });
                            }

                            io.to(`personal_data_${sender_id}`).emit("new_message_received", {
                                ...response,
                                created_at: messageCreatedDate,
                                message_id: messageId
                            });

                            for (const receiver of result.receiver) {
                                io.to(`personal_data_${receiver.user_id}`).emit("new_message_received", {
                                    ...response,
                                    created_at: messageCreatedDate,
                                    message_id: messageId
                                });

                                // Send push notification to receiver
                                const receiverUser = await userRepo.findOne({ 
                                    where: { id: receiver.user_id }
                                });

                                if (receiverUser && receiverUser.messageNotification === 1 && receiverUser.fcmToken) {
                                    // Prepare notification message based on message type
                                    let notificationBody = '';
                                    if (message_type === 'text' && content) {
                                        // Truncate long messages
                                        notificationBody = content.length > 50 
                                            ? content.substring(0, 50) + '...' 
                                            : content;
                                    } else if (message_type === 'image') {
                                        notificationBody = '📷 Sent an image';
                                    } else if (message_type === 'video') {
                                        notificationBody = '🎥 Sent a video';
                                    } else if (message_type === 'file') {
                                        notificationBody = '📎 Sent a file';
                                    } else {
                                        notificationBody = 'Sent a message';
                                    }

                                    await pushNotificationService.sendPushNotification(
                                        receiver.user_id,
                                        sender.fullName || 'New Message',
                                        notificationBody,
                                        {
                                            type: 'message',
                                            conversationId: conversation_id.toString(),
                                            messageId: messageId.toString(),
                                            senderId: sender_id.toString(),
                                            messageType: message_type
                                        },
                                        'message' // notificationType: 'message'
                                    );
                                }
                            }
                        }
                    }
                );
            } catch (error) {
                if (callback) {
                    callback({ resStatus: "failed" });
                }
                console.error("Error sending message:", error);
                socket.emit("error_message", { message: "Failed to send message." });
            }
        });

        // Mark as Read
        socket.on("mark_as_read", async (data): Promise<any> => {
            const { conversation_id, user_id, last_read_message_id } = data;
            try {
                const participantRepo = AppDataSource.getRepository(ConversationParticipant);
                const messageRepo = AppDataSource.getRepository(Message);

                // Update last_read_message_id
                await participantRepo.update(
                    {
                        conversation_id: conversation_id,
                        user_id: user_id
                    },
                    {
                        last_read_message_id: last_read_message_id
                    }
                );

                // Update all unseen message as "read"
                await messageRepo.createQueryBuilder()
                    .update()
                    .set({ status: "read" })
                    .where("conversation_id = :conversation_id", { conversation_id: conversation_id })
                    .andWhere("id <= :lastReadMessageId", { lastReadMessageId: last_read_message_id })
                    .andWhere("sender_id != :userId", { userId: user_id })
                    .andWhere("status != 'read'")
                    .execute();

                const messager_sender = await participantRepo.findOne({ where: { conversation_id: conversation_id, user_id: Not(user_id) } });

                io.to(`personal_data_${messager_sender?.user_id}`).emit("messages_read", {
                    conversation_id,
                    user_id,
                    message_sender_id: messager_sender?.user_id,
                    last_read_message_id
                });
            } catch (error) {
                console.log(error);
                socket.emit("error_message", { message: "Something is wrong in mark_as_read" });
            }
        });

        // Typing Indicator
        socket.on("typing", async (data): Promise<any> => {
            const { conversation_id, sender_id, is_typing } = data;
            try {
                const ConversationParticipantRepo = AppDataSource.getRepository(ConversationParticipant);

                const participant = await ConversationParticipantRepo.findOne({ where: { conversation_id: conversation_id, user_id: Not(sender_id) } });

                if (!participant) {
                    return socket.emit("typing_error", { message: "Other participant not found." });
                }

                if (participant) {
                    io.to(`personal_data_${participant.user_id}`).emit("typing_status", { conversation_id, sender_id, is_typing });
                }
            } catch (error) {
                socket.emit("error_message", { message: "Something is wrong in typing" });
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
            // Remove from connected users
            for (const [userId, socketId] of Object.entries(connectedSocketUser)) {
                if (socketId === socket.id) {
                    delete connectedSocketUser[userId];
                    break;
                }
            }
        });
    });
};

