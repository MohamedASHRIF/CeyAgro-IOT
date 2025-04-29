import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KafkaContext } from '@nestjs/microservices';
import { DeviceData, DeviceDataDocument } from './schemas/device.schema';
import { NotificationsService } from '../notifications/notifications.service';
import mongoose from 'mongoose';
import { Notification as NotificationInterface } from '../notifications/interfaces/notification.interface';

// @Injectable()
// export class DeviceService {
//   constructor(
//     @InjectModel(DeviceData.name)
//     private deviceDataModel: Model<DeviceDataDocument>,
//   ) {}

//   async processIoTData(data: any, context: KafkaContext) {
//     const topic = context.getTopic();
//     console.log(`Received message from topic ${topic}:`, data);

//     const deviceData = new this.deviceDataModel({
//       name: data.name,
//       temperatureValue: data.temperatureValue,
//       humidityValue: data.humidityValue,
//       location: data.location,
//       isActive: data.isActive ?? true,
//       date: data.date ? new Date(data.date) : new Date(),
//       topic: topic,
//     });

//     await deviceData.save();
//     return { status: 'processed', data: deviceData };
//   }

//   async getDeviceData(name: string) {
//     return this.deviceDataModel.find({ name }).sort({ createdAt: -1 }).exec();
//   }

//   async getLatestDeviceData(name: string) {
//     return this.deviceDataModel
//       .findOne({ name })
//       .sort({ createdAt: -1 })
//       .exec();
//   }
// }

@Injectable()
export class DeviceService implements OnModuleInit {
  constructor(
    @InjectModel(DeviceData.name)
    private deviceDataModel: Model<DeviceDataDocument>,
    private notificationsService: NotificationsService,
  ) {}

<<<<<<<<< Temporary merge branch 1
  async onModuleInit() {
    const changeStream = this.deviceDataModel.watch();
    changeStream.on('change', async (change) => {
      if (change.operationType === 'insert') {
        const device = change.fullDocument;
        console.log('ChangeStream detected new device:', device);
        const notification: NotificationInterface = {
          id: new mongoose.Types.ObjectId().toString(),
          title: 'New Device Added',
          message: `A new device "${device.name}" (ID: ${device._id}) has been added.`,
          userId: device.userId,
          timestamp: new Date().toISOString(),
        };
        console.log('Creating notification:', notification);
        await this.notificationsService.createNotification(notification);
      }
    });
    changeStream.on('error', (error) => {
      console.error('ChangeStream error:', error);
    });
  }

=========
  //Process and store data from kafka
>>>>>>>>> Temporary merge branch 2
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
    return this.deviceDataModel.find({ name }).sort({ createdAt: -1 }).exec();
  }

  //Get most recent data for a device
  async getLatestDeviceData(name: string) {
    return this.deviceDataModel
      .findOne({ name })
      .sort({ createdAt: -1 })
      .exec();
  }
}
