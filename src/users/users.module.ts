import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    SequelizeModule.forFeature([User, UserSubscriber, Token, UserSettings]),
  ],
  controllers: [UsersController, AuthController],
  providers: [UsersService, AuthService, TokenService, FileService],
})
export class UsersModule {}
