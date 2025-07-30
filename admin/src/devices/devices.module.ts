import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceService } from './devices.service';
import { DeviceController } from './devices.controller';
import { Device, DeviceSchema } from './schemas/device.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }])],
    controllers: [DeviceController],
    providers: [DeviceService],
})
export class DeviceModule { }
