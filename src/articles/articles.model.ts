import {
  Table,
  Column,
  Model,
  HasMany,
  ForeignKey,
  BelongsToMany,
  BelongsTo,
} from 'sequelize-typescript';
import { ArticleBlockType } from './types';
import { User } from 'src/users/users.model';

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

@Table
export class Article extends Model {
  @Column
  title: string;

  @Column
  subtitle: string;

  @Column
  img: string;

  @Column
  views: number;

  @Column
  rating: number;

  @BelongsToMany(() => Tag, () => ArticleTag)
  tags: Tag[];

  @HasMany(() => ArticleBlock)
  blocks: ArticleBlock[];

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;
}

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
