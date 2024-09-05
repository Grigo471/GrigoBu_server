import { ArticleBlock } from '../types/types';

export interface CreateArticleDto {
  title: string;
  subtitle: string;
  tags: string[];
  blocks: ArticleBlock[];
  userId: number;
  imagesBlocksIds: string[];
}
