    import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
    import { Conversation } from "./conversation.entities";
    import { User } from "./User";

    @Entity({ name: "message" })
    export class Message {
        @PrimaryGeneratedColumn()
        "id": number;

        @Column({ type: "int", nullable: false })
        "conversation_id": number;

        @Column({ type: "bigint", nullable: true })
        "message_id": number | null;

        @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: "CASCADE" })
        @JoinColumn({ name: "conversation_id" })
        "conversation": Conversation;

        @Column({ type: "int", nullable: false })
        "sender_id": number;

        @ManyToOne(() => User, { onDelete: "CASCADE" })
        @JoinColumn({ name: "sender_id" })
        "sender": User;

        @Column({ type: "boolean", default: true })
        "is_location_active": boolean;

        @Column({ type: "timestamp", nullable: true })
        "schedule_time": Date | null;

        @Column({ type: "varchar", length: 50, nullable: true })
        "meeting_status": "pending" | "confirmed" | "rescheduled" | "canceled" | "rejected" | "expired" | "completed" | null;

        @Column({ type: "text", nullable: true })
        "content": string | null;

        @Column({ type: "boolean", default: false })
        "is_deleted_by_admin": boolean;

        @Column({ type: "varchar", length: 50 })
        "message_type": "text" | "image" | "video" | "file" | "location";

        @CreateDateColumn({ name: "created_at" })
        "created_at": Date;

        @UpdateDateColumn({ name: "updated_at" })
        "updated_at": Date;

        @Column({ type: "json", nullable: true })
        "images": object | null;

        @Column({ type: "varchar", length: 50, default: "sent" })
        "status": string; // sent, delivered, read

        @Column({ type: "varchar", length: 255, nullable: true })
        "media_url": string | null;

        @Column({ type: "timestamp", nullable: true })
        "deleted_at": Date | null;
    }

