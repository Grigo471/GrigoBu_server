import {
    MiddlewareConsumer,
    Module,
    NestModule,
    RequestMethod,
} from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ArticlesService } from './articles.service';
import { FileService } from 'src/file/file.service';
import { Article } from './models/articles.model';
import { ArticleTag, Tag } from './models/articleTags.model';
import {
    ArticleTextBlock,
    ArticleImageBlock,
    ArticleCodeBlock,
} from './models/articleBlocks.model';
import { TagsController } from './tags.controller';
import { AuthMiddleware } from 'src/middlewares/authMiddleware';
import { OptionalAuthMiddleware } from 'src/middlewares/optionalAuthMiddleware';
import { ArticleRate } from './models/articleRate.model';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users';
import { UserSubscriber } from 'src/users/models/users.model';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
    imports: [
        SequelizeModule.forFeature([
            Article,
            ArticleRate,
            Tag,
            ArticleTag,
            ArticleTextBlock,
            ArticleImageBlock,
            ArticleCodeBlock,
            User,
            UserSubscriber,
        ]),
        UsersModule,
        NotificationsModule,
    ],
    controllers: [ArticlesController, TagsController],
    providers: [ArticlesService, FileService],
})
export class ArticlesModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .forRoutes(
                { path: 'articles', method: RequestMethod.POST },
                { path: 'articles/subscriptions', method: RequestMethod.GET },
                { path: 'articles/:id/rate', method: RequestMethod.POST },
                { path: 'articles/myRate', method: RequestMethod.GET },
            );
        consumer
            .apply(OptionalAuthMiddleware)
            .forRoutes(
                { path: 'articles/:id', method: RequestMethod.GET },
                { path: 'articles', method: RequestMethod.GET },
                { path: 'articles/user/:username', method: RequestMethod.GET },
            );
    }
}
