import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceModule } from './device/device.module';
import { DeviceUserModule } from './device-user/device-user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI), // MongoDB connection
    DeviceModule,
    DeviceUserModule
  ],
  controllers: [AppController], // Register the controller here
  providers: [AppService]
})
export class AppModule {}