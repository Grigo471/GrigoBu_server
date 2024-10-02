import { Controller, Get } from '@nestjs/common';
import { ArticlesService } from './articles.service';

@Controller('/tags')
export class TagsController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  getArticleTags(): Promise<string[]> {
    return this.articlesService.getArticleTags();
  }
}
