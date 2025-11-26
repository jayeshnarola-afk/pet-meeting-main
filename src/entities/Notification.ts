// src/entities/Notification.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Pet } from './Pet';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  type!: string; // e.g., 'like', 'match'

  @Column({ type: 'text' })
  message!: string;

  @Column({ default: false })
  isRead!: boolean;

  @Column({ nullable: true })
  relatedPetId?: number;

  @ManyToOne(() => Pet, { nullable: true, onDelete: "CASCADE"   })
  @JoinColumn({ name: 'relatedPetId' })
  relatedPet?: Pet;

  @Column({ nullable: true })
  interactionId?: number; // ID of the PetInteraction for like_sent notifications

  @CreateDateColumn()
  createdAt!: Date;
}