import {
  BelongsToMany,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Article } from './articles.model';

@Table
export class Tag extends Model {
  @Column
  tag: string;

  @BelongsToMany(() => Article, () => ArticleTag)
  articles: Article[];
}

@Table
export class ArticleTag extends Model {
  @ForeignKey(() => Article)
  @Column
  articleId: number;

  @ForeignKey(() => Tag)
  @Column
  tagId: number;
}
