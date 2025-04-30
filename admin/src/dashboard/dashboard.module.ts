import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Device, DeviceSchema } from '../devices/schemas/device.schema';

@Module({
    imports: [

        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

        MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
