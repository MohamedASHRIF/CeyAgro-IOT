import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from './schemas/device.schema';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DeviceService {
    constructor(
        @InjectModel(Device.name) private readonly deviceModel: Model<DeviceDocument>,
    ) { }

    async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
        const newDevice = new this.deviceModel(createDeviceDto);
        return newDevice.save();
    }

    async findAll(): Promise<Device[]> {
        return this.deviceModel.find().populate('owner').exec();
    }

    async findOne(id: string): Promise<Device> {
        const device = await this.deviceModel.findById(id).populate('owner').exec();
        if (!device) {
            throw new NotFoundException('Device not found');
        }
        return device;
    }

    async update(id: string, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
        const updatedDevice = await this.deviceModel.findByIdAndUpdate(
            id,
            updateDeviceDto,
            { new: true },
        );
        if (!updatedDevice) {
            throw new NotFoundException('Device not found');
        }
        return updatedDevice;
    }

    async remove(id: string): Promise<Device> {
        const deletedDevice = await this.deviceModel.findByIdAndDelete(id);
        if (!deletedDevice) {
            throw new NotFoundException('Device not found');
        }
        return deletedDevice;
    }

    async findByUserId(userId: string): Promise<Device[]> {
        return this.deviceModel.find({ userId }).exec();
    }

}
