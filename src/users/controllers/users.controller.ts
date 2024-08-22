import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { User } from '../models/users.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserDto } from '../dto/UserDto';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  updateAvatar(@Param('id') id: number, @UploadedFile() avatar): Promise<User> {
    return this.usersService.updateAvatar(id, avatar);
  }

  @Patch('/status')
  updateStatus(@Body() dto: UserDto): Promise<User> {
    return this.usersService.updateStatus(dto);
  }

  /**
   TODO: AuthMiddleware
   */
  @Post(':id/subscribe')
  subscribe(@Param('id') id: number, @Body() dto: UserDto): Promise<User[]> {
    return this.usersService.subscribe(id, dto.id);
  }

  @Get()
  getUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }
}
