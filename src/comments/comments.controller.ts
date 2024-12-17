import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommentModel } from './models/comments.model';
import { CreateCommentDto } from './dto/createCommentDto';
import { CommentsService } from './comments.service';
import { CreateAnswerDto } from './dto/createAnswerDto';
import { Answer } from './models/answers.model';

@Controller('/comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    @Post()
    postComment(@Body() dto: CreateCommentDto): Promise<CommentModel> {
        return this.commentsService.create(dto);
    }

    @Post('/answers')
    postAnswer(@Body() dto: CreateAnswerDto): Promise<Answer> {
        return this.commentsService.createAnswer(dto);
    }

    @Get(':id')
    getComments(@Param('id') articleId: string): Promise<CommentModel[]> {
        return this.commentsService.findAll(Number(articleId));
    }
}
