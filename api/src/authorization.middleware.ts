import { Injectable, NestMiddleware } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common/exceptions/unauthorized.exception";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
  constructor() { }

  use(req: Request, res: Response, next: NextFunction) {
    const token = process.env.BEARER_TOKEN;
    const authHeader: string | undefined = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ') && authHeader.slice(7) === token) {
      next();
    } else {
      throw new UnauthorizedException();
    }
  }
}