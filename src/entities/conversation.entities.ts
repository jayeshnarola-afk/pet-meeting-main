import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ConversationParticipant } from "./conversation.participant.entities";
import { Message } from "./message.entity";

@Entity({ name: "conversations" })
export class Conversation {
    @PrimaryGeneratedColumn()
    "id": number;

    @Column({
        type: "enum",
        enum: ["one-to-one", "group"],
        default: "one-to-one"
    })
    "type": "one-to-one" | "group";

    @CreateDateColumn({ name: "created_at" })
    "created_at": Date;

    @OneToMany(() => ConversationParticipant, (participant: ConversationParticipant) => participant.conversation)
    "participants": ConversationParticipant[];

    @OneToMany(() => Message, (message: Message) => message.conversation)
    "messages": Message[];
}

