import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { User } from '../models/users.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserDto } from '../dto/UserDto';
import { AuthRequest } from 'src/middlewares/authMiddleware';
import { Notification } from '../models/notification.model';
import { getUserInterface } from '../types/types';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  updateAvatar(
    @Req() req: AuthRequest,
    @UploadedFile() avatar,
  ): Promise<string> {
    return this.usersService.updateAvatar(req.userId, avatar);
  }

  @Patch('/status')
  updateStatus(@Body() dto: UserDto): Promise<User> {
    return this.usersService.updateStatus(dto);
  }

  @Post(':id/subscribe')
  subscribe(
    @Param('id') id: number,
    @Req() req: AuthRequest,
  ): Promise<boolean> {
    return this.usersService.subscribe(id, req.userId);
  }

  @Delete(':id/unsubscribe')
  unsubscribe(
    @Param('id') id: number,
    @Req() req: AuthRequest,
  ): Promise<boolean> {
    return this.usersService.unsubscribe(id, req.userId);
  }

  @Post('/notifications')
  viewNotifications(@Req() req: AuthRequest): Promise<Notification[]> {
    return this.usersService.viewNotifications(req.userId);
  }

  @Get()
  getUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':username')
  getOneUser(
    @Param('username') username: string,
    @Req() req: AuthRequest,
  ): Promise<getUserInterface> {
    return this.usersService.findOne(username, req.userId);
  }
}
