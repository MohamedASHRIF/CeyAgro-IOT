// import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { KafkaContext } from '@nestjs/microservices';
// import { DeviceData, DeviceDataDocument } from './schemas/device.schema';
// import { NotificationsService } from '../notifications/notifications.service';
// import mongoose from 'mongoose';
// import { Notification as NotificationInterface } from '../notifications/interfaces/notification.interface';

// @Injectable()
// export class DeviceService implements OnModuleInit {
//   private readonly logger = new Logger(DeviceService.name);

//   constructor(
//     @InjectModel(DeviceData.name)
//     private deviceDataModel: Model<DeviceDataDocument>,
//     private notificationsService: NotificationsService,
//   ) {}

//   async onModuleInit() {
//     const changeStream = this.deviceDataModel.watch();

//     changeStream.on('change', async (change) => {
//       if (change.operationType === 'insert') {
//         const device = change.fullDocument;
//         console.log('ChangeStream detected new device:', device);
//         const notification: NotificationInterface = {
//           id: new mongoose.Types.ObjectId().toString(),
//           title: 'New Device Added',
//           message: `A new device "${device.name}" (ID: ${device._id}) has been added.`,
//           userId: device.userId,
//           timestamp: new Date().toISOString(),
//         };
//         console.log('Creating notification:', notification);
//         await this.notificationsService.createNotification(notification);
//       }
//     });

//     changeStream.on('error', (error) => {
//       console.error('ChangeStream error:', error);
//     });
//   }

//   async processIoTData(data: any, context: KafkaContext) {
//     const topic = context.getTopic();
//     this.logger.log(
//       `Received message from topic ${topic}: ${JSON.stringify(data)}`,
//     );

//     try {
//       const deviceData = new this.deviceDataModel({
//         name: data.name,
//         deviceId: data.deviceId, // new field
//         temperatureValue: data.temperatureValue,
//         humidityValue: data.humidityValue,
//         // location: data.location, // remove if not needed
//         isActive: data.isActive ?? true,
//         date: data.date ? new Date(data.date) : new Date(),
//         topic: topic,
//       });

//       await deviceData.save();
//       this.logger.log(`Saved device data for ${data.name} to MongoDB`);
//       return { status: 'processed', data: deviceData };
//     } catch (error) {
//       this.logger.error(
//         `Failed to process IoT data for ${data.name}`,
//         error.stack,
//       );
//       throw new Error(`Failed to save device data: ${error.message}`);
//     }
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

// device.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KafkaContext } from '@nestjs/microservices';
import { DeviceData, DeviceDataDocument } from './schemas/device.schema';
import {
  DeviceUser,
  DeviceUserDocument,
} from '../device-user/schemas/device-user.schema';
import { NotificationsService } from '../notifications/notifications.service';
import mongoose from 'mongoose';
import { Notification as NotificationInterface } from '../notifications/interfaces/notification.interface';

@Injectable()
export class DeviceService implements OnModuleInit {
  private readonly logger = new Logger(DeviceService.name);

  constructor(
    @InjectModel(DeviceData.name)
    private deviceDataModel: Model<DeviceDataDocument>,
    @InjectModel(DeviceUser.name)
    private deviceUserModel: Model<DeviceUserDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async onModuleInit() {
    const changeStream = this.deviceDataModel.watch();

    changeStream.on('change', async (change) => {
      if (change.operationType === 'insert') {
        const device = change.fullDocument;
        this.logger.log(
          `ChangeStream detected new device: ${JSON.stringify(device)}`,
        );

        // Find users associated with the deviceId
        const deviceUsers = await this.deviceUserModel
          .find({ deviceId: device.deviceId })
          .exec();
        if (deviceUsers.length === 0) {
          this.logger.log(`No users found for deviceId: ${device.deviceId}`);
          return;
        }

        // Send notification to each associated user
        for (const deviceUser of deviceUsers) {
          const notification: NotificationInterface = {
            id: new mongoose.Types.ObjectId().toString(),
            title: 'New Device Data Added',
            message: `New data for device "${device.name}" (ID: ${device._id}) has been added.`,
            userId: deviceUser.email, // Use email as userId
            timestamp: new Date().toISOString(),
          };
          this.logger.log(
            `Creating notification for user ${deviceUser.email}: ${notification.id}`,
          );
          await this.notificationsService.createNotification(notification);
        }
      }
    });

    changeStream.on('error', (error) => {
      this.logger.error('ChangeStream error:', error);
    });
  }

  async processIoTData(data: any, context: KafkaContext) {
    const topic = context.getTopic();
    this.logger.log(
      `Received message from topic ${topic}: ${JSON.stringify(data)}`,
    );

    try {
      // Find user(s) associated with the deviceId
      const deviceUsers = await this.deviceUserModel
        .find({ deviceId: data.deviceId })
        .exec();
      const userId = deviceUsers.length > 0 ? deviceUsers[0].email : undefined;

      const deviceData = new this.deviceDataModel({
        name: data.name,
        deviceId: data.deviceId,
        temperatureValue: data.temperatureValue,
        humidityValue: data.humidityValue,
        isActive: data.isActive ?? true,
        date: data.date ? new Date(data.date) : new Date(),
        topic: topic,
        userId, // Add userId if found
      });

      await deviceData.save();
      this.logger.log(`Saved device data for ${data.name} to MongoDB`);
      return { status: 'processed', data: deviceData };
    } catch (error) {
      this.logger.error(
        `Failed to process IoT data for ${data.name}`,
        error.stack,
      );
      throw new Error(`Failed to save device data: ${error.message}`);
    }
  }

  async getDeviceData(name: string) {
    return this.deviceDataModel.find({ name }).sort({ createdAt: -1 }).exec();
  }

  async getLatestDeviceData(name: string) {
    return this.deviceDataModel
      .findOne({ name })
      .sort({ createdAt: -1 })
      .exec();
  }
}
