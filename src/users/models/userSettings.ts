import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './users.model';

@Table
export class UserSettings extends Model {
  @Column
  theme: string = 'light';

  @Column
  language: string = 'russian';

  @Column
  isFirstVisit: boolean = true;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;
}
