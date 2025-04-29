import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceData, DeviceDataSchema } from './schemas/device.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeviceData.name, schema: DeviceDataSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}
