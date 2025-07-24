import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { kafkaConfig } from './config/kafka.config';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   app.setGlobalPrefix('device-api');
  //  Connect Kafka microservice
    // app.connectMicroservice(kafkaConfig);

  //image handling
app.use(
  '/uploads',
  express.static(join(process.cwd(), 'uploads'), {
    maxAge: '1d',
    setHeaders: (res, path) => {
      if (path.endsWith('.jpg')) res.setHeader('Content-Type', 'image/jpeg');
      else if (path.endsWith('.png')) res.setHeader('Content-Type', 'image/png');
      else if (path.endsWith('.gif')) res.setHeader('Content-Type', 'image/gif');
      else if (path.endsWith('.webp')) res.setHeader('Content-Type', 'image/webp');
    },
  }),
);

  app.enableCors();
  // Start all MicroServices
  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3001);
}
bootstrap();

