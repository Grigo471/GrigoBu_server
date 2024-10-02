import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateArticleDto } from './dto/createArticleDto';
import { FileService } from 'src/file/file.service';
import { Article } from './models/articles.model';
import { ArticleTag, Tag } from './models/articleTags.model';
import {
  ArticleTextBlock,
  ArticleCodeBlock,
  ArticleImageBlock,
} from './models/articleBlocks.model';
import { User } from 'src/users';
import { ArticleDto, Rate, RateAticleResult } from './types/types';
import { ArticleRate } from './models/articleRate.model';
import { CommentModel } from 'src/comments';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article)
    private articleModel: typeof Article,
    @InjectModel(ArticleRate)
    private articleRateModel: typeof ArticleRate,
    @InjectModel(Tag)
    private tagModel: typeof Tag,
    @InjectModel(ArticleTag)
    private articleTagModel: typeof ArticleTag,
    @InjectModel(ArticleTextBlock)
    private articleTextBlockModel: typeof ArticleTextBlock,
    @InjectModel(ArticleImageBlock)
    private articleImageBlockModel: typeof ArticleImageBlock,
    @InjectModel(ArticleCodeBlock)
    private articleCodeBlockModel: typeof ArticleCodeBlock,
    private fileService: FileService,
  ) {}

  async create(
    dto: CreateArticleDto,
    images: Express.Multer.File[],
  ): Promise<Article> {
    try {
      dto.blocks.forEach((block) => {
        if (block.type === 'image' && block.src.startsWith('blob:')) {
          images.forEach((image) => {
            if (
              image.originalname.split('.')[0] === block.src.split('/').pop()
            ) {
              const src = this.fileService.createFile(image);
              block.src = src;
            }
          });
        }
      });

      const article = await this.articleModel.create({
        title: dto.title,
        subtitle: dto.subtitle,
        views: 0,
        rating: 0,
        userId: dto.userId,
      });

      const tags = await Promise.all(
        dto.tags.map((tag) => {
          const res = this.tagModel
            .findOrCreate({ where: { tag } })
            .then((t) => t[0]);
          return res;
        }),
      );

      await tags.forEach((tag) => {
        this.articleTagModel.create({
          tagId: tag.id,
          articleId: article.id,
        });
      });

      await dto.blocks.forEach((block, index) => {
        switch (block.type) {
          case 'text':
            this.articleTextBlockModel.create({
              type: block.type,
              title: block.title,
              index: index,
              paragraphs: block.paragraphs,
              articleId: article.id,
            });
            break;
          case 'image':
            this.articleImageBlockModel.create({
              type: block.type,
              title: block.title,
              index: index,
              src: block.src,
              articleId: article.id,
            });
            break;
          case 'code':
            this.articleCodeBlockModel.create({
              type: block.type,
              title: block.title,
              index: index,
              code: block.code,
              articleId: article.id,
            });
            break;
          default:
            console.log('shiit');
            break;
        }
      });

      return article;
    } catch (error) {
      console.log(error);
    }
  }

  async findAll(
    userId: number,
    limit: number,
    page: number,
    sort: 'views' | 'title' | 'createdAt',
    order: 'asc' | 'desc',
    search: string,
  ): Promise<ArticleDto[]> {
    const articles = await this.articleModel.findAll<Article>({
      include: [
        Tag,
        ArticleCodeBlock,
        ArticleTextBlock,
        ArticleImageBlock,
        User,
        CommentModel,
      ],
      limit,
      offset: (page - 1) * limit,
      order: [[sort, order]],
    });

    const articlesWithBlocks = articles.map((article) => {
      const blocks = [];
      blocks.push(...article.codeBlocks);
      blocks.push(...article.textBlocks);
      blocks.push(...article.imageBlocks);
      blocks.sort((a, b) => a.index - b.index);

      const tags = article.tags.map((t) => t.tag);

      const commentsCount = article.comments.length;

      return {
        id: article.id,
        title: article.title,
        tags: tags,
        createdAt: article.createdAt,
        user: article.user,
        rating: article.rating,
        blocks,
        commentsCount,
      };
    });

    return articlesWithBlocks;
  }

  async getArticleById(
    articleId: string,
    userId?: number,
  ): Promise<ArticleDto> {
    const article = await this.articleModel.findOne<Article>({
      where: { id: Number(articleId) },
      include: [
        Tag,
        ArticleCodeBlock,
        ArticleTextBlock,
        ArticleImageBlock,
        User,
      ],
    });
    const blocks = [];
    blocks.push(...article.codeBlocks);
    blocks.push(...article.textBlocks);
    blocks.push(...article.imageBlocks);
    blocks.sort((a, b) => a.index - b.index);

    const tags = article.tags.map((t) => t.tag);

    let myRate;

    if (userId) {
      myRate = await this.articleRateModel.findOne({
        where: { userId, articleId },
      });
    }

    return {
      id: article.id,
      title: article.title,
      tags: tags,
      createdAt: article.createdAt,
      user: article.user,
      rating: article.rating,
      blocks,
      myRate: myRate.value,
    };
  }

  async getArticleTags(): Promise<string[]> {
    const tags = await this.tagModel.findAll<Tag>();
    return tags.map((t) => t.tag).sort();
  }

  async likeArticle(
    articleId: string,
    userId: number,
  ): Promise<RateAticleResult> {
    const myRate = await this.articleRateModel
      .findOrCreate({
        where: { userId, articleId },
      })
      .then((r) => r[0]);

    const article = await this.articleModel.findOne<Article>({
      where: { id: Number(articleId) },
    });

    if (!myRate.value) {
      article.rating += 1;
      myRate.value = 1;
    } else if (myRate.value === 1) {
      article.rating -= 1;
      myRate.value = 0;
    } else {
      article.rating += 2;
      myRate.value = 1;
    }

    await article.save();
    await myRate.save();

    return {
      articleId: article.id,
      myRate: myRate.value,
      rating: article.rating,
    };
  }

  async dislikeArticle(
    articleId: string,
    userId: number,
  ): Promise<RateAticleResult> {
    const myRate = await this.articleRateModel
      .findOrCreate({
        where: { userId, articleId },
      })
      .then((r) => r[0]);

    const article = await this.articleModel.findOne<Article>({
      where: { id: Number(articleId) },
    });

    if (!myRate.value) {
      article.rating -= 1;
      myRate.value = -1;
    } else if (myRate.value === -1) {
      article.rating += 1;
      myRate.value = 0;
    } else {
      article.rating -= 2;
      myRate.value = -1;
    }
    await article.save();
    await myRate.save();

    return {
      articleId: article.id,
      myRate: myRate.value,
      rating: article.rating,
    };
  }
}
