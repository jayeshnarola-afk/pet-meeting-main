import { BASE_IMAGE_URL } from "../../config/constants";

export interface FormattedMessage {
    id: number;
    message_id: number;
    conversation_id: number;
    content: string | null;
    created_at: Date;
    message_type: string;
    status: string;
    images: any;
    media_url: string | null;
    sender: {
        id: number;
        fullName: string;
        email: string;
        profilePhoto: string | null;
        location: string;
        lat: number | null;
        lng: number | null;
    } | null;
    is_location_active: boolean;
    schedule_time: Date | null;
    meeting_status: string | null;
}

export function formatMessage(message: any): FormattedMessage {
    // Convert image paths to full URLs
    let formattedImages: any = null;
    if (message.images) {
        if (Array.isArray(message.images)) {
            // If images is an array, convert each path to full URL
            formattedImages = message.images.map((img: string) => {
                if (typeof img === 'string' && !img.startsWith('http')) {
                    return `${BASE_IMAGE_URL}${img}`;
                }
                return img;
            });
        } else if (typeof message.images === 'string') {
            // If images is a string (JSON), try to parse it
            try {
                const parsed = JSON.parse(message.images);
                if (Array.isArray(parsed)) {
                    formattedImages = parsed.map((img: string) => {
                        if (typeof img === 'string' && !img.startsWith('http')) {
                            return `${BASE_IMAGE_URL}${img}`;
                        }
                        return img;
                    });
                } else {
                    formattedImages = message.images;
                }
            } catch (e) {
                formattedImages = message.images;
            }
        } else {
            formattedImages = message.images;
        }
    }

    // Convert media_url to full URL if it exists
    let formattedMediaUrl: string | null = null;
    if (message.media_url) {
        if (typeof message.media_url === 'string' && !message.media_url.startsWith('http')) {
            formattedMediaUrl = `${BASE_IMAGE_URL}${message.media_url}`;
        } else {
            formattedMediaUrl = message.media_url;
        }
    }

    return {
        id: message.id,
        message_id: Number(message.message_id || message.id),
        conversation_id: message.conversation_id,
        content: message.content,
        created_at: message.created_at,
        message_type: message.message_type,
        status: message.status,
        images: formattedImages,
        media_url: formattedMediaUrl,
        sender: message.sender ? {
            id: message.sender.id,
            fullName: message.sender.fullName,
            email: message.sender.email,
            profilePhoto: message.sender.profilePhoto ? (
                message.sender.profilePhoto.startsWith('http') ? message.sender.profilePhoto : `${BASE_IMAGE_URL}${message.sender.profilePhoto}`
            ) : null,
            location: message.sender.location,
            lat: message.sender.lat ? Number(message.sender.lat) : null,
            lng: message.sender.lng ? Number(message.sender.lng) : null
        } : null,
        is_location_active: message.is_location_active ?? true,
        schedule_time: message.schedule_time ? message.schedule_time : null,
        meeting_status: message.meeting_status,
    };
}

export interface FormattedParticipant {
    id: number;
    fullName: string;
    email: string;
    profilePhoto: string | null;
    location: string;
    lat: number | null;
    lng: number | null;
    pets: {
        id: number;
        name: string;
        profilePhoto: string | null;
    }[];
}

export function formatParticipant(participant: any): FormattedParticipant {

    return {


        id: participant.user.id,
        fullName: participant.user.fullName,
        email: participant.user.email,
        profilePhoto: participant.user.profilePhoto
            ? `${BASE_IMAGE_URL}${participant.user.profilePhoto}`
            : null,
        location: participant.user.location,
        lat: participant.user.lat ? Number(participant.user.lat) : null,
        lng: participant.user.lng ? Number(participant.user.lng) : null,

        pets: participant.user.pets?.map((p: any) => ({
            id: p.id,
            name: p.name,
            petsPhoto: p.photos ? `${BASE_IMAGE_URL}${p.photos}` : null
        })) || []
    };
}

