import {
  Body,
  Controller,
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

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  updateAvatar(@Req() req: AuthRequest, @UploadedFile() avatar): Promise<User> {
    return this.usersService.updateAvatar(req.userId, avatar);
  }

  @Patch('/status')
  updateStatus(@Body() dto: UserDto): Promise<User> {
    return this.usersService.updateStatus(dto);
  }

  @Post(':id/subscribe')
  subscribe(@Param('id') id: number, @Req() req: AuthRequest): Promise<User[]> {
    return this.usersService.subscribe(id, req.userId);
  }

  @Get()
  getUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }
}
