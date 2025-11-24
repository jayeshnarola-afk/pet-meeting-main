import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Message } from "./message.entity";
import { User } from "./User";

@Entity({ name: "message_meetings" })
export class DatingMessage {
    @PrimaryGeneratedColumn()
    "id": number;

    @Column({ type: "int", nullable: false })
    "message_id": number;

    @ManyToOne(() => Message, (message: Message) => message.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "message_id" })
    "message": Message;

    @Column({ type: "int", nullable: true })
    "dating_creator": number | null;

    @Column({ type: "int", nullable: true })
    "dating_partner": number | null;

    @ManyToOne(() => User)
    @JoinColumn({ name: "dating_creator" })
    "datingCreator": User | null;

    @ManyToOne(() => User)
    @JoinColumn({ name: "dating_partner" })
    "datingPartner": User | null;

    @Column({ type: "varchar", length: 255, nullable: false })
    "name": string;

    @Column({ type: "text", nullable: false })
    "address": string;

    @Column({ type: "varchar", nullable: true })
    "distance_km": string | null;

    @Column({ type: "decimal", precision: 10, scale: 8, nullable: true })
    "latitude": number | null;

    @Column({ type: "decimal", precision: 11, scale: 8, nullable: true })
    "longitude": number | null;

    @Column({ type: "varchar", length: 20, default: "pending" })
    "meeting_status": "pending" | "confirmed" | "rescheduled" | "canceled" | "rejected" | "expired" | "completed";

    @Column({ type: "varchar", nullable: true })
    "canceled_reason": string | null;

    @Column({ type: "timestamp", nullable: true })
    "schedule_time": Date | null;

    @Column({ type: "varchar", length: 255, nullable: true })
    "image_url": string | null;

    @Column({ type: "float", nullable: true })
    "rating": number | null;

    @Column({ type: "varchar", length: 100, nullable: true })
    "place_id": string | null;

    @CreateDateColumn({ name: "created_at" })
    "created_at": Date;

    @UpdateDateColumn({ name: "updated_at" })
    "updated_at": Date;
}

