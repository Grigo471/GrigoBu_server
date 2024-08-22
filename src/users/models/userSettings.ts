import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './users.model';
import { Language, Theme } from '../types/types';

@Table
export class UserSettings extends Model {
  @Column
  theme: Theme = 'light';

  @Column
  language: Language = 'russian';

  @Column
  isFirstVisit: boolean = true;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;
}
