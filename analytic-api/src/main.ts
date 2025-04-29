import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';
import { kafkaConfig } from './config/kafka.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000', 'http://192.168.1.6:3000'],// Your Next.js frontend
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });


  // Connect Kafka microservice
  app.connectMicroservice(kafkaConfig)
  await app.startAllMicroservices();
  
  const port = process.env.PORT || '0.0.0.0';
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();