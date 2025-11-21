import { Request, Response } from "express";
import { ErrorResponse, successResponse } from "../helpers/apiResponse";
import { addConversations, getChatConversations, findOneConversation, messagesOfChat, sendMediaMessage } from "../models/conversation.model";

// Create Conversation
export const createConversation = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { type, partcipants } = req.body;
        if (!type || !partcipants || partcipants.length === 0) {
            return ErrorResponse(res, "Invalid input data");
        }
        partcipants.push({ "user_id": userId });
        await addConversations(req.body, userId, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error);
            }
            return successResponse(res, "Conversation created successfully.", result);
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error(JSON.stringify(error));
            return ErrorResponse(res, error.message);
        }
    }
};

// Get Conversations List
export const getConversations = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search?.toString() || "";
    try {
        
        getChatConversations(userId, page, limit, search, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error);
            }
            return successResponse(res, "Conversations Lists.", result);
        });
    } catch (error) {
        if (error instanceof Error) {
            return ErrorResponse(res, error.message);
        }
    }
};

// Get One Conversation
export const getOneConversation = async (req: Request, res: Response) => {
    const conversation_id = parseInt(req.params.conversation_id);
    const userId = (req as any).user.id;

    try {
        findOneConversation(conversation_id, userId, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error);
            }
            return successResponse(res, "Conversation details.", result);
        });
    } catch (error) {
        if (error instanceof Error) {
            return ErrorResponse(res, error.message);
        }
    }
};

// Get Messages
export const getMessagesOfChatId = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const conversation_id = Number(req.params.conversation_id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = String(req.query.search) || "";

    try {
        messagesOfChat(userId, conversation_id, page, limit, search, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error);
            }
            return successResponse(res, "Messages of chat", result);
        });
    } catch (error) {
        if (error instanceof Error) {
            return ErrorResponse(res, error.message);
        }
    }
};

// Send Media Message
export const sendMediaMessageApi = async (req: Request, res: Response) => {
    try {
        const reqBody = req.body;
        const userId = (req as any).user.id;
        const files = (req as any).files;
        sendMediaMessage(userId, reqBody, files, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error);
            }
            return successResponse(res, "Message sent successfully.", result);
        });
    } catch (error) {
        if (error instanceof Error) {
            return ErrorResponse(res, error.message);
        }
    }
};

