import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { kafkaConfig } from './config/kafka.config';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));

  //  Connect Kafka microservice
  //app.connectMicroservice(kafkaConfig);



  app.enableCors();
  // Start all MicroServices
  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
