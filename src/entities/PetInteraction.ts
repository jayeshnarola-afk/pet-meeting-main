// src/entities/PetInteraction.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { Pet } from './Pet';
import { User } from './User';

@Entity()
@Unique(['likerPetId', 'likedPetId'])
export class PetInteraction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  likerPetId!: number;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'likerPetId' })
  likerPet!: Pet;

  @Column()
  likedPetId!: number;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'likedPetId' })
  likedPet!: Pet;

  @Column()
  action!: 'like' | 'pass';

  @Column()
  likerUserId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'likerUserId' })
  likerUser!: User;

  @Column()
  likedUserId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'likedUserId' })
  likedUser!: User;

  @CreateDateColumn()
  createdAt!: Date;
}