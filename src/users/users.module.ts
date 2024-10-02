import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User, UserSubscriber } from './models/users.model';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { AuthController } from './controllers/auth.controller';
import { Token } from './models/token.model';
import { FileService } from 'src/file';
import { UserSettings } from './models/userSettings';
import { AuthMiddleware } from 'src/middlewares/authMiddleware';
import { Notification } from './models/notification.model';
import { OptionalAuthMiddleware } from 'src/middlewares/optionalAuthMiddleware';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      UserSubscriber,
      Token,
      UserSettings,
      Notification,
    ]),
  ],
  exports: [TokenService],
  controllers: [UsersController, AuthController],
  providers: [UsersService, AuthService, TokenService, FileService],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'users', method: RequestMethod.GET },
        { path: 'users/:username', method: RequestMethod.GET },
      )
      .forRoutes(UsersController);
    consumer
      .apply(OptionalAuthMiddleware)
      .forRoutes({ path: 'users/:username', method: RequestMethod.GET });
  }
}
