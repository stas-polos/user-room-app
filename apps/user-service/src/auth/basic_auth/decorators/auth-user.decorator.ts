import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatableInterface } from '../interfaces';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatableInterface => {
    const { user } = ctx.switchToHttp().getRequest();
    return user;
  },
);
