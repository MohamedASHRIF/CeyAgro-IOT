// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { auth } from 'express-oauth2-jwt-bearer';
// import { promisify } from 'util';
// import { authConfig } from '../../config/auth.config';

// @Injectable()
// export class JwtGuard implements CanActivate {
//   private authorizeMiddleware = auth({
//     audience: authConfig.auth0.audience,
//     issuerBaseURL: authConfig.auth0.issuerBaseURL,
//     tokenSigningAlg: authConfig.auth0.tokenSigningAlg,
//   });

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const httpContext = context.switchToHttp();
//     const request = httpContext.getRequest();
//     const response = httpContext.getResponse();

//     try {
//       const promisifiedMiddleware = promisify(this.authorizeMiddleware);
//       await promisifiedMiddleware(request, response);
//       return true;
//     } catch (error) {
//       throw new UnauthorizedException('Invalid token');
//     }
//   }
// }
