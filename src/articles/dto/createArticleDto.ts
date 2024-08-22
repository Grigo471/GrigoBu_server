import { ArticleBlockInterface } from '../types/types';

export interface CreateArticleDto {
  title: string;
  subtitle: string;
  img: string;
  tags: string[];
  blocks: ArticleBlockInterface[];
  userId: number;
}
