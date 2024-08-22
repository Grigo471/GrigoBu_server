import { Body, Controller, Get, Post } from '@nestjs/common';
import { CommentModel } from './models/comments.model';
import { CreateCommentDto } from './dto/createCommentDto';
import { CommentsService } from './comments.service';
import { CreateAnswerDto } from './dto/createAnswerDto';

@Controller('/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  postComment(@Body() dto: CreateCommentDto) {
    try {
      this.commentsService.create(dto);
    } catch (error) {
      console.log(error);
    }
  }

  @Post('/answers')
  postAnswer(@Body() dto: CreateAnswerDto) {
    try {
      this.commentsService.createAnswer(dto);
    } catch (error) {
      console.log(error);
    }
  }

  @Get()
  getComments(): Promise<CommentModel[]> {
    return this.commentsService.findAll();
  }
}
