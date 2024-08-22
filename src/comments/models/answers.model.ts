import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/users';
import { CommentModel } from './comments.model';

@Table
export class Answer extends Model {
  @Column
  text: string;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => CommentModel)
  @Column
  commentId: number;

  @BelongsTo(() => CommentModel)
  comment: CommentModel;
}
