import { Table, Column, Model, HasMany } from 'sequelize-typescript';
import { Article } from 'src/articles/articles.model';

@Table
export class User extends Model {
  @Column
  username: string;

  @Column
  password: string;

  @HasMany(() => Article)
  articles: Article[];
}
