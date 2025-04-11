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
import { ArticleBlock, ArticleDto, RateAticleResult } from './types/types';
import { ArticleRate } from './models/articleRate.model';
import { CommentModel } from 'src/comments';
import { Op } from 'sequelize';
import { UserSubscriber } from 'src/users/models/users.model';
import { getProfileDto } from 'src/users/dto/UserDto';
import { NotificationsService } from 'src/notifications/services/notifications.service';

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
        private notificationsService: NotificationsService,
    ) {}

    private async checkIfCanEdit(article: Article, userId: number) {
        const user = await this.userModel.findByPk(userId);

        if (article.userId !== userId && user.role === 'user') {
            throw new HttpException(
                'Not a creator or moderator',
                HttpStatus.UNAUTHORIZED,
            );
        }
    }

    private async createTags(tags: string[], articleId: string) {
        const createdTags = await Promise.all(
            tags.map((tag) => {
                const res = this.tagModel
                    .findOrCreate({ where: { tag } })
                    .then((t) => t[0]);
                return res;
            }),
        );

        await createdTags.forEach((tag) => {
            this.articleTagModel.create({
                tagId: tag.id,
                articleId: articleId,
            });
        });
    }

    private async createBlocks(blocks: ArticleBlock[], articleId: string) {
        await blocks.forEach(async (block, index) => {
            switch (block.type) {
                case 'text':
                    await this.articleTextBlockModel.create({
                        type: block.type,
                        title: block.title,
                        index: index,
                        paragraphs: block.paragraphs,
                        articleId: articleId,
                    });
                    break;
                case 'image':
                    await this.articleImageBlockModel.create({
                        type: block.type,
                        title: block.title,
                        index: index,
                        src: block.src,
                        articleId: articleId,
                    });
                    break;
                case 'code':
                    await this.articleCodeBlockModel.create({
                        type: block.type,
                        title: block.title,
                        index: index,
                        code: block.code,
                        articleId: articleId,
                    });
                    break;
                default:
                    console.log('Could not create blocks');
                    break;
            }
        });
    }

    async createArticle(
        dto: CreateArticleDto,
        images: Express.Multer.File[],
    ): Promise<Article> {
        try {
            dto.blocks.forEach((block) => {
                if (block.type === 'image' && block.src.startsWith('blob:')) {
                    images.forEach((image) => {
                        if (
                            image.originalname.split('.')[0] ===
                            block.src.split('/').pop()
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

            await this.createTags(dto.tags, article.id);

            await this.createBlocks(dto.blocks, article.id);

            return article;
        } catch (error) {
            console.log(error);
        }
    }

    private async deleteImageBlocksAndFiles(articleId: string) {
        const blocks = await this.articleImageBlockModel.findAll({
            where: {
                articleId: articleId,
            },
        });

        await Promise.all(
            blocks.map((block) => {
                if (!block.src.startsWith('blob:'))
                    this.fileService.deleteFileByName(block.src);
                block.destroy();
            }),
        );
    }

    private async deleteBlocksAndTags(
        articleId: string,
        withFiles: boolean = false,
    ) {
        await this.articleTagModel.destroy({
            where: {
                articleId: articleId,
            },
        });

        await this.articleTextBlockModel.destroy({
            where: {
                articleId: articleId,
            },
        });

        await this.articleCodeBlockModel.destroy({
            where: {
                articleId: articleId,
            },
        });

        if (withFiles) {
            await this.deleteImageBlocksAndFiles(articleId);
        } else {
            await this.articleImageBlockModel.destroy({
                where: {
                    articleId: articleId,
                },
            });
        }
    }

    async editArticle(
        id: string,
        userId: number,
        dto: CreateArticleDto,
        images: Express.Multer.File[],
    ): Promise<Article> {
        try {
            const article = await this.articleModel.findByPk(id, {
                include: [User],
            });

            if (!article)
                throw new HttpException(
                    'Article not found',
                    HttpStatus.BAD_REQUEST,
                );

            await this.checkIfCanEdit(article, userId);

            article.title = dto.title;
            await article.save();

            const currentImageBlocks =
                await this.articleImageBlockModel.findAll({
                    where: { articleId: id },
                });

            const dtoSrcs = dto.blocks
                .filter((block) => block.type === 'image')
                .map((block) => block.src);

            currentImageBlocks.forEach(({ src }) => {
                if (!dtoSrcs.includes(src) && !src.startsWith('blob:')) {
                    this.fileService.deleteFileByName(src);
                }
            });

            dto.blocks.forEach((block) => {
                if (block.type === 'image' && block.src.startsWith('blob:')) {
                    images.forEach((image) => {
                        if (
                            image.originalname.split('.')[0] ===
                            block.src.split('/').pop()
                        ) {
                            const src = this.fileService.createFile(image);
                            block.src = src;
                        }
                    });
                }
            });

            await this.deleteBlocksAndTags(article.id);

            await this.createTags(dto.tags, article.id);

            await this.createBlocks(dto.blocks, article.id);

            return article;
        } catch (error) {
            console.log(error);
        }
    }

    async deleteArticle(id: string, userId: number): Promise<Article> {
        try {
            const article = await this.articleModel.findByPk(id, {
                include: [User],
            });

            await this.checkIfCanEdit(article, userId);

            await this.deleteBlocksAndTags(id, true);

            await article.destroy();

            return article.id;
        } catch (error) {
            console.log(error);
        }
    }

    async getArticleWithBlocks(
        article: Article,
        userId?: number,
        amISubscribed?: boolean,
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
            user: new getProfileDto(article.user, amISubscribed),
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
            tags?.length > 0 ? tags.replaceAll('%20', ' ').split(',') : null;

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
            articles.map((article) =>
                this.getArticleWithBlocks(article, userId),
            ),
        );
        return articlesWithBlocks;
    }

    async getRated(
        userId: number | undefined,
        limit: number,
        page: number,
        sort: 'rating' | 'createdAt',
        order: 'asc' | 'desc',
        search: string,
        tags: string,
        myRate: 1 | -1,
    ): Promise<ArticleDto[]> {
        const tagsArray =
            tags?.length > 0 ? tags.replaceAll('%20', ' ').split(',') : null;

        const ratedArticles = await this.articleRateModel
            .findAll({
                where: { userId, value: myRate },
            })
            .then((data) => data.map((rate) => rate.articleId));

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
                id: ratedArticles,
                title: {
                    [Op.iLike]: '%' + search + '%',
                },
            },
            limit,
            offset: (page - 1) * limit,
            order: [[sort, order]],
        });

        const articlesWithBlocks = await Promise.all(
            articles.map((article) =>
                this.getArticleWithBlocks(article, userId),
            ),
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
            articles.map((article) =>
                this.getArticleWithBlocks(article, userId),
            ),
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
        const articles = await this.articleModel.findAll<Article>({
            include: [
                Tag,
                ArticleCodeBlock,
                ArticleTextBlock,
                ArticleImageBlock,
                {
                    model: User,
                    where: {
                        username,
                    },
                },
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
            articles.map((article) =>
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

        if (!userId) return this.getArticleWithBlocks(article, userId);
        const subscribeRelation = await this.userSubscriberModel.findOne({
            where: {
                subscriberId: userId,
                subscriptionId: article.user.id,
            },
        });

        const amISubscribed = Boolean(subscribeRelation);

        return this.getArticleWithBlocks(article, userId, amISubscribed);
    }

    async getArticleTags(): Promise<string[]> {
        const tags = await this.tagModel.findAll<Tag>({
            order: [['tag', 'asc']],
        });
        return tags.map((t) => t.tag);
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

        if (user.rating % 5 === 0) {
            await this.notificationsService.createNotifications({
                userId: user.id,
                value: user.rating,
                type: 'rating',
            });
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
