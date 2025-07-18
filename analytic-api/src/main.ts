import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { kafkaConfig } from './config/kafka.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000'],// Your Next.js frontend
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });

  // Top-level logging middleware
  app.use((req, res, next) => {
    console.log('INCOMING REQUEST:', req.method, req.url, req.query, req.body);
    next();
  });

  // Set up global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Connect Kafka microservice
  // app.connectMicroservice(kafkaConfig)
  // await app.startAllMicroservices();
  
  const port = process.env.PORT|| 3003;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();