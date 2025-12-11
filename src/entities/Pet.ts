import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from './User';
import { PetType } from './PetType';
import { PetBreed } from './PetBreed';
import { PetPersonality } from './PetPersonality';

@Entity()
export class Pet {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  typeId!: number; // Foreign key to PetType

  @ManyToOne(() => PetType)
  @JoinColumn({ name: 'typeId' })
  type!: PetType;

  @Column()
  breedId!: number; // Foreign key to PetBreed

  @ManyToOne(() => PetBreed)
  @JoinColumn({ name: 'breedId' })
  breed!: PetBreed;

  @Column()
  age!: number;

  @Column()
  gender!: string;

  @Column({ nullable: true })
  size!: string; // small, medium, large

  @Column({ nullable: true })
  color!: string;

  @ManyToMany(() => PetPersonality)
  @JoinTable({
    name: 'pet_personality_relations',
    joinColumn: { name: 'petId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'personalityId', referencedColumnName: 'id' }
  })
  personalities!: PetPersonality[];

  @Column({ nullable: true })
  bio!: string;

  @Column({ nullable: true })
  vaccinationNotes!: string;

  @Column({ nullable: true })
  specialNeeds!: string;

  @Column({ nullable: true })
  lookingFor!: string; // What the pet owner is looking for

  @Column({ default: true })
  isEnabled!: boolean; // 1 for enabled, 0 for disabled

  @Column({ default: false })
  isBan!: boolean; // 1 for enabled, 0 for disabled

  // @Column('simple-array', { nullable: true })
  // photos!: string[]; // array of photo URLs

  @Column('json', { nullable: true })
  photos!: {
    url: string;
    isBlocked: boolean;
  }[];

  
  @ManyToOne(() => User, user => user.pets)
  @JoinColumn({ name: 'ownerId' })
  owner!: User;

  @Column()
  ownerId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
