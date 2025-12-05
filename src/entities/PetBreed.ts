  import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
  import { PetType } from './PetType';

  @Entity()
  export class PetBreed {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string; // e.g., "Labrador", "Persian", "Golden Retriever"

    @Column({ nullable: true })
    typeId!: number; // Foreign key to PetType

    @ManyToOne(() => PetType)
    @JoinColumn({ name: 'typeId' })
    type!: PetType;


    @Column({ nullable: true })
    description!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;


    @Column({ nullable: true })
    userId!: number;
  }


