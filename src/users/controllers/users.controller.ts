import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { User } from '../models/users.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { getProfileDto, UserDto } from '../dto/UserDto';
import { AuthRequest } from 'src/middlewares/authMiddleware';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

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

    @ApiOperation({
        summary: 'Подписка на пользователя с заданным id',
    })
    @Post(':id/subscribe')
    subscribe(
        @Param('id') id: number,
        @Req() req: AuthRequest,
    ): Promise<number> {
        return this.usersService.subscribe(id, req.userId);
    }

    @Delete(':id/unsubscribe')
    unsubscribe(
        @Param('id') id: number,
        @Req() req: AuthRequest,
    ): Promise<number> {
        return this.usersService.unsubscribe(id, req.userId);
    }

    @ApiOperation({
        summary: 'Получение пользователей по заданным фильтрам',
    })
    @ApiResponse({ status: 200, type: [getProfileDto] })
    @Get()
    getUsers(
        @Query('sort') sort: 'rating' | 'createdAt' | 'username',
        @Query('order') order: 'asc' | 'desc',
        @Query('search') search: string,
        @Req() req: AuthRequest,
    ): Promise<getProfileDto[]> {
        return this.usersService.findAll(sort, order, search, req.userId);
    }

    @Get('/subscriptions')
    getSubscriptions(
        @Query('sort') sort: 'rating' | 'createdAt' | 'username',
        @Query('order') order: 'asc' | 'desc',
        @Query('search') search: string,
        @Req() req: AuthRequest,
    ): Promise<getProfileDto[]> {
        return this.usersService.getSubscriptions(
            sort,
            order,
            search,
            req.userId,
        );
    }

    @Get('/subscribers')
    getSubscribers(
        @Query('sort') sort: 'rating' | 'createdAt' | 'username',
        @Query('order') order: 'asc' | 'desc',
        @Query('search') search: string,
        @Req() req: AuthRequest,
    ): Promise<getProfileDto[]> {
        return this.usersService.getSubscribers(
            sort,
            order,
            search,
            req.userId,
        );
    }

    @Get(':username')
    getOneUser(
        @Param('username') username: string,
        @Req() req: AuthRequest,
    ): Promise<getProfileDto> {
        return this.usersService.findOne(username, req.userId);
    }
}
