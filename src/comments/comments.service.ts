import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CommentModel } from './models/comments.model';
import { CreateCommentDto } from './dto/createCommentDto';
import { CreateAnswerDto } from './dto/createAnswerDto';
import { Answer } from './models/answers.model';
import { User } from 'src/users';

@Injectable()
export class CommentsService {
    constructor(
        @InjectModel(CommentModel)
        private commentModel: typeof CommentModel,
        @InjectModel(Answer)
        private answerModel: typeof Answer,
    ) {}

    async create(dto: CreateCommentDto): Promise<CommentModel> {
        return this.commentModel.create({
            ...dto,
        });
    }

    async createAnswer(dto: CreateAnswerDto): Promise<Answer> {
        return this.answerModel.create({
            ...dto,
        });
    }

    async findAll(articleId: number): Promise<CommentModel[]> {
        return this.commentModel.findAll<CommentModel>({
            include: [Answer, User],
            where: { articleId },
            order: [['createdAt', 'desc']],
        });
    }
}
