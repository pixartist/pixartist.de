import { ExecutionContext, createParamDecorator } from '@nestjs/common';

// nestjs parameter decorator that extracts the user object from the current express request
export const Auth = createParamDecorator((data: any, req: ExecutionContext) => {
  return req.getArgs()[0].user;
});
