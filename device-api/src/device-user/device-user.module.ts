// src/device-user/device-user.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceUserService } from './device-user.service';
import { DeviceUserController } from './device-user.controller';
import { DeviceUser, DeviceUserSchema } from './schemas/device-user.schema';
import { DeviceData, DeviceDataSchema } from 'src/device/schemas/device.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { ActivityLogModule } from 'src/activity-log/act-log.module';// Import ActivityLogModule
import { DeviceType,DeviceTypeSchema } from 'src/deviceTypes/deviceTypes.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeviceUser.name, schema: DeviceUserSchema },
      { name: DeviceData.name, schema: DeviceDataSchema },
    { name: DeviceType.name, schema: DeviceTypeSchema },
    ]),
    NotificationsModule,
    ActivityLogModule, // Add ActivityLogModule to imports
  ],
  controllers: [DeviceUserController],
  providers: [DeviceUserService],
  exports: [DeviceUserService], // Export in case other modules need it
})
export class DeviceUserModule {}