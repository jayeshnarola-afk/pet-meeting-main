import { DataSource } from 'typeorm';
import { User } from '../src/entities/User';
import { Pet } from '../src/entities/Pet';
import { PetType } from '../src/entities/PetType';
import { PetBreed } from '../src/entities/PetBreed';
import { PetPersonality } from '../src/entities/PetPersonality';
import { PetInteraction } from '../src/entities/PetInteraction';
import { Match } from '../src/entities/Match';
import { Notification } from '../src/entities/Notification';
import { Conversation } from '../src/entities/conversation.entities';
import { ConversationParticipant } from '../src/entities/conversation.participant.entities';
import { Message } from '../src/entities/message.entity';
import { DatingMessage } from '../src/entities/message_meetings.entity';

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://petmeeter_user:zTpPAp3ogVo444kmk8VmC2lU9BqyFt5h@dpg-d44pv9v5r7bs73b3itr0-a.oregon-postgres.render.com/petmeeter',
  synchronize: true,
  logging: false,
  entities: [
    User,
    Pet,
    PetType,
    PetBreed,
    PetPersonality,
    PetInteraction,
    Match,
    Notification,
    Conversation,
    ConversationParticipant,
    Message,
    DatingMessage,
  ],
  migrations: [],
  subscribers: [],
  ssl: { rejectUnauthorized: false },
});


