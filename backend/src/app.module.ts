import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DeviceModule } from './device/device.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DeviceModule,
  ],
})
export class AppModule {}