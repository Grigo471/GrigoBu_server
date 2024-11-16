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
    @Query('sort') sort: 'rating' | 'createdAt',
    @Query('order') order: 'asc' | 'desc',
    @Query('search') search: string,
    @Query('tags') tags: string,
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
      tags,
    );
  }

  @Get('/subscriptions')
  getSubscriptions(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('sort') sort: 'views' | 'title' | 'createdAt',
    @Query('order') order: 'asc' | 'desc',
    @Query('search') search: string,
    @Req() req: AuthRequest,
  ): Promise<ArticleDto[]> {
    const { userId } = req;
    return this.articlesService.getSubscriptions(
      userId,
      limit,
      page,
      sort,
      order,
      search,
    );
  }

  @Get('/user/:username')
  getUserArticles(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('sort') sort: 'views' | 'title' | 'createdAt',
    @Query('order') order: 'asc' | 'desc',
    @Query('search') search: string,
    @Param('username') username: string,
    @Req() req: AuthRequest,
  ): Promise<ArticleDto[]> {
    const { userId } = req;
    return this.articlesService.getUserArticles(
      userId,
      limit,
      page,
      sort,
      order,
      search,
      username,
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

  @Post(':id/rate')
  rateArticle(
    @Param('id') id: string,
    @Query('rate') rate: 'like' | 'dislike',
    @Req() req: AuthRequest,
  ): Promise<RateAticleResult> {
    const { userId } = req;
    return this.articlesService.rateArticle(id, rate, userId);
  }
}
