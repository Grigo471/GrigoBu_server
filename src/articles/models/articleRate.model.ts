import {
    BelongsTo,
    Column,
    ForeignKey,
    Model,
    Table,
} from 'sequelize-typescript';
import { User } from 'src/users';
import { Article } from './articles.model';

@Table
export class ArticleRate extends Model {
    @Column
    value: number;

    @ForeignKey(() => User)
    @Column
    userId: number;

    @BelongsTo(() => User)
    user: User;

    @ForeignKey(() => Article)
    @Column
    articleId: number;

    @BelongsTo(() => Article)
    article: Article;
}
