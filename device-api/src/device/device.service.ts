// // // // // device.service.ts
// // // // import { Injectable, Logger, BadRequestException } from '@nestjs/common';
// // // // import { InjectModel } from '@nestjs/mongoose';
// // // // import { Model } from 'mongoose';
// // // // import { DeviceData, DeviceDataDocument } from './schemas/device.schema';
// // // // import { NotificationsService } from '../notifications/notifications.service';
// // // // import { UsersService } from '../users/users.service';
// // // // import { KafkaContext } from '@nestjs/microservices';

// // // // @Injectable()
// // // // export class DeviceService {
// // // //   private readonly logger = new Logger(DeviceService.name);

// // // //   constructor(
// // // //     @InjectModel(DeviceData.name)
// // // //     private deviceDataModel: Model<DeviceDataDocument>,
// // // //     private readonly notificationsService: NotificationsService,
// // // //     private readonly usersService: UsersService,
// // // //   ) {}

// // // //   async processIoTData(data: any, context: KafkaContext) {
// // // //     const topic = context.getTopic();
// // // //     this.logger.log(
// // // //       `Received message from topic ${topic}: ${JSON.stringify(data)}`,
// // // //     );

// // // //     try {
// // // //       // Handle userId - if it's missing, undefined, null, or "unknown", use default
// // // //       let userId = data.userId;
// // // //       if (
// // // //         !userId ||
// // // //         userId === 'unknown' ||
// // // //         userId === 'undefined' ||
// // // //         userId === 'null'
// // // //       ) {
// // // //         userId = 'test@example.com';
// // // //       }

// // // //       // Only validate email if userId is provided and not a default
// // // //       if (userId !== 'test@example.com' && !this.isValidEmail(userId)) {
// // // //         throw new BadRequestException(
// // // //           `Invalid email format for userId: ${userId}`,
// // // //         );
// // // //       }

// // // //       // Try to ensure user exists, but don't fail if it doesn't work
// // // //       try {
// // // //         await this.usersService.ensureUserExists(userId);
// // // //       } catch (userError) {
// // // //         this.logger.warn(`Failed to ensure user exists: ${userError.message}`);
// // // //         // Continue anyway - don't fail the whole request
// // // //       }

// // // //       const deviceData = new this.deviceDataModel({
// // // //         deviceId: data.deviceId,
// // // //         temperatureValue: data.temperatureValue,
// // // //         humidityValue: data.humidityValue,
// // // //         isActive: data.isActive ?? true,
// // // //         date: data.date ? new Date(data.date) : new Date(),
// // // //         topic: topic,
// // // //         userId,
// // // //       });

// // // //       await deviceData.save();
// // // //       this.logger.log(
// // // //         `Saved device data for deviceId ${data.deviceId} to MongoDB`,
// // // //       );

// // // //       // Try to create notification, but don't fail if it doesn't work
// // // //       try {
// // // //         await this.notificationsService.createNotification({
// // // //           title: 'New Device Added',
// // // //           message: `Device ${data.deviceId} has been added with temperature ${data.temperatureValue}°C and humidity ${data.humidityValue}%.`,
// // // //           userId,
// // // //         });
// // // //       } catch (notificationError) {
// // // //         this.logger.warn(
// // // //           `Failed to create notification: ${notificationError.message}`,
// // // //         );
// // // //         // Continue anyway - don't fail the whole request
// // // //       }

// // // //       return { status: 'processed', data: deviceData };
// // // //     } catch (error) {
// // // //       this.logger.error(
// // // //         `Failed to process IoT data for deviceId ${data.deviceId}`,
// // // //         error.stack,
// // // //       );
// // // //       throw new Error(`Failed to save device data: ${error.message}`);
// // // //     }
// // // //   }

// // // //   private isValidEmail(email: string): boolean {
// // // //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// // // //     return emailRegex.test(email);
// // // //   }

// // // //   async getDeviceData(deviceId: string) {
// // // //     return this.deviceDataModel
// // // //       .find({ deviceId })
// // // //       .sort({ createdAt: -1 })
// // // //       .exec();
// // // //   }

// // // //   async getLatestDeviceData(deviceId: string) {
// // // //     return this.deviceDataModel
// // // //       .findOne({ deviceId })
// // // //       .sort({ createdAt: -1 })
// // // //       .exec();
// // // //   }
// // // // }

// // // // //hari eka
// // // // import { Injectable, Logger, BadRequestException } from '@nestjs/common';
// // // // import { InjectModel } from '@nestjs/mongoose';
// // // // import { Model } from 'mongoose';
// // // // import { DeviceData, DeviceDataDocument } from './schemas/device.schema';
// // // // import {
// // // //   DeviceUser,
// // // //   DeviceUserDocument,
// // // // } from '../device-user/schemas/device-user.schema';
// // // // import { NotificationsService } from '../notifications/notifications.service';
// // // // import { KafkaContext } from '@nestjs/microservices';

// // // // @Injectable()
// // // // export class DeviceService {
// // // //   private readonly logger = new Logger(DeviceService.name);

// // // //   constructor(
// // // //     @InjectModel(DeviceData.name)
// // // //     private deviceDataModel: Model<DeviceDataDocument>,
// // // //     @InjectModel(DeviceUser.name)
// // // //     private deviceUserModel: Model<DeviceUserDocument>,
// // // //     private readonly notificationsService: NotificationsService,
// // // //   ) {}

// // // //   async processIoTData(data: any, context: KafkaContext) {
// // // //     const topic = context.getTopic();
// // // //     this.logger.log(
// // // //       `Received message from topic ${topic}: ${JSON.stringify(data)}`,
// // // //     );

// // // //     try {
// // // //       // Validate deviceId
// // // //       if (!data.deviceId) {
// // // //         throw new BadRequestException('deviceId is required');
// // // //       }

// // // //       // Fetch DeviceUser by deviceId only
// // // //       const deviceUser = await this.deviceUserModel
// // // //         .findOne({ deviceId: data.deviceId })
// // // //         .exec();

// // // //       // Determine userId
// // // //       let userId: string;
// // // //       if (deviceUser) {
// // // //         userId = deviceUser.email;
// // // //         this.logger.log(
// // // //           `Found DeviceUser with userId: ${userId} for deviceId: ${data.deviceId}`,
// // // //         );
// // // //       } else {
// // // //         this.logger.warn(`No DeviceUser found for deviceId: ${data.deviceId}`);
// // // //         // Fallback to data.userId if provided and valid, otherwise use default
// // // //         userId =
// // // //           data.userId && this.isValidEmail(data.userId)
// // // //             ? data.userId
// // // //             : 'test@example.com';
// // // //         this.logger.log(
// // // //           `Using userId: ${userId} (from ${data.userId ? 'Kafka message' : 'default'})`,
// // // //         );
// // // //       }

// // // //       // Validate email format
// // // //       if (!this.isValidEmail(userId)) {
// // // //         throw new BadRequestException(
// // // //           `Invalid email format for userId: ${userId}`,
// // // //         );
// // // //       }

// // // //       const deviceData = new this.deviceDataModel({
// // // //         deviceId: data.deviceId,
// // // //         temperatureValue: data.temperatureValue,
// // // //         humidityValue: data.humidityValue,
// // // //         isActive: data.isActive ?? true,
// // // //         date: data.date ? new Date(data.date) : new Date(),
// // // //         topic: topic,
// // // //         userId,
// // // //       });

// // // //       // Check thresholds if DeviceUser exists
// // // //       if (deviceUser) {
// // // //         const deviceTypes = deviceUser.deviceTypes || [];
// // // //         for (const deviceType of deviceTypes) {
// // // //           if (
// // // //             deviceType.type === 'temperature' &&
// // // //             data.temperatureValue !== undefined
// // // //           ) {
// // // //             if (
// // // //               data.temperatureValue < deviceType.minValue ||
// // // //               data.temperatureValue > deviceType.maxValue
// // // //             ) {
// // // //               await this.notificationsService.createNotification({
// // // //                 title: 'Temperature Threshold Violation',
// // // //                 message: `Device ${data.deviceId} temperature (${data.temperatureValue}°C) is outside the allowed range (${deviceType.minValue}°C - ${deviceType.maxValue}°C).`,
// // // //                 userId,
// // // //                 timestamp: new Date().toISOString(),
// // // //               });
// // // //               this.logger.log(
// // // //                 `Sent temperature threshold violation notification for userId: ${userId}`,
// // // //               );
// // // //             }
// // // //           }
// // // //           if (
// // // //             deviceType.type === 'humidity' &&
// // // //             data.humidityValue !== undefined
// // // //           ) {
// // // //             if (
// // // //               data.humidityValue < deviceType.minValue ||
// // // //               data.humidityValue > deviceType.maxValue
// // // //             ) {
// // // //               await this.notificationsService.createNotification({
// // // //                 title: 'Humidity Threshold Violation',
// // // //                 message: `Device ${data.deviceId} humidity (${data.humidityValue}%) is outside the allowed range (${deviceType.minValue}% - ${deviceType.maxValue}%).`,
// // // //                 userId,
// // // //                 timestamp: new Date().toISOString(),
// // // //               });
// // // //               this.logger.log(
// // // //                 `Sent humidity threshold violation notification for userId: ${userId}`,
// // // //               );
// // // //             }
// // // //           }
// // // //         }
// // // //       } else {
// // // //         this.logger.warn(
// // // //           `Skipping threshold checks due to missing DeviceUser for deviceId: ${data.deviceId}`,
// // // //         );
// // // //       }

// // // //       await deviceData.save();
// // // //       this.logger.log(
// // // //         `Saved device data for deviceId ${data.deviceId} to MongoDB`,
// // // //       );

// // // //       // Create notification for new device data
// // // //       try {
// // // //         await this.notificationsService.createNotification({
// // // //           title: 'New Device Data',
// // // //           message: `Device ${data.deviceId} has new data: temperature ${data.temperatureValue}°C, humidity ${data.humidityValue}%.`,
// // // //           userId,
// // // //           timestamp: new Date().toISOString(),
// // // //         });
// // // //         this.logger.log(
// // // //           `Sent new device data notification for userId: ${userId}`,
// // // //         );
// // // //       } catch (notificationError) {
// // // //         this.logger.warn(
// // // //           `Failed to create notification: ${notificationError.message}`,
// // // //         );
// // // //       }

// // // //       return { status: 'processed', data: deviceData };
// // // //     } catch (error) {
// // // //       this.logger.error(
// // // //         `Failed to process IoT data for deviceId ${data.deviceId}: ${error.message}`,
// // // //         error.stack,
// // // //       );
// // // //       throw new Error(`Failed to save device data: ${error.message}`);
// // // //     }
// // // //   }

// // // //   private isValidEmail(email: string): boolean {
// // // //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// // // //     return emailRegex.test(email);
// // // //   }

// // // //   async getDeviceData(deviceId: string) {
// // // //     return this.deviceDataModel
// // // //       .find({ deviceId })
// // // //       .sort({ createdAt: -1 })
// // // //       .exec();
// // // //   }

// // // //   async getLatestDeviceData(deviceId: string) {
// // // //     return this.deviceDataModel
// // // //       .findOne({ deviceId })
// // // //       .sort({ createdAt: -1 })
// // // //       .exec();
// // // //   }
// // // // }

// // // import { Injectable, Logger, BadRequestException } from '@nestjs/common';
// // // import { InjectModel } from '@nestjs/mongoose';
// // // import { Model } from 'mongoose';
// // // import { DeviceData, DeviceDataDocument } from './schemas/device.schema';
// // // import {
// // //   DeviceUser,
// // //   DeviceUserDocument,
// // // } from '../device-user/schemas/device-user.schema';
// // // import { NotificationsService } from '../notifications/notifications.service';
// // // import { KafkaContext } from '@nestjs/microservices';

// // // @Injectable()
// // // export class DeviceService {
// // //   private readonly logger = new Logger(DeviceService.name);

// // //   constructor(
// // //     @InjectModel(DeviceData.name)
// // //     private deviceDataModel: Model<DeviceDataDocument>,
// // //     @InjectModel(DeviceUser.name)
// // //     private deviceUserModel: Model<DeviceUserDocument>,
// // //     private readonly notificationsService: NotificationsService,
// // //   ) {}

// // //   async processIoTData(rawData: any, context: KafkaContext) {
// // //     const topic = context.getTopic();
// // //     this.logger.log(
// // //       `Received message from topic ${topic}: ${JSON.stringify(rawData)}`,
// // //     );

// // //     let data: any;
// // //     try {
// // //       let payloadString: string;

// // //       // Handle raw data which may be a Buffer, a string, or already an object.
// // //       if (Buffer.isBuffer(rawData)) {
// // //         payloadString = rawData.toString('utf-8'); // Convert Buffer to string
// // //       } else if (typeof rawData === 'string') {
// // //         payloadString = rawData;
// // //       } else {
// // //         // If it's somehow already an object, stringify it to be safe before parsing.
// // //         payloadString = JSON.stringify(rawData);
// // //       }

// // //       data = JSON.parse(payloadString);
// // //     } catch (e) {
// // //       this.logger.error('Failed to parse Kafka message payload as JSON', {
// // //         payload: rawData.toString(), // Log the raw payload for debugging
// // //         error: e.stack,
// // //       });
// // //       throw new BadRequestException('Invalid JSON payload from Kafka.');
// // //     }

// // //     // Debug log for incoming payload
// // //     this.logger.log(`DEBUG: Incoming IoT payload: ${JSON.stringify(data)}`);

// // //     // Validation: Only save if both temperature and humidity are valid numbers
// // //     if (
// // //       typeof data.temperature !== 'number' ||
// // //       typeof data.humidity !== 'number' ||
// // //       isNaN(data.temperature) ||
// // //       isNaN(data.humidity)
// // //     ) {
// // //       this.logger.warn('Skipping document: missing or invalid temperature/humidity', data);
// // //       return { status: 'skipped', reason: 'Missing or invalid temperature/humidity', data };
// // //     }

// // //     try {
// // //       // Validate deviceId
// // //       if (!data.deviceId) {
// // //         throw new BadRequestException(
// // //           'Field "deviceId" is required in the payload.',
// // //         );
// // //       }

// // //       // Map and validate temperature and humidity from the incoming data payload.
// // //       // The IoT device sends "temperature" and "humidity", but the schema expects "temperatureValue" and "humidityValue".
// // //       const temperatureValue =
// // //         data.temperature !== undefined && !isNaN(data.temperature)
// // //           ? Number(data.temperature)
// // //           : undefined;
// // //       const humidityValue =
// // //         data.humidity !== undefined && !isNaN(data.humidity)
// // //           ? Number(data.humidity)
// // //           : undefined;
// // //       this.logger.log(
// // //         `Parsed values: temperature=${temperatureValue}, humidity=${humidityValue}`,
// // //       );

// // //       // Fetch DeviceUser by deviceId only
// // //       const deviceUser = await this.deviceUserModel
// // //         .findOne({ deviceId: data.deviceId })
// // //         .exec();

// // //       // Determine userId
// // //       let userId: string;
// // //       if (deviceUser) {
// // //         userId = deviceUser.email;
// // //         this.logger.log(
// // //           `Found DeviceUser with userId: ${userId} for deviceId: ${data.deviceId}`,
// // //         );
// // //       } else {
// // //         this.logger.warn(`No DeviceUser found for deviceId: ${data.deviceId}`);
// // //         userId =
// // //           data.userId && this.isValidEmail(data.userId)
// // //             ? data.userId
// // //             : 'test@example.com';
// // //         this.logger.log(
// // //           `Using userId: ${userId} (from ${data.userId ? 'Kafka message' : 'default'})`,
// // //         );
// // //       }

// // //       // Validate email format
// // //       if (!this.isValidEmail(userId)) {
// // //         throw new BadRequestException(
// // //           `Invalid email format for userId: ${userId}`,
// // //         );
// // //       }

// // //       const deviceData = new this.deviceDataModel({
// // //         deviceId: data.deviceId,
// // //         temperatureValue,
// // //         humidityValue,
// // //         isActive: data.isActive ?? true,
// // //         // The IoT device sends "timestamp", but the schema expects "date".
// // //         date: data.timestamp ? new Date(data.timestamp) : new Date(),
// // //         topic: topic,
// // //         userId,
// // //       });

// // //       // Check thresholds if DeviceUser exists
// // //       if (deviceUser) {
// // //         const deviceTypes = deviceUser.deviceTypes || [];
// // //         this.logger.log(`Device types found: ${JSON.stringify(deviceTypes)}`);
// // //         for (const deviceType of deviceTypes) {
// // //           const typeLower = deviceType.type.toLowerCase();
// // //           this.logger.log(
// // //             `Checking device type: ${typeLower}, minValue: ${deviceType.minValue}, maxValue: ${deviceType.maxValue}`,
// // //           );

// // //           if (typeLower === 'temperature' && temperatureValue !== undefined) {
// // //             if (
// // //               temperatureValue < deviceType.minValue ||
// // //               temperatureValue > deviceType.maxValue
// // //             ) {
// // //               const notification = {
// // //                 title: 'Temperature Threshold Violation',
// // //                 message: `Device ${data.deviceId} temperature (${temperatureValue}°C) is outside the allowed range (${deviceType.minValue}°C - ${deviceType.maxValue}°C).`,
// // //                 userId,
// // //                 timestamp: new Date().toISOString(),
// // //               };
// // //               this.logger.log(
// // //                 `Creating temperature violation notification: ${JSON.stringify(notification)}`,
// // //               );
// // //               try {
// // //                 await this.notificationsService.createNotification(
// // //                   notification,
// // //                 );
// // //                 this.logger.log(
// // //                   `Sent temperature threshold violation notification for userId: ${userId}`,
// // //                 );
// // //               } catch (error) {
// // //                 this.logger.error(
// // //                   `Failed to send temperature violation notification: ${error.message}`,
// // //                 );
// // //               }
// // //             } else {
// // //               this.logger.log(
// // //                 `Temperature (${temperatureValue}°C) within range (${deviceType.minValue}°C - ${deviceType.maxValue}°C)`,
// // //               );
// // //             }
// // //           }
// // //           if (typeLower === 'humidity' && humidityValue !== undefined) {
// // //             if (
// // //               humidityValue < deviceType.minValue ||
// // //               humidityValue > deviceType.maxValue
// // //             ) {
// // //               const notification = {
// // //                 title: 'Humidity Threshold Violation',
// // //                 message: `Device ${data.deviceId} humidity (${humidityValue}%) is outside the allowed range (${deviceType.minValue}% - ${deviceType.maxValue}%).`,
// // //                 userId,
// // //                 timestamp: new Date().toISOString(),
// // //               };
// // //               this.logger.log(
// // //                 `Creating humidity violation notification: ${JSON.stringify(notification)}`,
// // //               );
// // //               try {
// // //                 await this.notificationsService.createNotification(
// // //                   notification,
// // //                 );
// // //                 this.logger.log(
// // //                   `Sent humidity threshold violation notification for userId: ${userId}`,
// // //                 );
// // //               } catch (error) {
// // //                 this.logger.error(
// // //                   `Failed to send humidity violation notification: ${error.message}`,
// // //                 );
// // //               }
// // //             } else {
// // //               this.logger.log(
// // //                 `Humidity (${humidityValue}%) within range (${deviceType.minValue}% - ${deviceType.maxValue}%)`,
// // //               );
// // //             }
// // //           }
// // //         }
// // //       } else {
// // //         this.logger.warn(
// // //           `Skipping threshold checks due to missing DeviceUser for deviceId: ${data.deviceId}`,
// // //         );
// // //       }

// // //       await deviceData.save();
// // //       this.logger.log(
// // //         `Saved device data for deviceId ${data.deviceId} to MongoDB`,
// // //       );

// // //       return { status: 'processed', data: deviceData };
// // //     } catch (error) {
// // //       this.logger.error(
// // //         `Failed to process IoT data for deviceId ${data?.deviceId}: ${error.message}`,
// // //         error.stack,
// // //       );
// // //       throw new Error(`Failed to save device data: ${error.message}`);
// // //     }
// // //   }

// // //   private isValidEmail(email: string): boolean {
// // //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// // //     return emailRegex.test(email);
// // //   }

// // //   async getDeviceData(deviceId: string) {
// // //     return this.deviceDataModel
// // //       .find({ deviceId })
// // //       .sort({ createdAt: -1 })
// // //       .exec();
// // //   }

// // //   async getLatestDeviceData(deviceId: string) {
// // //     return this.deviceDataModel
// // //       .findOne({ deviceId })
// // //       .sort({ createdAt: -1 })
// // //       .exec();
// // //   }
// // // }
// // import { Injectable, Logger, BadRequestException } from '@nestjs/common';
// // import { InjectModel } from '@nestjs/mongoose';
// // import { Model } from 'mongoose';
// // import { DeviceData, DeviceDataDocument } from './schemas/device.schema';
// // import {
// //   DeviceUser,
// //   DeviceUserDocument,
// // } from '../device-user/schemas/device-user.schema';
// // import { NotificationsService } from '../notifications/notifications.service';
// // import { KafkaContext } from '@nestjs/microservices';

// // @Injectable()
// // export class DeviceService {
// //   private readonly logger = new Logger(DeviceService.name);

// //   constructor(
// //     @InjectModel(DeviceData.name)
// //     private deviceDataModel: Model<DeviceDataDocument>,
// //     @InjectModel(DeviceUser.name)
// //     private deviceUserModel: Model<DeviceUserDocument>,
// //     private readonly notificationsService: NotificationsService,
// //   ) {}

// //   async processIoTData(rawData: any, context: KafkaContext) {
// //     const topic = context.getTopic();
// //     this.logger.log(
// //       `Received message from topic ${topic}: ${JSON.stringify(rawData)}`,
// //     );

// //     let data: any;
// //     try {
// //       let payloadString: string;

// //       if (Buffer.isBuffer(rawData)) {
// //         payloadString = rawData.toString('utf-8');
// //       } else if (typeof rawData === 'string') {
// //         payloadString = rawData;
// //       } else {
// //         payloadString = JSON.stringify(rawData);
// //       }

// //       data = JSON.parse(payloadString);
// //     } catch (e) {
// //       this.logger.error('Failed to parse Kafka message payload as JSON', {
// //         payload: rawData.toString(),
// //         error: e.stack,
// //       });
// //       throw new BadRequestException('Invalid JSON payload from Kafka.');
// //     }

// //     this.logger.log(`DEBUG: Incoming IoT payload: ${JSON.stringify(data)}`);

// //     // ❗ Validation: skip if temperature or humidity is missing or invalid
// //     if (
// //       data.temperature === undefined ||
// //       data.humidity === undefined ||
// //       typeof data.temperature !== 'number' ||
// //       typeof data.humidity !== 'number' ||
// //       isNaN(data.temperature) ||
// //       isNaN(data.humidity)
// //     ) {
// //       this.logger.warn(
// //         `Skipping document: missing or invalid temperature/humidity. Payload: ${JSON.stringify(data)}`,
// //       );
// //       return { status: 'skipped', reason: 'Missing or invalid temperature/humidity', data };
// //     }

// //     try {
// //       if (!data.deviceId) {
// //         throw new BadRequestException('Field "deviceId" is required in the payload.');
// //       }

// //       const temperatureValue = Number(data.temperature);
// //       const humidityValue = Number(data.humidity);

// //       this.logger.log(
// //         `Parsed values: temperature=${temperatureValue}, humidity=${humidityValue}`,
// //       );

// //       const deviceUser = await this.deviceUserModel
// //         .findOne({ deviceId: data.deviceId })
// //         .exec();

// //       let userId: string;
// //       if (deviceUser) {
// //         userId = deviceUser.email;
// //         this.logger.log(`Found DeviceUser with userId: ${userId}`);
// //       } else {
// //         this.logger.warn(`No DeviceUser found for deviceId: ${data.deviceId}`);
// //         userId = data.userId && this.isValidEmail(data.userId)
// //           ? data.userId
// //           : 'test@example.com';
// //         this.logger.log(
// //           `Using fallback userId: ${userId}`,
// //         );
// //       }

// //       if (!this.isValidEmail(userId)) {
// //         throw new BadRequestException(`Invalid email format for userId: ${userId}`);
// //       }

// //       const deviceData = new this.deviceDataModel({
// //         deviceId: data.deviceId,
// //         temperatureValue,
// //         humidityValue,
// //         isActive: data.isActive ?? true,
// //         date: data.timestamp ? new Date(data.timestamp) : new Date(),
// //         topic: topic,
// //         userId,
// //       });

// //       if (deviceUser) {
// //         const deviceTypes = deviceUser.deviceTypes || [];
// //         for (const deviceType of deviceTypes) {
// //           const typeLower = deviceType.type.toLowerCase();
// //           if (typeLower === 'temperature' && temperatureValue !== undefined) {
// //             if (
// //               temperatureValue < deviceType.minValue ||
// //               temperatureValue > deviceType.maxValue
// //             ) {
// //               const notification = {
// //                 title: 'Temperature Threshold Violation',
// //                 message: `Device ${data.deviceId} temperature (${temperatureValue}°C) is outside the allowed range (${deviceType.minValue}°C - ${deviceType.maxValue}°C).`,
// //                 userId,
// //                 timestamp: new Date().toISOString(),
// //               };
// //               await this.notificationsService.createNotification(notification);
// //               this.logger.log(`Sent temperature threshold violation notification`);
// //             }
// //           }
// //           if (typeLower === 'humidity' && humidityValue !== undefined) {
// //             if (
// //               humidityValue < deviceType.minValue ||
// //               humidityValue > deviceType.maxValue
// //             ) {
// //               const notification = {
// //                 title: 'Humidity Threshold Violation',
// //                 message: `Device ${data.deviceId} humidity (${humidityValue}%) is outside the allowed range (${deviceType.minValue}% - ${deviceType.maxValue}%).`,
// //                 userId,
// //                 timestamp: new Date().toISOString(),
// //               };
// //               await this.notificationsService.createNotification(notification);
// //               this.logger.log(`Sent humidity threshold violation notification`);
// //             }
// //           }
// //         }
// //       }

// //       await deviceData.save();
// //       this.logger.log(
// //         `✅ Saved device data for deviceId ${data.deviceId} to MongoDB`,
// //       );

// //       return { status: 'processed', data: deviceData };
// //     } catch (error) {
// //       this.logger.error(
// //         `❌ Failed to process IoT data for deviceId ${data?.deviceId}: ${error.message}`,
// //         error.stack,
// //       );
// //       throw new Error(`Failed to save device data: ${error.message}`);
// //     }
// //   }

// //   private isValidEmail(email: string): boolean {
// //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// //     return emailRegex.test(email);
// //   }

// //   async getDeviceData(deviceId: string) {
// //     return this.deviceDataModel
// //       .find({ deviceId })
// //       .sort({ createdAt: -1 })
// //       .exec();
// //   }

// //   async getLatestDeviceData(deviceId: string) {
// //     return this.deviceDataModel
// //       .findOne({ deviceId })
// //       .sort({ createdAt: -1 })
// //       .exec();
// //   }
// // }

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

//   async processIoTData(rawData: any, context: KafkaContext) {
//     const topic = context.getTopic();
//     this.logger.log(
//       `Received message from topic ${topic}: ${JSON.stringify(rawData)}`,
//     );

//     let data: any;
//     try {
//       let payloadString: string;

//       if (Buffer.isBuffer(rawData)) {
//         payloadString = rawData.toString('utf-8');
//       } else if (typeof rawData === 'string') {
//         payloadString = rawData;
//       } else {
//         payloadString = JSON.stringify(rawData);
//       }

//       data = JSON.parse(payloadString);
//     } catch (e) {
//       this.logger.error('Failed to parse Kafka message payload as JSON', {
//         payload: rawData.toString(),
//         error: e.stack,
//       });
//       throw new BadRequestException('Invalid JSON payload from Kafka.');
//     }

//     this.logger.log(`DEBUG: Incoming IoT payload: ${JSON.stringify(data)}`);

//     // Extract readings from payload (support both 'readings' object and flat fields)
//     let readings: Record<string, number> = {};
//     if (typeof data.readings === 'object' && data.readings !== null) {
//       readings = { ...data.readings };
//     } else {
//       // Collect all numeric fields except reserved ones
//       const reserved = ['deviceId', 'isActive', 'date', 'topic', 'userId', 'timestamp'];
//       for (const key of Object.keys(data)) {
//         if (!reserved.includes(key) && typeof data[key] === 'number' && !isNaN(data[key])) {
//           readings[key] = data[key];
//         }
//       }
//     }
//     // Normalize readings keys to lowercase for consistent access
//     readings = Object.fromEntries(
//       Object.entries(readings).map(([k, v]) => [k.toLowerCase(), v])
//     );

//     // Skip documents with no readings
//     if (!readings || Object.keys(readings).length === 0) {
//       this.logger.warn(
//         `Skipping document: no valid sensor readings found. Payload: ${JSON.stringify(data)}`,
//       );
//       return { status: 'skipped', reason: 'No valid sensor readings', data };
//     }

//     try{
//       if (!data.deviceId) {
//         throw new BadRequestException('Field "deviceId" is required in the payload.');
//       }

//       const deviceUser = await this.deviceUserModel
//         .findOne({ deviceId: data.deviceId })
//         .exec();

//       let userId: string;
//       if (deviceUser) {
//         userId = deviceUser.email;
//         this.logger.log(`Found DeviceUser with userId: ${userId}`);
//       } else {
//         this.logger.warn(`No DeviceUser found for deviceId: ${data.deviceId}`);
//         userId = data.userId && this.isValidEmail(data.userId)
//           ? data.userId
//           : 'test@example.com';
//         this.logger.log(
//           `Using fallback userId: ${userId}`,
//         );
//       }

//       if (!this.isValidEmail(userId)) {
//         throw new BadRequestException(`Invalid email format for userId: ${userId}`);
//       }

//       // Notification logic for threshold violations (if deviceUser.deviceTypes is present)
//       if (deviceUser && Array.isArray(deviceUser.deviceTypes)) {
//         for (const deviceType of deviceUser.deviceTypes) {
//           const typeLower = deviceType.type.toLowerCase();
//           const value = readings[typeLower];
//           if (value !== undefined) {
//             if (value < deviceType.minValue || value > deviceType.maxValue) {
//               const notification = {
//                 title: `${deviceType.type} Threshold Violation`,
//                 message: `Device ${data.deviceId} ${deviceType.type} (${value}) is outside the allowed range (${deviceType.minValue} - ${deviceType.maxValue}).`,
//                 userId,
//                 timestamp: new Date().toISOString(),
//               };
//               await this.notificationsService.createNotification(notification);
//               this.logger.log(`Sent ${deviceType.type} threshold violation notification`);
//             }
//           }
//         }
//       }

//       const deviceData = new this.deviceDataModel({
//         deviceId: data.deviceId,
//         readings,
//         isActive: data.isActive ?? true,
//         date: data.timestamp ? new Date(data.timestamp) : new Date(),
//         topic: topic,
//         userId,
//       });

//       await deviceData.save();
//       this.logger.log(
//         `✅ Saved device data for deviceId ${data.deviceId} to MongoDB`,
//       );

//       return { status: 'processed', data: deviceData };
//     } catch (error) {
//       this.logger.error(
//         `❌ Failed to process IoT data for deviceId ${data?.deviceId}: ${error.message}`,
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
import { DeviceUser, DeviceUserDocument } from '../device-user/schemas/device-user.schema';
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

  async processIoTData(rawData: any, context: KafkaContext) {
    const topic = context.getTopic();
    this.logger.log(
      `Received message from topic ${topic}: ${JSON.stringify(rawData)}`,
    );

    let data: any;
    try {
      let payloadString: string;

      if (Buffer.isBuffer(rawData)) {
        payloadString = rawData.toString('utf-8');
      } else if (typeof rawData === 'string') {
        payloadString = rawData;
      } else {
        payloadString = JSON.stringify(rawData);
      }

      data = JSON.parse(payloadString);
    } catch (e) {
      this.logger.error('Failed to parse Kafka message payload as JSON', {
        payload: rawData.toString(),
        error: e.stack,
      });
      throw new BadRequestException('Invalid JSON payload from Kafka.');
    }

    this.logger.log(`DEBUG: Incoming IoT payload: ${JSON.stringify(data)}`);

    // Extract readings from payload (support both 'readings' object and flat fields)
    let readings: Record<string, number> = {};
    if (typeof data.readings === 'object' && data.readings !== null) {
      readings = { ...data.readings };
    } else {
      // Collect all numeric fields except reserved ones
      const reserved = ['deviceId', 'isActive', 'date', 'topic', 'userId', 'timestamp'];
      for (const key of Object.keys(data)) {
        if (!reserved.includes(key) && typeof data[key] === 'number' && !isNaN(data[key])) {
          readings[key] = data[key];
        }
      }
    }
    // Normalize readings keys to lowercase for consistent access
    readings = Object.fromEntries(
      Object.entries(readings).map(([k, v]) => [k.toLowerCase(), v])
    );

    // Skip documents with no readings
    if (!readings || Object.keys(readings).length === 0) {
      this.logger.warn(
        `Skipping document: no valid sensor readings found. Payload: ${JSON.stringify(data)}`,
      );
      return { status: 'skipped', reason: 'No valid sensor readings', data };
    }

    try {
      if (!data.deviceId) {
        throw new BadRequestException('Field "deviceId" is required in the payload.');
      }

      const deviceUser = await this.deviceUserModel
        .findOne({ deviceId: data.deviceId })
        .exec();

      let userId: string;
      if (deviceUser) {
        userId = deviceUser.email;
        this.logger.log(`Found DeviceUser with userId: ${userId}`);
      } else {
        this.logger.warn(`No DeviceUser found for deviceId: ${data.deviceId}`);
        userId = data.userId && this.isValidEmail(data.userId)
          ? data.userId
          : 'test@example.com';
        this.logger.log(
          `Using fallback userId: ${userId}`,
        );
      }

      if (!this.isValidEmail(userId)) {
        throw new BadRequestException(`Invalid email format for userId: ${userId}`);
      }

      // Notification logic for threshold violations (if deviceUser.deviceTypes is present)
      if (deviceUser && Array.isArray(deviceUser.deviceTypes)) {
        for (const deviceType of deviceUser.deviceTypes) {
          const typeLower = deviceType.type.toLowerCase();
          const value = readings[typeLower];
          if (value !== undefined) {
            if (value < deviceType.minValue || value > deviceType.maxValue) {
              const notification = {
                title: `${deviceType.type} Threshold Violation`,
                message: `Device ${data.deviceId} ${deviceType.type} (${value}) is outside the allowed range (${deviceType.minValue} - ${deviceType.maxValue}).`,
                userId,
                timestamp: new Date().toISOString(),
              };
              await this.notificationsService.createNotification(notification);
              this.logger.log(`Sent ${deviceType.type} threshold violation notification`);
            }
          }
        }
      }

      // Adjust timestamp from Sri Lankan time (+0530) to UTC by subtracting 5.5 hours
      let adjustedDate: Date;
      if (data.timestamp) {
        const inputDate = new Date(data.timestamp);
        if (isNaN(inputDate.getTime())) {
          this.logger.warn(`Invalid timestamp format in payload: ${data.timestamp}, falling back to current time`);
          adjustedDate = new Date();
        } else {
          adjustedDate = new Date(inputDate.getTime() - 5.5 * 60 * 60 * 1000); // Subtract 5.5 hours for +0530 to UTC
          this.logger.log(`Adjusted timestamp from ${inputDate.toISOString()} to ${adjustedDate.toISOString()}`);
        }
      } else {
        adjustedDate = new Date();
        this.logger.log(`No timestamp provided, using current time: ${adjustedDate.toISOString()}`);
      }

      const deviceData = new this.deviceDataModel({
        deviceId: data.deviceId,
        readings,
        isActive: data.isActive ?? true,
        date: adjustedDate,
        topic: topic,
        userId,
      });

      await deviceData.save();
      this.logger.log(
        `✅ Saved device data for deviceId ${data.deviceId} to MongoDB, date: ${adjustedDate.toISOString()}`,
      );

      return { status: 'processed', data: deviceData };
    } catch (error) {
      this.logger.error(
        `❌ Failed to process IoT data for deviceId ${data?.deviceId}: ${error.message}`,
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