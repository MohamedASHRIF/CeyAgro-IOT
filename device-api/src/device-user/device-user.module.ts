import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceUserService } from './device-user.service';
import { DeviceUserController } from './device-user.controller';
import { DeviceUser, DeviceUserSchema } from './schemas/device-user.schema';
import { DeviceData,DeviceDataSchema } from 'src/device/schemas/device.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeviceUser.name, schema: DeviceUserSchema },
      { name: DeviceData.name, schema: DeviceDataSchema },
    ]),
  ],
  controllers: [DeviceUserController],
  providers: [DeviceUserService],
})
export class DeviceUserModule {}
