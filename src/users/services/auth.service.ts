import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '../models/users.model';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { TokenService } from './token.service';
import { UserSettings } from '../models/userSettings';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(UserSettings)
    private userSettingsModel: typeof UserSettings,
    private tokenService: TokenService,
  ) {}

  async registration(username: string, password: string) {
    const candidate = await this.userModel.findOne({ where: { username } });
    if (candidate) {
      throw new HttpException(
        `User ${username} already exists`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashPassword = await bcrypt.hash(password, 3);

    const user = await this.userModel.create({
      username,
      password: hashPassword,
    });

    await this.userSettingsModel.create({ userId: user.id });

    const tokens = this.tokenService.generateTokens({
      username: user.username,
      id: user.id,
    });
    await this.tokenService.saveToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user,
    };
  }

  async login(username: string, password: string) {
    const user = await this.userModel.findOne({
      where: { username },
      include: [UserSettings],
    });
    if (!user) {
      throw new HttpException(
        `User ${username} not found`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const isPasswordEquals = await bcrypt.compare(password, user.password);
    if (!isPasswordEquals) {
      throw new HttpException(`Wrong password`, HttpStatus.BAD_REQUEST);
    }
    const tokens = this.tokenService.generateTokens({ id: user.id, username });
    await this.tokenService.saveToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user,
    };
  }

  async logout(refreshToken: string) {
    const token = await this.tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new HttpException('No refresh token', HttpStatus.UNAUTHORIZED);
    }
    const userData = this.tokenService.validateRefreshToken(refreshToken);
    const DBtoken = await this.tokenService.findToken(refreshToken);

    if (!userData || !DBtoken) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.userModel.scope('withoutPassword').findOne({
      where: { username: userData.username },
    });

    if (!user) {
      throw new HttpException(
        `User ${userData.username} not found`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const tokens = this.tokenService.generateTokens({
      id: user.id,
      username: user.username,
    });
    await this.tokenService.saveToken(user.id, tokens.refreshToken);

    return {
      user,
      ...tokens,
    };
  }
}
