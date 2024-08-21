import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './articles.model';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreateArticleDto } from './dto/createArticleDto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images' }]))
  postArticle(@Body() dto: CreateArticleDto, @UploadedFiles() files) {
    try {
      const { images } = files;
      this.articlesService.create(dto, images);
    } catch (error) {
      console.log(error);
    }
  }

  @Get()
  getArticles(): Promise<Article[]> {
    return this.articlesService.findAll();
  }
}
