import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Token } from '../models/token.model';
import * as jwt from 'jsonwebtoken';
import {
    ACCESS_TOKEN_AGE_STRING,
    REFRESH_TOKEN_AGE_STRING,
} from '../consts/authConsts';
import { UserRole } from '../types/types';

export interface TokenPayload {
    id: number;
    username: string;
    role: UserRole;
}

export interface GenerateTokenResult {
    refreshToken: string;
    accessToken: string;
}

@Injectable()
export class TokenService {
    constructor(
        @InjectModel(Token)
        private tokenModel: typeof Token,
    ) {}

    generateTokens(payload: TokenPayload): GenerateTokenResult {
        const accessToken = jwt.sign(
            payload,
            process.env.JWT_ACCESS_SECRET as jwt.Secret,
            { expiresIn: ACCESS_TOKEN_AGE_STRING },
        );
        const refreshToken = jwt.sign(
            payload,
            process.env.JWT_REFRESH_SECRET as jwt.Secret,
            { expiresIn: REFRESH_TOKEN_AGE_STRING },
        );

        return {
            accessToken,
            refreshToken,
        };
    }

    validateAccessToken(accessToken: string) {
        try {
            const userData = jwt.verify(
                accessToken,
                process.env.JWT_ACCESS_SECRET as jwt.Secret,
            );
            return userData as TokenPayload;
        } catch (error) {
            return null;
        }
    }

    validateRefreshToken(refreshToken: string) {
        try {
            const userData = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET as jwt.Secret,
            );
            return userData as TokenPayload;
        } catch (error) {
            return null;
        }
    }

    async saveToken(userId: number, refreshToken: string) {
        const tokenData = await this.tokenModel.findOne({ where: { userId } });

        if (tokenData) {
            tokenData.token = refreshToken;
            return tokenData.save();
        }

        const token = await this.tokenModel.create({
            userId,
            token: refreshToken,
        });
        return token;
    }

    async removeToken(refreshToken: string) {
        const token = await this.tokenModel.destroy({
            where: { token: refreshToken },
        });
        return token;
    }

    async findToken(refreshToken: string) {
        const token = await this.tokenModel.findOne({
            where: { token: refreshToken },
        });
        return token;
    }
}
