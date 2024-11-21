import { getProfileDto } from 'src/users/dto/UserDto';

export type ArticleBlockType = 'code' | 'image' | 'text';

interface ArticleBlockBase {
  id: string;
  type: ArticleBlockType;
}

interface ArticleCodeBlockInterface extends ArticleBlockBase {
  type: 'code';
  code: string;
  title?: string;
}

interface ArticleImageBlockInterface extends ArticleBlockBase {
  type: 'image';
  src: string;
  title?: string;
}

interface ArticleTextBlockInterface extends ArticleBlockBase {
  type: 'text';
  title?: string;
  paragraphs: string;
}

export type Rate = -1 | null | 1;

export type ArticleBlock =
  | ArticleTextBlockInterface
  | ArticleCodeBlockInterface
  | ArticleImageBlockInterface;

export interface ArticleDto {
  id: string;
  title: string;
  rating: number;
  myRate?: Rate;
  tags: string[];
  user: getProfileDto;
  createdAt: string;
  blocks: ArticleBlock[];
  commentsCount?: number;
}

export interface RateAticleResult {
  articleId: string;
  rating: number;
  myRate?: number;
}
