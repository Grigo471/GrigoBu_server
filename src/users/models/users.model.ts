import {
  Table,
  Column,
  Model,
  HasMany,
  HasOne,
  BelongsToMany,
  ForeignKey,
} from 'sequelize-typescript';
import { Token } from './token.model';
import { CommentModel } from 'src/comments';
import { Article } from 'src/articles';
import { UserRole } from '../types/types';
import { UserSettings } from './userSettings';

@Table
export class User extends Model {
  @Column
  username: string;

  @Column
  password: string;

  @Column
  avatar: string;

  @Column
  status: string;

  @Column
  rating: number = 0;

  @Column
  role: UserRole = 'user';

  @HasOne(() => Token)
  refreshToken: Token;

  @HasOne(() => UserSettings)
  settings: UserSettings;

  @HasMany(() => Article)
  articles: Article[];

  @HasMany(() => CommentModel)
  comments: CommentModel[];

  @BelongsToMany(() => User, () => UserSubscriber, 'subscriberId')
  subscribers: User[];

  @BelongsToMany(() => User, () => UserSubscriber, 'subscriptionId')
  subscribtions: User[];
}

@Table
export class UserSubscriber extends Model {
  @ForeignKey(() => User)
  @Column
  subscriberId: number;

  @ForeignKey(() => User)
  @Column
  subscriptionId: number;
}
