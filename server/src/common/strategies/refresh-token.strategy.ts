import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  JwtPayload,
  JwtPayloadWithRefreshToken,
} from '../interfaces/jwt-payload.interface';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token: string | null = null;
          const req = request as Request & { cookies: Record<string, string> };
          if (req && req.cookies) {
            token = req.cookies['refresh_token'];
          }

          return token;
        },
      ]),
      secretOrKey: configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(request: Request, payload: JwtPayload): JwtPayloadWithRefreshToken {
    const req = request as Request & { cookies: Record<string, string> };
    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken) {
      throw new ForbiddenException('Refresh token not found');
    }

    return { ...payload, refreshToken };
  }
}
