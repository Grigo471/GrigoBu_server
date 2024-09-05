import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { TokenService } from 'src/users/services/token.service';
import { AuthRequest } from './authMiddleware';

@Injectable()
export class OptionalAuthMiddleware implements NestMiddleware {
  constructor(private readonly tokenService: TokenService) {}

  use(req: AuthRequest, res: Response, next: NextFunction) {
    const authorizationHeader = req.headers.authorization;
    if (authorizationHeader) {
      const accessToken = authorizationHeader.split(' ')[1];
      if (accessToken) {
        const userData = this.tokenService.validateAccessToken(accessToken);
        if (userData) {
          req.userId = userData.id;
        }
      }
    }

    next();
  }
}
