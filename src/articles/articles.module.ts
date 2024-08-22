import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ArticlesService } from './articles.service';
import { FileService } from 'src/file/file.service';
import { Article } from './models/articles.model';
import { ArticleTag, Tag } from './models/articleTags.model';
import { ArticleBlock } from './models/articleBlocks.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Article, Tag, ArticleTag, ArticleBlock]),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService, FileService],
})
export class ArticlesModule {}
