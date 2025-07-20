// // device.service.ts
// import { Injectable, Logger, BadRequestException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { DeviceData, DeviceDataDocument } from './schemas/device.schema';
// import { NotificationsService } from '../notifications/notifications.service';
// import { UsersService } from '../users/users.service';
// import { KafkaContext } from '@nestjs/microservices';

// @Injectable()
// export class DeviceService {
//   private readonly logger = new Logger(DeviceService.name);

//   constructor(
//     @InjectModel(DeviceData.name)
//     private deviceDataModel: Model<DeviceDataDocument>,
//     private readonly notificationsService: NotificationsService,
//     private readonly usersService: UsersService,
//   ) {}

//   async processIoTData(data: any, context: KafkaContext) {
//     const topic = context.getTopic();
//     this.logger.log(
//       `Received message from topic ${topic}: ${JSON.stringify(data)}`,
//     );

//     try {
//       // Handle userId - if it's missing, undefined, null, or "unknown", use default
//       let userId = data.userId;
//       if (
//         !userId ||
//         userId === 'unknown' ||
//         userId === 'undefined' ||
//         userId === 'null'
//       ) {
//         userId = 'test@example.com';
//       }

//       // Only validate email if userId is provided and not a default
//       if (userId !== 'test@example.com' && !this.isValidEmail(userId)) {
//         throw new BadRequestException(
//           `Invalid email format for userId: ${userId}`,
//         );
//       }

//       // Try to ensure user exists, but don't fail if it doesn't work
//       try {
//         await this.usersService.ensureUserExists(userId);
//       } catch (userError) {
//         this.logger.warn(`Failed to ensure user exists: ${userError.message}`);
//         // Continue anyway - don't fail the whole request
//       }

//       const deviceData = new this.deviceDataModel({
//         deviceId: data.deviceId,
//         temperatureValue: data.temperatureValue,
//         humidityValue: data.humidityValue,
//         isActive: data.isActive ?? true,
//         date: data.date ? new Date(data.date) : new Date(),
//         topic: topic,
//         userId,
//       });

//       await deviceData.save();
//       this.logger.log(
//         `Saved device data for deviceId ${data.deviceId} to MongoDB`,
//       );

//       // Try to create notification, but don't fail if it doesn't work
//       try {
//         await this.notificationsService.createNotification({
//           title: 'New Device Added',
//           message: `Device ${data.deviceId} has been added with temperature ${data.temperatureValue}°C and humidity ${data.humidityValue}%.`,
//           userId,
//         });
//       } catch (notificationError) {
//         this.logger.warn(
//           `Failed to create notification: ${notificationError.message}`,
//         );
//         // Continue anyway - don't fail the whole request
//       }

//       return { status: 'processed', data: deviceData };
//     } catch (error) {
//       this.logger.error(
//         `Failed to process IoT data for deviceId ${data.deviceId}`,
//         error.stack,
//       );
//       throw new Error(`Failed to save device data: ${error.message}`);
//     }
//   }

//   private isValidEmail(email: string): boolean {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   }

//   async getDeviceData(deviceId: string) {
//     return this.deviceDataModel
//       .find({ deviceId })
//       .sort({ createdAt: -1 })
//       .exec();
//   }

//   async getLatestDeviceData(deviceId: string) {
//     return this.deviceDataModel
//       .findOne({ deviceId })
//       .sort({ createdAt: -1 })
//       .exec();
//   }
// }

// //hari eka
// import { Injectable, Logger, BadRequestException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { DeviceData, DeviceDataDocument } from './schemas/device.schema';
// import {
//   DeviceUser,
//   DeviceUserDocument,
// } from '../device-user/schemas/device-user.schema';
// import { NotificationsService } from '../notifications/notifications.service';
// import { KafkaContext } from '@nestjs/microservices';

// @Injectable()
// export class DeviceService {
//   private readonly logger = new Logger(DeviceService.name);

//   constructor(
//     @InjectModel(DeviceData.name)
//     private deviceDataModel: Model<DeviceDataDocument>,
//     @InjectModel(DeviceUser.name)
//     private deviceUserModel: Model<DeviceUserDocument>,
//     private readonly notificationsService: NotificationsService,
//   ) {}

//   async processIoTData(data: any, context: KafkaContext) {
//     const topic = context.getTopic();
//     this.logger.log(
//       `Received message from topic ${topic}: ${JSON.stringify(data)}`,
//     );

//     try {
//       // Validate deviceId
//       if (!data.deviceId) {
//         throw new BadRequestException('deviceId is required');
//       }

//       // Fetch DeviceUser by deviceId only
//       const deviceUser = await this.deviceUserModel
//         .findOne({ deviceId: data.deviceId })
//         .exec();

//       // Determine userId
//       let userId: string;
//       if (deviceUser) {
//         userId = deviceUser.email;
//         this.logger.log(
//           `Found DeviceUser with userId: ${userId} for deviceId: ${data.deviceId}`,
//         );
//       } else {
//         this.logger.warn(`No DeviceUser found for deviceId: ${data.deviceId}`);
//         // Fallback to data.userId if provided and valid, otherwise use default
//         userId =
//           data.userId && this.isValidEmail(data.userId)
//             ? data.userId
//             : 'test@example.com';
//         this.logger.log(
//           `Using userId: ${userId} (from ${data.userId ? 'Kafka message' : 'default'})`,
//         );
//       }

//       // Validate email format
//       if (!this.isValidEmail(userId)) {
//         throw new BadRequestException(
//           `Invalid email format for userId: ${userId}`,
//         );
//       }

//       const deviceData = new this.deviceDataModel({
//         deviceId: data.deviceId,
//         temperatureValue: data.temperatureValue,
//         humidityValue: data.humidityValue,
//         isActive: data.isActive ?? true,
//         date: data.date ? new Date(data.date) : new Date(),
//         topic: topic,
//         userId,
//       });

//       // Check thresholds if DeviceUser exists
//       if (deviceUser) {
//         const deviceTypes = deviceUser.deviceTypes || [];
//         for (const deviceType of deviceTypes) {
//           if (
//             deviceType.type === 'temperature' &&
//             data.temperatureValue !== undefined
//           ) {
//             if (
//               data.temperatureValue < deviceType.minValue ||
//               data.temperatureValue > deviceType.maxValue
//             ) {
//               await this.notificationsService.createNotification({
//                 title: 'Temperature Threshold Violation',
//                 message: `Device ${data.deviceId} temperature (${data.temperatureValue}°C) is outside the allowed range (${deviceType.minValue}°C - ${deviceType.maxValue}°C).`,
//                 userId,
//                 timestamp: new Date().toISOString(),
//               });
//               this.logger.log(
//                 `Sent temperature threshold violation notification for userId: ${userId}`,
//               );
//             }
//           }
//           if (
//             deviceType.type === 'humidity' &&
//             data.humidityValue !== undefined
//           ) {
//             if (
//               data.humidityValue < deviceType.minValue ||
//               data.humidityValue > deviceType.maxValue
//             ) {
//               await this.notificationsService.createNotification({
//                 title: 'Humidity Threshold Violation',
//                 message: `Device ${data.deviceId} humidity (${data.humidityValue}%) is outside the allowed range (${deviceType.minValue}% - ${deviceType.maxValue}%).`,
//                 userId,
//                 timestamp: new Date().toISOString(),
//               });
//               this.logger.log(
//                 `Sent humidity threshold violation notification for userId: ${userId}`,
//               );
//             }
//           }
//         }
//       } else {
//         this.logger.warn(
//           `Skipping threshold checks due to missing DeviceUser for deviceId: ${data.deviceId}`,
//         );
//       }

//       await deviceData.save();
//       this.logger.log(
//         `Saved device data for deviceId ${data.deviceId} to MongoDB`,
//       );

//       // Create notification for new device data
//       try {
//         await this.notificationsService.createNotification({
//           title: 'New Device Data',
//           message: `Device ${data.deviceId} has new data: temperature ${data.temperatureValue}°C, humidity ${data.humidityValue}%.`,
//           userId,
//           timestamp: new Date().toISOString(),
//         });
//         this.logger.log(
//           `Sent new device data notification for userId: ${userId}`,
//         );
//       } catch (notificationError) {
//         this.logger.warn(
//           `Failed to create notification: ${notificationError.message}`,
//         );
//       }

//       return { status: 'processed', data: deviceData };
//     } catch (error) {
//       this.logger.error(
//         `Failed to process IoT data for deviceId ${data.deviceId}: ${error.message}`,
//         error.stack,
//       );
//       throw new Error(`Failed to save device data: ${error.message}`);
//     }
//   }

//   private isValidEmail(email: string): boolean {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   }

//   async getDeviceData(deviceId: string) {
//     return this.deviceDataModel
//       .find({ deviceId })
//       .sort({ createdAt: -1 })
//       .exec();
//   }

//   async getLatestDeviceData(deviceId: string) {
//     return this.deviceDataModel
//       .findOne({ deviceId })
//       .sort({ createdAt: -1 })
//       .exec();
//   }
// }

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeviceData, DeviceDataDocument } from './schemas/device.schema';
import {
  DeviceUser,
  DeviceUserDocument,
} from '../device-user/schemas/device-user.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { KafkaContext } from '@nestjs/microservices';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);

  constructor(
    @InjectModel(DeviceData.name)
    private deviceDataModel: Model<DeviceDataDocument>,
    @InjectModel(DeviceUser.name)
    private deviceUserModel: Model<DeviceUserDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async processIoTData(data: any, context: KafkaContext) {
    const topic = context.getTopic();
    this.logger.log(
      `Received message from topic ${topic}: ${JSON.stringify(data)}`,
    );

    try {
      // Validate deviceId
      if (!data.deviceId) {
        throw new BadRequestException('deviceId is required');
      }

      // Validate temperatureValue and humidityValue
      const temperatureValue =
        data.temperatureValue !== undefined && !isNaN(data.temperatureValue)
          ? Number(data.temperatureValue)
          : undefined;
      const humidityValue =
        data.humidityValue !== undefined && !isNaN(data.humidityValue)
          ? Number(data.humidityValue)
          : undefined;
      this.logger.log(
        `Parsed values: temperature=${temperatureValue}, humidity=${humidityValue}`,
      );

      // Fetch DeviceUser by deviceId only
      const deviceUser = await this.deviceUserModel
        .findOne({ deviceId: data.deviceId })
        .exec();

      // Determine userId
      let userId: string;
      if (deviceUser) {
        userId = deviceUser.email;
        this.logger.log(
          `Found DeviceUser with userId: ${userId} for deviceId: ${data.deviceId}`,
        );
      } else {
        this.logger.warn(`No DeviceUser found for deviceId: ${data.deviceId}`);
        userId =
          data.userId && this.isValidEmail(data.userId)
            ? data.userId
            : 'test@example.com';
        this.logger.log(
          `Using userId: ${userId} (from ${data.userId ? 'Kafka message' : 'default'})`,
        );
      }

      // Validate email format
      if (!this.isValidEmail(userId)) {
        throw new BadRequestException(
          `Invalid email format for userId: ${userId}`,
        );
      }

      const deviceData = new this.deviceDataModel({
        deviceId: data.deviceId,
        temperatureValue,
        humidityValue,
        isActive: data.isActive ?? true,
        date: data.date ? new Date(data.date) : new Date(),
        topic: topic,
        userId,
      });

      // Check thresholds if DeviceUser exists
      if (deviceUser) {
        const deviceTypes = deviceUser.deviceTypes || [];
        this.logger.log(`Device types found: ${JSON.stringify(deviceTypes)}`);
        for (const deviceType of deviceTypes) {
          const typeLower = deviceType.type.toLowerCase();
          this.logger.log(
            `Checking device type: ${typeLower}, minValue: ${deviceType.minValue}, maxValue: ${deviceType.maxValue}`,
          );

          if (typeLower === 'temperature' && temperatureValue !== undefined) {
            if (
              temperatureValue < deviceType.minValue ||
              temperatureValue > deviceType.maxValue
            ) {
              const notification = {
                title: 'Temperature Threshold Violation',
                message: `Device ${data.deviceId} temperature (${temperatureValue}°C) is outside the allowed range (${deviceType.minValue}°C - ${deviceType.maxValue}°C).`,
                userId,
                timestamp: new Date().toISOString(),
              };
              this.logger.log(
                `Creating temperature violation notification: ${JSON.stringify(notification)}`,
              );
              try {
                await this.notificationsService.createNotification(
                  notification,
                );
                this.logger.log(
                  `Sent temperature threshold violation notification for userId: ${userId}`,
                );
              } catch (error) {
                this.logger.error(
                  `Failed to send temperature violation notification: ${error.message}`,
                );
              }
            } else {
              this.logger.log(
                `Temperature (${temperatureValue}°C) within range (${deviceType.minValue}°C - ${deviceType.maxValue}°C)`,
              );
            }
          }
          if (typeLower === 'humidity' && humidityValue !== undefined) {
            if (
              humidityValue < deviceType.minValue ||
              humidityValue > deviceType.maxValue
            ) {
              const notification = {
                title: 'Humidity Threshold Violation',
                message: `Device ${data.deviceId} humidity (${humidityValue}%) is outside the allowed range (${deviceType.minValue}% - ${deviceType.maxValue}%).`,
                userId,
                timestamp: new Date().toISOString(),
              };
              this.logger.log(
                `Creating humidity violation notification: ${JSON.stringify(notification)}`,
              );
              try {
                await this.notificationsService.createNotification(
                  notification,
                );
                this.logger.log(
                  `Sent humidity threshold violation notification for userId: ${userId}`,
                );
              } catch (error) {
                this.logger.error(
                  `Failed to send humidity violation notification: ${error.message}`,
                );
              }
            } else {
              this.logger.log(
                `Humidity (${humidityValue}%) within range (${deviceType.minValue}% - ${deviceType.maxValue}%)`,
              );
            }
          }
        }
      } else {
        this.logger.warn(
          `Skipping threshold checks due to missing DeviceUser for deviceId: ${data.deviceId}`,
        );
      }

      await deviceData.save();
      this.logger.log(
        `Saved device data for deviceId ${data.deviceId} to MongoDB`,
      );

      return { status: 'processed', data: deviceData };
    } catch (error) {
      this.logger.error(
        `Failed to process IoT data for deviceId ${data.deviceId}: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to save device data: ${error.message}`);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
