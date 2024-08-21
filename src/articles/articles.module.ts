import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Article, ArticleBlock, ArticleTag, Tag } from './articles.model';
import { ArticlesService } from './articles.service';
import { FileService } from 'src/file/file.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Article, Tag, ArticleTag, ArticleBlock]),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService, FileService],
  exports: [ArticlesService, FileService],
})
export class ArticlesModule {}
