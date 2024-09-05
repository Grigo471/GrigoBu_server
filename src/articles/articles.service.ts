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

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article)
    private articleModel: typeof Article,
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
      const imgPaths = images.map((img) => this.fileService.createFile(img));
      console.log(images);
      dto.blocks.forEach((block, i) => {
        if (block.type === 'image') {
          images.forEach((image, j) => {
            if (
              image.originalname.split('.')[0] === block.src.split('/').pop()
            ) {
              if (dto.blocks[i].type === 'image')
                dto.blocks[i].src = imgPaths[j];
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

      // const tags = await Promise.all(
      //   dto.tags.map((tag) => {
      //     const res = this.tagModel
      //       .findOrCreate({ where: { tag } })
      //       .then((t) => t[0]);
      //     return res;
      //   }),
      // );

      // await tags.forEach((tag) => {
      //   this.articleTagModel.create({
      //     tagId: tag.id,
      //     articleId: article.id,
      //   });
      // });

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

  async findAll(): Promise<Article[]> {
    return this.articleModel.findAll<Article>({
      include: [Tag, ArticleCodeBlock, ArticleTextBlock, ArticleImageBlock],
    });
  }
}
