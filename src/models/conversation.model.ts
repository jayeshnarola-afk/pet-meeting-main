import { ILike, In, MoreThan, Not } from "typeorm";
import { AppDataSource } from "../../config/database";
import { Conversation } from "../entities/conversation.entities";
import { ConversationParticipant } from "../entities/conversation.participant.entities";
import { User } from "../entities/User";
import { Message } from "../entities/message.entity";
import { formatMessage, formatParticipant } from "../helpers/responseDto";
import { pushNotificationService } from "../services/PushNotificationService";

// Create Conversation
export async function addConversations(
    reqBody: any,
    userId: number,
    callback: (error: any, result: any) => void
) {
    try {
        const conversationRepository = AppDataSource.getRepository(Conversation);
        const participantRepository = AppDataSource.getRepository(ConversationParticipant);
        const userRepository = AppDataSource.getRepository(User);
        const messageRepo = AppDataSource.getRepository(Message);

        let participants = reqBody.partcipants || reqBody.participants;
        if (typeof reqBody.participants === "string") {
            participants = JSON.parse(reqBody.participants);
        }

        if (!participants.some((participant: { user_id: number }) => participant.user_id === userId)) {
            return callback(`Current user with ID ${userId} is not in the participants list.`, null);
        }

        const currentUser = await userRepository.findOne({ where: { id: userId } });

        // One-to-One Conversation Handling
        if (reqBody.type === 'one-to-one') {
            const receiverUser = participants.find(
                (participant: { user_id: number }) => participant.user_id !== userId
            );
            if (!receiverUser) {
                return callback("Receiver user ID is missing for one-to-one conversation.", null);
            }
            const receiverUserId = receiverUser.user_id;

            // Check if conversation already exists
            const existingConversation = await conversationRepository
                .createQueryBuilder('conversation')
                .innerJoin('conversation.participants', 'cp1')
                .innerJoin('conversation.participants', 'cp2')
                .where('conversation.type = :type', { type: 'one-to-one' })
                .andWhere('cp1.user_id = :userId', { userId })
                .andWhere('cp2.user_id = :receiverUserId', { receiverUserId })
                .getOne();

            if (existingConversation) {
                const getConversation = await conversationRepository
                    .createQueryBuilder("conversation")
                    .leftJoinAndSelect("conversation.participants", "participants")
                    .leftJoinAndSelect("conversation.messages", "messages")
                    .leftJoinAndSelect("participants.user", "user")
                    .where("conversation.id = :conversationId", { conversationId: existingConversation.id })
                    .orderBy("messages.created_at", "DESC")
                    .getOne();

                const otherParticipant = getConversation?.participants.filter((p: ConversationParticipant) => p.user_id !== userId) ?? [];

                const unreadCount = await messageRepo.count({
                    where: {
                        conversation_id: existingConversation.id,
                        sender_id: Not(userId),
                        id: MoreThan(otherParticipant[0]?.last_read_message_id || 0),
                        status: "sent"
                    }
                });

                const latestMessage = await messageRepo.findOne({
                    where: { conversation_id: existingConversation.id },
                    order: { created_at: "DESC" },
                    relations: ["sender"],
                });



                const response = {
                    id: existingConversation.id,
                    type: existingConversation.type,
                    created_at: existingConversation.created_at,
                    participant: formatParticipant(otherParticipant[0]),
                    last_message: latestMessage ? formatMessage(latestMessage) : null,
                    unread_count: unreadCount ?? 0,
                };

                return callback(null, response);
            }

            const receiverUserDetails = await userRepository.findOne({ where: { id: receiverUserId } });

            if (!currentUser || !receiverUserDetails) {
                return callback("User details not found.", null);
            }
        }

        // Create new conversation
        const conversation = conversationRepository.create({
            type: reqBody.type,
        });
        await conversationRepository.save(conversation);

        // Prepare participants list
        const participantsToSave = participants.map((participant: { user_id: number; role?: string }) => {
            return participantRepository.create({
                conversation_id: conversation.id,
                user: { id: participant.user_id },
                role: "member"
            });
        });

        await participantRepository.save(participantsToSave);

        const getConversation = await conversationRepository
            .createQueryBuilder("conversation")
            .leftJoinAndSelect("conversation.participants", "participants")
            .leftJoinAndSelect("conversation.messages", "messages")
            .leftJoinAndSelect("participants.user", "user")
            .where("conversation.id = :conversationId", { conversationId: conversation.id })
            .orderBy("messages.created_at", "DESC")
            .getOne();

        const otherParticipant = getConversation?.participants.filter((p: ConversationParticipant) => p.user_id !== userId) ?? [];

        const unreadCount = await messageRepo.count({
            where: {
                conversation_id: conversation.id,
                sender_id: Not(userId),
                id: MoreThan(otherParticipant[0]?.last_read_message_id || 0),
                status: "sent"
            }
        });

        const latestMessage = await messageRepo.findOne({
            where: { conversation_id: conversation.id },
            order: { created_at: "DESC" },
            relations: ["sender"],
        });

        const response = {
            id: conversation.id,
            type: conversation.type,
            created_at: conversation.created_at,
            participant: formatParticipant(otherParticipant[0]),
            last_message: latestMessage ? formatMessage(latestMessage) : null,
            unread_count: unreadCount ?? 0,
        };
        return callback(null, response);

    } catch (error) {
        console.error("Error in addConversations:", error);
        return callback(error, null);
    }
}

// Get Conversations List
export async function getChatConversations(
    userId: number,
    page: number,
    limit: number,
    search: string,
    callback: (error: any, result: any) => void
) {
    try {
        const skip = (page - 1) * limit;
        const conversationsRepo = AppDataSource.getRepository(Conversation);
        const participantRepo = AppDataSource.getRepository(ConversationParticipant);
        const messageRepo = AppDataSource.getRepository(Message);

        const participantEntries = await participantRepo.find({
            where: { user_id: userId, is_unmatched_user: false },
            relations: ["conversation", "conversation.participants", "conversation.participants.user", "conversation.participants.user.pets"],
        });

        const conversationsIds = participantEntries.map((entry: ConversationParticipant) => entry.conversation.id);




        if (!conversationsIds.length) {
            return callback(null, {
                conversations: [],
                pagination: {
                    total: 0,
                    currentPage: page,
                    totalPages: 0
                }
            });
        }


        let query = await conversationsRepo
            .createQueryBuilder("conversation")
            .leftJoinAndSelect("conversation.participants", "participants")
            .leftJoinAndSelect("participants.user", "user")
            .leftJoinAndSelect("user.pets", "pets")
            .where("conversation.id IN (:...conversationIds)", { conversationIds: conversationsIds });

        if (search && search.trim() !== "") {
            query = query.andWhere("(user.fullName ILIKE :search)", { search: `%${search}%` });
        }


        const [conversations, total] = await query
            .orderBy("conversation.created_at", "DESC")
            .getManyAndCount();




        const conversationsWithLatestMessage = await Promise.all(
            conversations.map(async (convo: Conversation) => {
                const participantEntry = convo.participants.find((p: ConversationParticipant) => p.user_id === userId);
                const otherParticipant = convo.participants.find((p: ConversationParticipant) => p.user_id !== userId);


                if (!otherParticipant) {
                    return null;
                }

                const lastReadMessageId = participantEntry?.last_read_message_id ?? 0;

                const unreadCount = await messageRepo.count({
                    where: {
                        conversation_id: convo.id,
                        sender_id: Not(userId),
                        id: MoreThan(lastReadMessageId),
                        status: "sent"
                    }
                });

                const latestMessage = await messageRepo.findOne({
                    where: { conversation_id: convo.id },
                    order: { created_at: "DESC" },
                    relations: ["sender"],
                });


                return {
                    id: convo.id,
                    type: convo.type,
                    created_at: convo.created_at,
                    participant: formatParticipant(otherParticipant),
                    last_message: latestMessage ? formatMessage(latestMessage) : null,
                    unread_count: unreadCount,
                    is_notification_mute: participantEntry?.is_notification_mute
                };
            })
        );

        const filteredConversations = conversationsWithLatestMessage.filter(Boolean);

        filteredConversations.sort((a: any, b: any) => {
            const aTime = a?.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
            const bTime = b?.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
            return bTime - aTime;
        });


        const pagination = {
            total: filteredConversations.length,
            currentPage: page,
            totalPages: Math.ceil(filteredConversations.length / limit)
        };

        return callback(null, {
            conversations: filteredConversations,
            pagination
        });

    } catch (error) {
        console.log("errr....", error);
        return callback(error, null);
    }
}

// Get One Conversation
export async function findOneConversation(
    conversation_id: number,
    userId: number,
    callback: (error: any, result: any) => void
) {
    try {
        const conversationRepository = AppDataSource.getRepository(Conversation);
        const participantRepo = AppDataSource.getRepository(ConversationParticipant);
        const messageRepo = AppDataSource.getRepository(Message);

        const conversation = await conversationRepository
            .createQueryBuilder("conversation")
            .leftJoinAndSelect("conversation.participants", "participants")
            .leftJoinAndSelect("participants.user", "user")
            .where("conversation.id = :conversationId", { conversationId: conversation_id })
            .getOne();

        if (!conversation) {
            return callback("Conversation not found", null);
        }

        const participantEntry = conversation.participants.find((p: ConversationParticipant) => p.user_id === userId);
        if (!participantEntry) {
            return callback("User is not a participant in this conversation", null);
        }

        const otherParticipant = conversation.participants.find((p: ConversationParticipant) => p.user_id !== userId);

        const response = {
            id: conversation.id,
            type: conversation.type,
            created_at: conversation.created_at,
            participant: otherParticipant ? formatParticipant(otherParticipant) : null,
        };

        return callback(null, response);
    } catch (error) {
        return callback(error, null);
    }
}

// Get Messages
export async function messagesOfChat(
    userId: number,
    conversation_id: number,
    page: number,
    limit: number,
    search: string,
    callback: (error: any, result: any) => void
) {
    try {
        const skip = (page - 1) * limit;
        const conversationParticipantRepo = AppDataSource.getRepository(ConversationParticipant);
        const messageRepo = AppDataSource.getRepository(Message);

        const whereClause: any = {
            conversation_id,
        };

        if (search) {
            whereClause.content = ILike(`%${search}%`);
        }

        const participant = await conversationParticipantRepo.findOne({
            where: { conversation_id, user_id: userId }
        });

        if (participant?.last_cleared_message_id) {
            whereClause.id = MoreThan(participant?.last_cleared_message_id);
        }

        const [messages, total] = await messageRepo.findAndCount({
            where: whereClause,
            relations: ["sender"],
            order: {
                created_at: "DESC"
            },
            skip,
            take: limit
        });

        // Automatically mark messages as read when user gets messages
        // Get the latest message ID from other users (not from current user) in the entire conversation
        // This ensures we mark all unseen messages as read when user opens chat
        const latestMessageFromOtherUser = await messageRepo.findOne({
            where: {
                conversation_id: conversation_id,
                sender_id: Not(userId)  // Only messages from other users
            },
            order: { created_at: "DESC" }
        });

        if (latestMessageFromOtherUser && participant) {
            const currentLastReadId = participant.last_read_message_id || 0;

            // Only update if latest message ID from other user is greater than current last_read_message_id
            if (latestMessageFromOtherUser.id > currentLastReadId) {

                // Update last_read_message_id to latest message ID from other user
                await conversationParticipantRepo.update(
                    {
                        conversation_id: conversation_id,
                        user_id: userId
                    },
                    {
                        last_read_message_id: latestMessageFromOtherUser.id
                    }
                );

                // Update all messages status to "read" that are from other users
                // and have ID less than or equal to latest message ID
                await messageRepo.createQueryBuilder()
                    .update()
                    .set({ status: "read" })
                    .where("conversation_id = :conversation_id", { conversation_id: conversation_id })
                    .andWhere("id <= :latestMessageId", { latestMessageId: latestMessageFromOtherUser.id })
                    .andWhere("sender_id != :userId", { userId: userId })
                    .andWhere("status != 'read'")
                    .execute();

                console.log(`✅ Automatically marked messages as read for user ${userId} in conversation ${conversation_id}. Latest message ID: ${latestMessageFromOtherUser.id}`);
            }
        }

        const formatMessages = messages.map((msg: Message) => formatMessage(msg));

        const pagination = {
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        };

        return callback(null, {
            messages: formatMessages,
            pagination
        });
    } catch (error) {
        return callback(error, null);
    }
}

// Send Media Message
export async function sendMediaMessage(
    userId: number,
    reqBody: any,
    files: any,
    callback: (error: any, result: any) => void
) {
    const { conversation_id, content, message_type, images, message_id, created_at } = reqBody;
    try {
        // Validate conversation exists
        const conversationRepository = AppDataSource.getRepository(Conversation);
        const conversation = await conversationRepository.findOne({
            where: { id: conversation_id }
        });

        if (!conversation) {
            console.error(`❌ Conversation ${conversation_id} does not exist`);
            return callback(`Conversation with ID ${conversation_id} does not exist`, null);
        }

        // Validate user is a participant in this conversation
        const participantRepo = AppDataSource.getRepository(ConversationParticipant);
        const participant = await participantRepo.findOne({
            where: {
                conversation_id: conversation_id,
                user_id: userId
            }
        });

        if (!participant) {
            console.error(`❌ User ${userId} is not a participant in conversation ${conversation_id}`);
            return callback(`You are not a participant in this conversation`, null);
        }

        const messageCreatedDate = created_at ? new Date(created_at) : new Date();
        const messageId = message_id || Date.now();

        // Import getIo dynamically to avoid circular dependency
        const { getIo } = await import("../socket/socket.io");
        const io = getIo();

        const { addMessage } = await import("./message.model");

        await addMessage(conversation_id, userId, content, message_type, images, files, null, null, null, messageId, messageCreatedDate, async (error: any, result: any) => {
            if (error) {
                return callback(error, null);
            } else {
                console.log("Message sent successfully.");

                // Debug: Check if io is available
                if (!io) {
                    console.error("❌ Socket.IO instance is null/undefined!");
                    return callback("Socket.IO not initialized", null);
                }

                // Get all conversation participants to auto-join them
                const participantRepo = AppDataSource.getRepository(ConversationParticipant);
                const allParticipants = await participantRepo.find({
                    where: { conversation_id: conversation_id },
                    relations: ['user']
                });

                console.log(`📊 Found ${allParticipants.length} participants in conversation ${conversation_id}`);

                // Auto-join all participants to rooms (if connected)
                const { autoJoinRooms } = await import("../socket/socket.io");
                for (const participant of allParticipants) {
                    await autoJoinRooms(participant.user_id, conversation_id);
                }

                // Debug: Check room membership after auto-join
                const room = io.sockets.adapter.rooms.get(`room_${conversation_id}`);
                console.log(`📊 Room room_${conversation_id} has ${room?.size || 0} connected users`);

                // Emit receive_message event
                console.log(`📤 Emitting receive_message to room_${conversation_id}`);
                io.to(`room_${conversation_id}`).emit("receive_message", reqBody);
                console.log(`✅ Event receive_message emitted with data:`, JSON.stringify(reqBody));

                // Get sender user info for notification
                const userRepository = AppDataSource.getRepository(User);
                const senderUser = await userRepository.findOne({ where: { id: userId } });

                // Debug: Check receivers
                console.log(`📊 Number of receivers: ${result.receiver?.length || 0}`);

                await Promise.all(
                    result.receiver.map(async (receiver: any) => {
                        const response = formatMessage(result);
                        const personalRoom = io.sockets.adapter.rooms.get(`personal_data_${receiver.user_id}`);
                        console.log(`📊 Personal room personal_data_${receiver.user_id} has ${personalRoom?.size || 0} connected users`);
                        console.log(`📤 Emitting new_message_received to user ${receiver.user_id}`);
                        io.to(`personal_data_${receiver.user_id}`).emit("new_message_received", {
                            ...response,
                            message_id: messageId,
                            created_at: messageCreatedDate
                        });
                        console.log(`✅ Event new_message_received emitted to user ${receiver.user_id}`);

                        // Send push notification to receiver
                        const receiverUser = await userRepository.findOne({
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
                                senderUser?.fullName || 'New Message',
                                notificationBody,
                                {
                                    type: 'message',
                                    conversationId: conversation_id.toString(),
                                    messageId: messageId.toString(),
                                    senderId: userId.toString(),
                                    messageType: message_type
                                },
                                'message' // notificationType: 'message'
                            );
                        }
                    })
                );

                const response = formatMessage(result);
                return callback(null, { ...response, message_id: messageId });
            }
        });

    } catch (error) {
        return callback(error, null);
    }
}

