// // device/device.module.ts
// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// import { DeviceService } from './device.service';
// import { DevicesController } from './device.controller';
// import { DeviceData, DeviceDataSchema } from './schemas/device.schema';
// import { NotificationsModule } from '../notifications/notifications.module';
// import { UsersModule } from '../users/users.module';

// @Module({
//   imports: [
//     MongooseModule.forFeature([
//       { name: DeviceData.name, schema: DeviceDataSchema },
//     ]),
//     NotificationsModule,
//     UsersModule,
//   ],
//   controllers: [DevicesController],
//   providers: [DeviceService],
// })
// export class DeviceModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceService } from './device.service';
import { DevicesController } from './device.controller';
import { DeviceData, DeviceDataSchema } from './schemas/device.schema';
import {
  DeviceUser,
  DeviceUserSchema,
} from '../device-user/schemas/device-user.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeviceData.name, schema: DeviceDataSchema },
      { name: DeviceUser.name, schema: DeviceUserSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [DevicesController],
  providers: [DeviceService],
})
export class DeviceModule {}
