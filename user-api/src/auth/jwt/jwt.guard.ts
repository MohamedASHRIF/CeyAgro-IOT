// src/auth/jwt.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { auth } from 'express-oauth2-jwt-bearer';
import { promisify } from 'util';

@Injectable()
export class JwtGuard implements CanActivate {
  private authorizeMiddleware = auth({
    audience: 'https://nestjs.demo.com',
    issuerBaseURL: 'https://dev-qd6kxifl4h1xzmzw.us.auth0.com/',
    tokenSigningAlg: 'RS256',
  });

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    try {
      const promisifiedMiddleware = promisify(this.authorizeMiddleware);
      await promisifiedMiddleware(request, response);
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
