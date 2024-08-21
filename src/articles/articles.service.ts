import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Article, ArticleBlock, ArticleTag, Tag } from './articles.model';
import { CreateArticleDto } from './dto/createArticleDto';
import { FileService } from 'src/file/file.service';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article)
    private articleModel: typeof Article,
    @InjectModel(Tag)
    private tagModel: typeof Tag,
    @InjectModel(ArticleTag)
    private articleTagModel: typeof ArticleTag,
    @InjectModel(ArticleBlock)
    private articleBlockModel: typeof ArticleBlock,
    private fileService: FileService,
  ) {}

  async create(
    dto: CreateArticleDto,
    images: Express.Multer.File[],
  ): Promise<Article> {
    try {
      const imgPaths = images.map((img) => this.fileService.createFile(img));

      dto.img = imgPaths[0];
      let i = 1;
      for (const j in dto.blocks) {
        if (dto.blocks[j].type === 'IMAGE') {
          dto.blocks[j].value = imgPaths[i];
          i++;
        }
      }

      const article = await this.articleModel.create({
        title: dto.title,
        subtitle: dto.subtitle,
        img: dto.img,
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

      await dto.blocks.forEach((block) => {
        this.articleBlockModel.create({
          type: block.type,
          title: block.title,
          value: block.value,
          articleId: article.id,
        });
      });

      return article;
    } catch (error) {
      console.log(error);
    }
  }

  async findAll(): Promise<Article[]> {
    return this.articleModel.findAll<Article>({ include: [Tag, ArticleBlock] });
  }
}
