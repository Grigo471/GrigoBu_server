import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Request, Response } from 'express';
import { CreateUserDto } from '../dto/CreateUserDto';
import { ApiTags } from '@nestjs/swagger';
import { REFRESH_TOKEN_AGE_MILLISECONDS } from '../consts/authConsts';

@ApiTags('Авторизация')
@Controller('/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('/registration')
    async registration(
        @Body() createUserDto: CreateUserDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const userData = await this.authService.registration(createUserDto);
        res.cookie('refreshToken', userData.refreshToken, {
            maxAge: REFRESH_TOKEN_AGE_MILLISECONDS,
            httpOnly: true,
        });
        return userData;
    }

    @Post('/login')
    async login(
        @Body() createUserDto: CreateUserDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const userData = await this.authService.login(createUserDto);
        res.cookie('refreshToken', userData.refreshToken, {
            maxAge: REFRESH_TOKEN_AGE_MILLISECONDS,
            httpOnly: true,
        });
        return userData;
    }

    @Post('/logout')
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { refreshToken } = req.cookies;
        const token = await this.authService.logout(refreshToken);
        res.clearCookie('refreshToken');
        return token;
    }

    @Get('/refresh')
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { refreshToken } = req.cookies;
        const userData = await this.authService.refresh(refreshToken);
        res.cookie('refreshToken', userData.refreshToken, {
            maxAge: REFRESH_TOKEN_AGE_MILLISECONDS,
            httpOnly: true,
        });
        return userData;
    }
}
