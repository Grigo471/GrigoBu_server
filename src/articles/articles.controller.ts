import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateArticleDto } from './dto/createArticleDto';
import { ArticleDto, RateAticleResult } from './types/types';
import { AuthRequest } from 'src/middlewares/authMiddleware';

@Controller('/articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  postArticle(@Body() dto: CreateArticleDto, @UploadedFiles() images) {
    return this.articlesService.create(dto, images);
  }

  @Get()
  getArticles(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('sort') sort: 'views' | 'title' | 'createdAt',
    @Query('order') order: 'asc' | 'desc',
    @Query('q') search: string,
    @Req() req: AuthRequest,
  ): Promise<ArticleDto[]> {
    const { userId } = req;
    return this.articlesService.findAll(
      userId,
      limit,
      page,
      sort,
      order,
      search,
    );
  }

  @Get(':id')
  getArticleById(
    @Param('id') id: string,
    @Req() req: AuthRequest,
  ): Promise<ArticleDto> {
    const { userId } = req;
    return this.articlesService.getArticleById(id, userId);
  }

  @Post(':id/like')
  likeArticle(
    @Param('id') id: string,
    @Req() req: AuthRequest,
  ): Promise<RateAticleResult> {
    const { userId } = req;
    return this.articlesService.likeArticle(id, userId);
  }

  @Post(':id/dislike')
  dislikeArticle(
    @Param('id') id: string,
    @Req() req: AuthRequest,
  ): Promise<RateAticleResult> {
    const { userId } = req;
    return this.articlesService.dislikeArticle(id, userId);
  }
}
