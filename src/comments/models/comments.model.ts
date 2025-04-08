import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    HasMany,
    Model,
    Table,
} from 'sequelize-typescript';
import { User } from 'src/users/models/users.model';
import { Answer } from './answers.model';
import { Article } from 'src/articles';

@Table
export class CommentModel extends Model {
    @Column(DataType.STRING(10000))
    text: string;

    @ForeignKey(() => User)
    @Column
    userId: number;

    @BelongsTo(() => User)
    user: User;

    @ForeignKey(() => Article)
    @Column
    articleId: number;

    @BelongsTo(() => Article)
    articles: Article;

    @HasMany(() => Answer)
    answers: Answer[];
}
