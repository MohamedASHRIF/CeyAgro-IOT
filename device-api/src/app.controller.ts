import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    console.log('KAFKA_BROKER > ', process.env.KAFKA_BROKER);
    console.log('KAFKA_USER > ', process.env.KAFKA_USER);
    return this.appService.getHello();
  }
}
