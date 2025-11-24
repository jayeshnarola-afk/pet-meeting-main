import { Not } from "typeorm";
import { AppDataSource } from "../../config/database";
import { ConversationParticipant } from "../entities/conversation.participant.entities";
import { Message } from "../entities/message.entity";
import { Conversation } from "../entities/conversation.entities";
import { User } from "../entities/User";
import fs from "fs";
import path from "path";

export async function addMessage(
    conversation_id: any,
    sender_id: any,
    content: any,
    message_type: any,
    images: any,
    files: any,
    cafe_location: any,
    schedule_time: Date | null,
    meeting_status: string | null,
    message_id: number,
    messageCreatedDate: Date,
    callback: (error: any, result: any) => void
) {
    try {
        const messageRepository = AppDataSource.getRepository(Message);
        const now = new Date();

        // Process uploaded files and get their paths
        let imagePaths: string[] = [];
        let mediaUrl: string | null = null;

        if (files && Array.isArray(files) && files.length > 0) {
            // Files are already saved to disk by multer, get their paths
            imagePaths = files.map((file: Express.Multer.File) => {
                // Verify file exists on disk (use absolute path)
                const absolutePath = path.join(process.cwd(), 'uploads', 'chat', file.filename);
                const relativePath = path.join('uploads', 'chat', file.filename);
                
                // Check if file exists (try both absolute and relative paths for compatibility)
                const fileExists = fs.existsSync(absolutePath) || fs.existsSync(relativePath);
                
                if (fileExists) {
                    console.log(`✅ File exists: ${file.filename}`);
                    console.log(`📂 Absolute path: ${absolutePath}`);
                } else {
                    console.error(`❌ File NOT found: ${file.filename}`);
                    console.error(`📂 Absolute path checked: ${absolutePath}`);
                    console.error(`📂 Relative path checked: ${relativePath}`);
                }
                
                // Return the path relative to the uploads directory (for URL)
                return `/uploads/chat/${file.filename}`;
            });

            // Set media_url to first file if it's a video or file type
            if (message_type === "video" || message_type === "file") {
                mediaUrl = imagePaths[0];
            }

            console.log(`📁 Processed ${files.length} files for message:`, imagePaths);
            console.log(`📁 File paths stored in DB:`, JSON.stringify(imagePaths));
        }

        // If images are provided in reqBody (from frontend), use them
        // Otherwise, use the uploaded files
        let finalImages: any = null;
        if (imagePaths.length > 0) {
            // Store as JSON array of paths
            finalImages = imagePaths;
        } else if (images) {
            // If images are provided as string/array from reqBody, parse and use them
            try {
                finalImages = typeof images === 'string' ? JSON.parse(images) : images;
            } catch (e) {
                finalImages = images;
            }
        }

        // Set message_type to "image" if files are images and message_type is "media"
        let finalMessageType = message_type;
        if (files && Array.isArray(files) && files.length > 0) {
            const firstFile = files[0];
            if (firstFile.mimetype && firstFile.mimetype.startsWith('image/') && message_type === "media") {
                finalMessageType = "image";
            } else if (firstFile.mimetype && firstFile.mimetype.startsWith('video/') && message_type === "media") {
                finalMessageType = "video";
            } else if (firstFile.mimetype && !firstFile.mimetype.startsWith('image/') && !firstFile.mimetype.startsWith('video/') && message_type === "media") {
                finalMessageType = "file";
            }
        }

        const message = messageRepository.create({
            conversation: { id: conversation_id },
            sender: { id: sender_id },
            content: content,
            message_type: finalMessageType,
            images: (finalMessageType === "image" || finalMessageType === "media") ? finalImages : null,
            media_url: mediaUrl,
            schedule_time: schedule_time,
            meeting_status: meeting_status ? "pending" : null,
            message_id: message_id,
            created_at: messageCreatedDate
        });

        await messageRepository.save(message);
        const message_details = await getMessageDetails(conversation_id, message.id);

        return callback(null, message_details);
    } catch (error) {
        return callback(error, []);
    }
}

export async function getMessageDetails(conversation_id: number, message_id: number) {
    try {
        const messageRepository = AppDataSource.getRepository(Message);
        const conversationRepository = AppDataSource.getRepository(ConversationParticipant);

        const message = await messageRepository.findOne({
            where: { id: message_id, conversation_id: conversation_id },
            relations: ['sender']
        });

        const senderId = message?.sender.id;
        if (!senderId) {
            throw new Error("SenderId is required.");
        }

        const receiver = await conversationRepository.find({
            where: { conversation_id: conversation_id, user_id: Not(message?.sender.id) },
            relations: ['user']
        });

        const message_details = {
            ...message,
            sender: message?.sender,
            receiver: receiver
        };

        return message_details;
    } catch (error) {
        throw new Error(`Failed to get message details: ${error}`);
    }
}

