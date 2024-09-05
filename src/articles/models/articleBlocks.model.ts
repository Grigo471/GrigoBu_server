import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Article } from './articles.model';

@Table
export class ArticleTextBlock extends Model {
  @Column
  type: string;

  @Column
  title: string;

  @Column
  index: number;

  @Column
  paragraphs: string;

  @ForeignKey(() => Article)
  @Column
  articleId: number;

  @BelongsTo(() => Article)
  article: Article;
}

@Table
export class ArticleImageBlock extends Model {
  @Column
  type: string;

  @Column
  title: string;

  @Column
  index: number;

  @Column
  src: string;

  @ForeignKey(() => Article)
  @Column
  articleId: number;

  @BelongsTo(() => Article)
  article: Article;
}

@Table
export class ArticleCodeBlock extends Model {
  @Column
  type: string;

  @Column
  title: string;

  @Column
  index: number;

  @Column
  code: string;

  @ForeignKey(() => Article)
  @Column
  articleId: number;

  @BelongsTo(() => Article)
  article: Article;
}
