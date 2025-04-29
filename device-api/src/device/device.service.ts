import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KafkaContext } from '@nestjs/microservices';
import { DeviceData, DeviceDataDocument } from './schemas/device.schema';

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel(DeviceData.name) private deviceDataModel: Model<DeviceDataDocument>,
  ) {}

  //Process and store data from kafka
  async processIoTData(data: any, context: KafkaContext) {
    const topic = context.getTopic();
    console.log(`Received message from topic ${topic}:`, data);

    const deviceData = new this.deviceDataModel({
      name: data.name,
      temperatureValue: data.temperatureValue,
      humidityValue: data.humidityValue,
      location: data.location,
      isActive: data.isActive ?? true,
      date: data.date ? new Date(data.date) : new Date(),
      topic: topic,
    });

    await deviceData.save();
    return { status: 'processed', data: deviceData };
  }

  //Retrieve data 
  async getDeviceData(name: string) {
    return this.deviceDataModel
      .find({ name })
      .sort({ createdAt: -1 })
      .exec();
  }

  //Get most recent data for a device
  async getLatestDeviceData(name: string) {
    return this.deviceDataModel
      .findOne({ name })
      .sort({ createdAt: -1 })
      .exec();
  }
}