// // src/main.ts
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   // Enable CORS for your frontend
//   app.enableCors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true,
//   });

//   await app.listen(3001); // Use a different port than your NextJS app
// }
// bootstrap();

// --------------------------------

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import * as express from 'express';
// import { expressjwt } from 'express-jwt';

// import * as jwksRsa from 'jwks-rsa';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   const appExpress = app.getHttpAdapter().getInstance();

//   appExpress.use(
//     expressjwt({
//       secret: jwksRsa.expressJwtSecret({
//         cache: true,
//         rateLimit: true,
//         jwksRequestsPerMinute: 5,
//         jwksUri: `https://dev-qd6kxifl4h1xzmzw.us.auth0.com/.well-known/jwks.json`,
//       }),
//       audience: 'https://nestjs.demo.com',
//       issuer: `https://dev-qd6kxifl4h1xzmzw.us.auth0.com/`,
//       algorithms: ['RS256'],
//     }).unless({ path: ['/'] }),
//   );

//   await app.listen(3001);
// }
// bootstrap();

//------------------------------
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { expressjwt } from 'express-jwt';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });

  app.use(cookieParser());

  // JWT middleware with public routes
  app.use(
    expressjwt({
      secret:
        configService.get<string>('AUTH0_CLIENT_SECRET') || 'fallback-secret',
      issuer: `https://${configService.get<string>('AUTH0_DOMAIN')}/`,
      algorithms: ['HS256'],
    }).unless({
      path: ['/auth/login', '/auth/confirm-subscription'],
    }),
  );

  await app.listen(3001);
}
bootstrap();
