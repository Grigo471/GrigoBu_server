import {
  Table,
  Column,
  Model,
  HasMany,
  HasOne,
  ForeignKey,
  Scopes,
  BelongsTo,
} from 'sequelize-typescript';
import { Token } from './token.model';
import { CommentModel } from 'src/comments';
import { Article, ArticleRate } from 'src/articles';
import { UserSettings } from './userSettings';

@Scopes(() => ({
  withoutPassword: { attributes: { exclude: ['password'] } },
}))
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
  rating: number;

  @Column
  role: string;

  @HasOne(() => Token)
  refreshToken: Token;

  @HasOne(() => UserSettings)
  settings: UserSettings;

  @HasMany(() => Article)
  articles: Article[];

  @HasMany(() => ArticleRate)
  articleRates: ArticleRate[];

  @HasMany(() => CommentModel)
  comments: CommentModel[];

  @HasMany(() => UserSubscriber, 'subscriberId')
  subscribers: User[];

  @HasMany(() => UserSubscriber, 'subscriptionId')
  subscribtions: User[];
}

@Table
export class UserSubscriber extends Model {
  @ForeignKey(() => User)
  @Column
  subscriberId: number;

  @BelongsTo(() => User)
  subscriber: User;

  @ForeignKey(() => User)
  @Column
  subscriptionId: number;

  @BelongsTo(() => User)
  subscribtion: User;
}
