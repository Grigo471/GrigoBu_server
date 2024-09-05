import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './models/articles.model';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateArticleDto } from './dto/createArticleDto';

@Controller('/articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  postArticle(@Body() dto: CreateArticleDto, @UploadedFiles() images) {
    return this.articlesService.create(dto, images);
  }

  @Get()
  getArticles(): Promise<Article[]> {
    return this.articlesService.findAll();
  }
}
