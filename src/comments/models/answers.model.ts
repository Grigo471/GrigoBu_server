import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from 'sequelize-typescript';
import { User } from 'src/users';
import { CommentModel } from './comments.model';

@Table
export class Answer extends Model {
    @Column(DataType.STRING(10000))
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
