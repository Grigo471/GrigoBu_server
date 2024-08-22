import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CommentModel } from './models/comments.model';
import { CreateCommentDto } from './dto/createCommentDto';
import { CreateAnswerDto } from './dto/createAnswerDto';
import { Answer } from './models/answers.model';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(CommentModel)
    private commentModel: typeof CommentModel,
    @InjectModel(Answer)
    private answerModel: typeof Answer,
  ) {}

  async create(dto: CreateCommentDto): Promise<CommentModel[]> {
    try {
      await this.commentModel.create({
        ...dto,
      });

      const comments = await this.commentModel.findAll({
        where: {
          articleId: dto.articleId,
        },
        include: [Answer],
      });

      return comments;
    } catch (error) {
      console.log(error);
    }
  }

  async createAnswer(dto: CreateAnswerDto): Promise<Answer[]> {
    try {
      this.answerModel.create({
        ...dto,
      });

      const answers = await this.answerModel.findAll({
        where: {
          commentId: dto.commentId,
        },
      });

      return answers;
    } catch (error) {
      console.log(error);
    }
  }

  async findAll(): Promise<CommentModel[]> {
    return this.commentModel.findAll<CommentModel>({ include: [Answer] });
  }
}
