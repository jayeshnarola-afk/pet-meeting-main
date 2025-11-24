import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Conversation } from "./conversation.entities";
import { User } from "./User";

@Entity({ name: "conversations_participant" })
export class ConversationParticipant {
    @PrimaryGeneratedColumn()
    "id": number;

    @Column({ type: "int", nullable: false })
    "conversation_id": number;

    @ManyToOne(() => Conversation, (conversation) => conversation.participants, { onDelete: "CASCADE" })
    @JoinColumn({ name: "conversation_id" })
    "conversation": Conversation;

    @Column({ type: "int", nullable: false })
    "user_id": number;

    @ManyToOne(() => User, (user) => user.conversations, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    "user": User;

    @Column({ type: "enum", enum: ["admin", "member"], default: "member" })
    "role": "admin" | "member";

    @Column({ type: "int", nullable: true })
    "last_cleared_message_id": number | null;

    @Column({ type: "int", nullable: true })
    "last_read_message_id": number | null;

    @Column({ type: "boolean", default: false })
    "is_notification_mute": boolean;

    @Column({ type: "boolean", default: false })
    "is_unmatched_user": boolean;

    @CreateDateColumn({ name: "created_at" })
    "created_at": Date;
}

