import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('daily_active_users')
@Unique('unique_user_per_day', ['user_id', 'activity_date'])
export class DailyActiveUser {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @Column({
    type: 'date',
    nullable: false,
    default: () => 'CURRENT_DATE',
  })
  activity_date!: string; // format YYYY-MM-DD

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;
}
