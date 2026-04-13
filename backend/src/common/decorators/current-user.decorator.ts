import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestContext } from '../../shared/interfaces';

export const CurrentUser = createParamDecorator(
  (data: keyof RequestContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as RequestContext;
    return data ? user[data] : user;
  },
);
