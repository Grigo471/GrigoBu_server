export type ArticleBlockType = 'CODE' | 'IMAGE' | 'TEXT';

export interface ArticleBlockInterface {
  type: ArticleBlockType;
  title?: string;
  value: string;
}
