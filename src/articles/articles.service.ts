import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
import { ArticleDto, RateAticleResult } from './types/types';
import { ArticleRate } from './models/articleRate.model';
import { CommentModel } from 'src/comments';
import { Op } from 'sequelize';
import { UserSubscriber } from 'src/users/models/users.model';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article)
    private articleModel: typeof Article,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(UserSubscriber)
    private userSubscriberModel: typeof UserSubscriber,
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

  async getArticleWithBlocks(
    article: Article,
    userId?: number,
  ): Promise<ArticleDto> {
    const blocks = [];
    blocks.push(...article.codeBlocks);
    blocks.push(...article.textBlocks);
    blocks.push(...article.imageBlocks);
    blocks.sort((a, b) => a.index - b.index);

    const tags = article.tags.map((t) => t.tag);

    const commentsCount = article.comments?.length;

    let myRate;

    if (userId) {
      myRate = await this.articleRateModel.findOne({
        where: { userId, articleId: article.id },
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
      myRate: myRate?.value,
      commentsCount,
    };
  }

  async findAll(
    userId: number | undefined,
    limit: number,
    page: number,
    sort: 'rating' | 'createdAt',
    order: 'asc' | 'desc',
    search: string,
    tags: string,
  ): Promise<ArticleDto[]> {
    const tagsArray =
      tags.length > 0 ? tags.replaceAll('%20', ' ').split(',') : null;

    const articles = await this.articleModel.findAll<Article>({
      include: [
        {
          model: Tag,
          where: tagsArray
            ? {
                tag: tagsArray,
              }
            : {},
        },
        ArticleCodeBlock,
        ArticleTextBlock,
        ArticleImageBlock,
        User,
        CommentModel,
      ],
      where: {
        title: {
          [Op.iLike]: '%' + search + '%',
        },
      },
      limit,
      offset: (page - 1) * limit,
      order: [[sort, order]],
    });

    const articlesWithBlocks = await Promise.all(
      articles.map((article) => this.getArticleWithBlocks(article, userId)),
    );
    return articlesWithBlocks;
  }

  async getSubscriptions(
    userId: number,
    limit: number,
    page: number,
    sort: 'views' | 'title' | 'createdAt',
    order: 'asc' | 'desc',
    search: string,
  ): Promise<ArticleDto[]> {
    const subscriptions = await this.userSubscriberModel
      .findAll({
        where: {
          subscriberId: userId,
        },
      })
      .then((data) => data.map((sub) => sub.subscriptionId));

    const articles = await this.articleModel.findAll<Article>({
      include: [
        Tag,
        ArticleCodeBlock,
        ArticleTextBlock,
        ArticleImageBlock,
        User,
        CommentModel,
      ],
      where: {
        title: {
          [Op.iLike]: '%' + search + '%',
        },
        userId: subscriptions,
      },
      limit,
      offset: (page - 1) * limit,
      order: [[sort, order]],
    });

    const articlesWithBlocks = await Promise.all(
      articles.map((article) => this.getArticleWithBlocks(article, userId)),
    );

    return articlesWithBlocks;
  }

  async getUserArticles(
    userId: number,
    limit: number,
    page: number,
    sort: 'views' | 'title' | 'createdAt',
    order: 'asc' | 'desc',
    search: string,
    username: string,
  ): Promise<ArticleDto[]> {
    const user = await this.userModel.findOne<User>({
      include: [
        {
          model: Article,
          include: [
            Tag,
            ArticleCodeBlock,
            ArticleTextBlock,
            ArticleImageBlock,
            User,
            CommentModel,
          ],
          where: {
            title: {
              [Op.iLike]: '%' + search + '%',
            },
          },
          limit,
          // @ts-expect-error: No offset property in Typescript, but it works
          offset: (page - 1) * limit,
          order: [[sort, order]],
        },
      ],
      where: { username },
    });

    const articlesWithBlocks = await Promise.all(
      user.articles.map((article) =>
        this.getArticleWithBlocks(article, userId),
      ),
    );

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
    return this.getArticleWithBlocks(article, userId);
  }

  async getArticleTags(): Promise<string[]> {
    const tags = await this.tagModel.findAll<Tag>();
    return tags.map((t) => t.tag).sort();
  }

  async rateArticle(
    articleId: string,
    rate: 'like' | 'dislike',
    userId: number,
  ): Promise<RateAticleResult> {
    if (!rate) throw new HttpException(`No rate`, HttpStatus.BAD_REQUEST);

    const myRate = await this.articleRateModel
      .findOrCreate({
        where: { userId, articleId },
      })
      .then((r) => r[0]);

    const article = await this.articleModel.findOne<Article>({
      include: [User],
      where: { id: Number(articleId) },
    });

    const user = article.user;

    const currRate = myRate.value;

    if (!currRate || currRate === 0) {
      if (rate === 'like') {
        article.rating += 1;
        user.rating += 1;
        myRate.value = 1;
      } else {
        article.rating -= 1;
        user.rating -= 1;
        myRate.value = -1;
      }
    } else if (currRate === 1) {
      if (rate === 'like') {
        article.rating -= 1;
        user.rating -= 1;
        myRate.value = 0;
      } else {
        article.rating -= 2;
        user.rating -= 2;
        myRate.value = -1;
      }
    } else {
      if (rate === 'like') {
        article.rating += 2;
        user.rating += 2;
        myRate.value = 1;
      } else {
        article.rating += 1;
        user.rating += 1;
        myRate.value = 0;
      }
    }

    await article.save();
    await user.save();
    await myRate.save();

    return {
      articleId: article.id,
      myRate: myRate.value,
      rating: article.rating,
    };
  }
}
