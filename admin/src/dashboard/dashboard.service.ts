import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Device } from '../devices/schemas/device.schema';

@Injectable()
export class DashboardService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Device.name) private readonly deviceModel: Model<Device>,
    ) { }


    async getStats() {

        const totalUsers = await this.userModel.countDocuments();


        const totalDevices = await this.deviceModel.countDocuments();


        const activeDevices = await this.deviceModel.countDocuments({ status: 'active' });


        const inactiveDevices = await this.deviceModel.countDocuments({ status: 'inactive' });


        return {
            totalUsers,
            totalDevices,
            activeDevices,
            inactiveDevices,
        };
    }
}
