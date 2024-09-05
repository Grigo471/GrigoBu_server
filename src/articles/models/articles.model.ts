import {
  Table,
  Column,
  Model,
  HasMany,
  ForeignKey,
  BelongsToMany,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from 'src/users/models/users.model';
import { CommentModel } from 'src/comments';
import { ArticleTag, Tag } from './articleTags.model';
import {
  ArticleTextBlock,
  ArticleImageBlock,
  ArticleCodeBlock,
} from './articleBlocks.model';

@Table
export class Article extends Model {
  @Column
  title: string;

  @Column
  subtitle: string;

  @Column
  views: number;

  @Column
  rating: number;

  @BelongsToMany(() => Tag, () => ArticleTag)
  tags: Tag[];

  @HasMany(() => ArticleTextBlock)
  textBlocks: ArticleTextBlock[];

  @HasMany(() => ArticleImageBlock)
  imageBlocks: ArticleImageBlock[];

  @HasMany(() => ArticleCodeBlock)
  codeBlocks: ArticleCodeBlock[];

  @HasMany(() => CommentModel)
  comments: CommentModel[];

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;
}
