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

export type ArticleBlock =
  | ArticleTextBlockInterface
  | ArticleCodeBlockInterface
  | ArticleImageBlockInterface;
