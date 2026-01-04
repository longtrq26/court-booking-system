import { UserRole } from '../enums/user/user-role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export type JwtPayloadWithRefreshToken = JwtPayload & { refreshToken: string };
