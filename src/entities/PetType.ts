import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
@Entity()
export class PetType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string; // e.g., "Dog", "Cat", "Bird"

  @Column({ nullable: true })
  description!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  userId!: number;


  // @ManyToOne(() => User, (user) => user.petTypes)
  // @JoinColumn({ name: "userId" })
  // user!: User;


}


