import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KafkaContext } from '@nestjs/microservices';
import { DeviceData } from './schemas/device.schema';

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel(DeviceData.name) private deviceDataModel: Model<DeviceData>,
  ) {}

  async processIoTData(data: any, context: KafkaContext) {
    const topic = context.getTopic();
    console.log(`Received message from topic ${topic}:`, data);

    const deviceData = new this.deviceDataModel({
      deviceId: data.deviceId,
      status: data.status || 'active',
      data: data,
      topic: topic,
    });

    await deviceData.save();
    return { status: 'processed', data: deviceData };
  }

  async getDeviceData(deviceId: string) {
    return this.deviceDataModel
      .find({ deviceId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getLatestDeviceData(deviceId: string) {
    return this.deviceDataModel
      .findOne({ deviceId })
      .sort({ createdAt: -1 })
      .exec();
  }
}