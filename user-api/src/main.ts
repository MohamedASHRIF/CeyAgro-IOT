
//  //..........................

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ConfigService } from '@nestjs/config';
// import { ValidationPipe } from '@nestjs/common';
// import { expressjwt } from 'express-jwt';
// import * as cookieParser from 'cookie-parser';
// import { NestExpressApplication } from '@nestjs/platform-express';
// import { join } from 'path';
// import * as express from 'express';

// async function bootstrap() {
//   const app = await NestFactory.create<NestExpressApplication>(AppModule);
//   const configService = app.get(ConfigService);

//   // Enable CORS with specific configuration
//   app.enableCors({
//    origin: ['http://localhost:3000'],
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//     credentials: true,
//     allowedHeaders: 'Content-Type, Authorization',
//   });

//   // Enable global validation pipes
//   app.useGlobalPipes(new ValidationPipe());

//   // Enable cookie parser
//   app.use(cookieParser());

//   // Add static file serving for uploads
//   const uploadsPath = join(process.cwd(), 'uploads');
//   console.log('Serving static files from:', uploadsPath);
  
//   // Serve uploads folder - this should come BEFORE JWT middleware
//   app.use('/uploads', express.static(uploadsPath, {
//     maxAge: '1d', // Cache for 1 day
//     etag: false,
//     setHeaders: (res, path) => {
//       // Set proper headers for images
//       if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
//         res.setHeader('Content-Type', 'image/jpeg');
//       } else if (path.endsWith('.png')) {
//         res.setHeader('Content-Type', 'image/png');
//       } else if (path.endsWith('.gif')) {
//         res.setHeader('Content-Type', 'image/gif');
//       } else if (path.endsWith('.webp')) {
//         res.setHeader('Content-Type', 'image/webp');
//       }
//     }
//   }));

//   // JWT middleware with public routes (including uploads)
//   app.use(
//     expressjwt({
//       secret:
//         configService.get<string>('AUTH0_CLIENT_SECRET') || 'fallback-secret',
//       issuer: `https://${configService.get<string>('AUTH0_DOMAIN')}/`,
//       algorithms: ['HS256'],
//     }).unless({
//       path: [
//         '/auth/login', 
//         '/auth/confirm-subscription',
//         // User profile routes
//         /^\/user\/profile.*/,
//         /^\/uploads\/.*/,
//        //  /^\/user\/id-by-email.*/,
//       ],
//     }),
//   );

//   // Use port 3001 
//   await app.listen(3001);
//   console.log(`Application is running on: http://localhost:3001`);
//   console.log('Images accessible at: http://localhost:3001/uploads/filename.jpg');
// }
// bootstrap();








import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { expressjwt } from 'express-jwt';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS with specific configuration
  app.enableCors({
   origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });

  // Enable global validation pipes
  app.useGlobalPipes(new ValidationPipe());

  // Enable cookie parser
  app.use(cookieParser());

  // Add static file serving for uploads
  //const uploadsPath = join(process.cwd(), 'uploads');
  //console.log('Serving static files from:', uploadsPath);
  
  // Serve uploads folder - this should come BEFORE JWT middleware
  /*app.use('/uploads', express.static(uploadsPath, {
    maxAge: '1d', // Cache for 1 day
    etag: false,
    setHeaders: (res, path) => {
      // Set proper headers for images
      if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (path.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (path.endsWith('.gif')) {
        res.setHeader('Content-Type', 'image/gif');
      } else if (path.endsWith('.webp')) {
        res.setHeader('Content-Type', 'image/webp');
      }
    }
  }));*/

  // JWT middleware with public routes (including uploads)
  app.use(
    expressjwt({
      secret:
        configService.get<string>('AUTH0_CLIENT_SECRET') || 'fallback-secret',
      issuer: `https://${configService.get<string>('AUTH0_DOMAIN')}/`,
      algorithms: ['HS256'],
    }).unless({
      path: [
        '/auth/login', 
        '/auth/confirm-subscription',
        // User profile routes
        /^\/user\/profile.*/,
        /^\/uploads\/.*/,
       //  /^\/user\/id-by-email.*/,
      ],
    }),
  );

  // Use port 3001 
  await app.listen(3001);
  console.log(`Application is running on: http://localhost:3001`);
  //console.log('Images accessible at: http://localhost:3001/uploads/filename.jpg');
}
bootstrap();
