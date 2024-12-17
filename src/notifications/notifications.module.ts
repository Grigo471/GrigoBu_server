import {
    forwardRef,
    MiddlewareConsumer,
    Module,
    NestModule,
} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { NotificationModel } from './models/notification.model';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './controllers/notifications.controller';
import { AuthMiddleware } from 'src/middlewares/authMiddleware';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        SequelizeModule.forFeature([NotificationModel]),
        forwardRef(() => UsersModule),
    ],
    exports: [NotificationsService],
    controllers: [NotificationsController],
    providers: [NotificationsService],
})
export class NotificationsModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes(NotificationsController);
    }
}
