import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { TokenService } from 'src/users/services/token.service';

export interface AuthRequest extends Request {
  userId?: number;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly tokenService: TokenService) {}

  use(req: AuthRequest, res: Response, next: NextFunction) {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      throw new HttpException(
        'Missing authorization header',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const accessToken = authorizationHeader.split(' ')[1];
    if (!accessToken) {
      throw new HttpException('Missing access token', HttpStatus.UNAUTHORIZED);
    }

    const userData = this.tokenService.validateAccessToken(accessToken);
    if (!userData) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    req.userId = userData.id;
    next();
  }
}
