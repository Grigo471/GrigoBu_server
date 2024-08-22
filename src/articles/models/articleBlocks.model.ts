import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { ArticleBlockType } from '../types/types';
import { Article } from './articles.model';

@Table
export class ArticleBlock extends Model {
  @Column
  type: ArticleBlockType;

  @Column
  title: string;

  @Column
  value: string;

  @ForeignKey(() => Article)
  @Column
  articleId: number;

  @BelongsTo(() => Article)
  article: Article;
}
