import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadWithRefreshToken } from '../interfaces/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (
    data: keyof JwtPayloadWithRefreshToken | undefined,
    context: ExecutionContext,
  ) => {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: JwtPayloadWithRefreshToken }>();

    const user = request.user;
    if (!user) return null;

    if (!data) return user;

    return user[data];
  },
);
