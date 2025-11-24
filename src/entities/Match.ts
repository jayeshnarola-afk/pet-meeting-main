// src/entities/Match.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { Pet } from './Pet';
import { User } from './User';

@Entity()
@Unique(['pet1Id', 'pet2Id'])
export class Match {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  pet1Id!: number;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'pet1Id' })
  pet1!: Pet;

  @Column()
  pet2Id!: number;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'pet2Id' })
  pet2!: Pet;

  @Column()
  user1Id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user1Id' })
  user1!: User;

  @Column()
  user2Id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user2Id' })
  user2!: User;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}