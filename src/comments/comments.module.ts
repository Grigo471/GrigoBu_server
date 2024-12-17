import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommentModel } from './models/comments.model';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Answer } from './models/answers.model';

@Module({
    imports: [SequelizeModule.forFeature([CommentModel, Answer])],
    controllers: [CommentsController],
    providers: [CommentsService],
})
export class CommentsModule {}
