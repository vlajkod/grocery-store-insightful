import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUser } from 'src/modules/user/user.types';

export const GetUser = createParamDecorator(async (_data, ctx: ExecutionContext): Promise<CurrentUser> => {
  const req: { user: CurrentUser } = await ctx.switchToHttp().getRequest();
  return req.user;
});
