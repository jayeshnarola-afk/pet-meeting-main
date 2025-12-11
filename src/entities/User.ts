import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Pet } from './Pet';
import { PetType } from './PetType';
import { ConversationParticipant } from './conversation.participant.entities';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  fullName!: string;

  @Column()
  age!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  location!: string;

  @Column({ nullable: true })
  profilePhoto!: string;

  @Column({ nullable: true })
  otp!: string;

  @Column({ nullable: true })
  otpExpires!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  lat!: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  lng!: number | null;

  @Column({ nullable: true })
  fcmToken!: string;

  @Column({ nullable: true })
  deviceType!: string; // 'ios', 'android', 'web'

  @Column({ nullable: true })
  deletedAt!: Date;

  // New notification fields
  @Column({ type: 'smallint', default: 1 })
  matchesNotification!: number; // 1 = enabled, 0 = disabled

  @Column({ type: 'smallint', default: 1 })
  messageNotification!: number; // 1 = enabled, 0 = disabled


  @OneToMany(() => Pet, (pet: Pet) => pet.owner)
  pets!: Pet[];

  @Column({ default: false })
  isBan!: boolean; // 1 for enabled, 0 for disabled


  @OneToMany(() => ConversationParticipant, (participant) => participant.user)
  conversations!: ConversationParticipant[];
  @Column({
    type: 'date',
    nullable: false,
    default: () => 'CURRENT_DATE',
  })
  created_date!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

}