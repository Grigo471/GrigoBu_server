import { ArticleBlockInterface } from '../types';

export interface CreateArticleDto {
  title: string;
  subtitle: string;
  img: string;
  tags: string[];
  blocks: ArticleBlockInterface[];
  userId: number;
}
