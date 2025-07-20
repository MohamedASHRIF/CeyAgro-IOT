// import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import * as fs from 'fs';
// import * as path from 'path';
// import * as uuid from 'uuid';
// import { DeviceUser, DeviceUserDocument } from './schemas/device-user.schema';
// import { DeviceData, DeviceDataDocument } from 'src/device/schemas/device.schema';
// import { CreateDeviceUserDto } from './dto/create-device-user.dto';

// @Injectable()
// export class DeviceUserService {
//   private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'devices');
//   constructor(
//     @InjectModel(DeviceUser.name) private deviceUserModel: Model<DeviceUserDocument>,
//     @InjectModel(DeviceData.name) private deviceDataModel: Model<DeviceDataDocument>,
//   ) {}

//   async registerDevice(createDto: CreateDeviceUserDto): Promise<DeviceUser> {
//     try {
//       console.log('=== REGISTER DEVICE START ===');
//       console.log('Input data:', createDto);

//       const deviceExists = await this.deviceDataModel.findOne({
//         deviceId: createDto.deviceId
//       });

//       if (!deviceExists) {
//         throw new BadRequestException(
//           `Device with ID '${createDto.deviceId}' does not exist in the system. Please check the device ID and try again.`
//         );
//       }

//       console.log('Device found in devicedatas:', deviceExists);

//       const alreadyRegistered = await this.deviceUserModel.findOne({
//         email: createDto.email,
//         deviceId: createDto.deviceId,
//       });

//       if (alreadyRegistered) {
//         throw new BadRequestException(
//           `Device '${createDto.deviceId}' is already registered to user `
//         );
//       }

//       const deviceUser = new this.deviceUserModel(createDto);
//       const savedDevice = await deviceUser.save();

//       console.log('Device registered successfully:', savedDevice);

//       return savedDevice;
//     } catch (error) {
//       console.error('Error in registerDevice:', error);
//       throw error;
//     }
//   }

//   async testSave(testData: any) {
//     console.log('Model name:', this.deviceUserModel.modelName);
//     console.log('Collection name:', this.deviceUserModel.collection.name);
//     console.log('Test data:', testData);

//     const deviceUser = new this.deviceUserModel(testData);
//     console.log('Created instance:', deviceUser);

//     const saved = await deviceUser.save();
//     console.log('Saved result:', saved);

//     return saved;
//   }

// async getDevicesForUser(email: string) {
//   console.log('=== GET DEVICES FOR USER ===');
//   console.log('Searching for userId:', email);

//   const userDevices = await this.deviceUserModel.find({ email });
//   console.log('Found userDevices:', userDevices);

//   if (userDevices.length === 0) {
//     console.log('No devices found for user:', email);
//     return [];
//   }

//   const deviceIds = userDevices.map(ud => ud.deviceId);

//   // Get latest device data for all devices in a single query
//   const latestDeviceData = await this.deviceDataModel.aggregate([
//     { $match: { deviceId: { $in: deviceIds } } },
//     { $sort: { deviceId: 1,createdAt: -1 } }, // Replace 'timestamp'
//     {
//       $group: {
//         _id: '$deviceId',
//         latestData: { $first: '$$ROOT' }
//       }
//     }
//   ]);

//   // Create a map for quick lookup
//   const deviceDataMap = new Map();
//   latestDeviceData.forEach(item => {
//     deviceDataMap.set(item._id, item.latestData);
//   });

//   // Combine user devices with their latest data
//   const devicesWithData = userDevices.map(userDevice => {
//     const deviceData = deviceDataMap.get(userDevice.deviceId);
//     console.log('Device data for', userDevice.deviceId, ':', deviceData);

//     return {
//       userDevice: userDevice.toObject(),
//       deviceData: deviceData || null,
//     };
//   });

//   console.log('Final devicesWithData:', devicesWithData);
//   return devicesWithData;
// }

// //STAT
// async getDeviceStatistics(email: string) {
//   try {
//     const userDevices = await this.deviceUserModel.find({ email }).select('deviceId');
//     const deviceIds = userDevices.map(ud => ud.deviceId);

//     if (deviceIds.length === 0) {
//       return {
//         userId: email,
//         total: 0,
//         active: 0,
//         inactive: 0
//       };
//     }

//     const stats = await this.deviceDataModel.aggregate([
//       // Match devices belonging to the user
//       { $match: { deviceId: { $in: deviceIds } } },

//       // Sort by deviceId ascending, createdAt descending (latest first)
//       { $sort: { deviceId: 1, createdAt: -1 } },

//       // Group by deviceId, get latest status by createdAt
//       {
//         $group: {
//           _id: '$deviceId',
//           latestIsActive: { $first: '$isActive' },
//           latestCreatedAt: { $first: '$createdAt' }
//         }
//       },

//       // Aggregate counts of total, active, and inactive devices
//       {
//         $group: {
//           _id: null,
//           total: { $sum: 1 },
//           active: {
//             $sum: {
//               $cond: [{ $eq: ['$latestIsActive', true] }, 1, 0]
//             }
//           },
//           inactive: {
//             $sum: {
//               $cond: [{ $eq: ['$latestIsActive', false] }, 1, 0]
//             }
//           }
//         }
//       }
//     ]);

//     const result = stats[0] || { total: 0, active: 0, inactive: 0 };

//     return {
//       userId: email,
//       total: result.total,
//       active: result.active,
//       inactive: result.inactive
//     };
//   } catch (error) {
//     console.error(`Error fetching device statistics for user:`, error);
//     throw error;
//   }
// }
// async getDeviceForUser(email: string, deviceId: string) {
//   // Fetch user-device relation and latest device data in parallel
//   const [userDevice, latestDeviceData] = await Promise.all([
//     this.deviceUserModel.findOne({ email, deviceId }),
//     this.deviceDataModel.findOne({ deviceId }).sort({ createdAt: -1 }) // Get latest by createdAt
//   ]);

//   if (!userDevice) {
//     throw new NotFoundException('Device not registered for this user');
//   }

//   if (!latestDeviceData) {
//     throw new NotFoundException('Device data not found in system');
//   }

//   return {
//     userDevice: userDevice.toObject(),
//     deviceData: latestDeviceData.toObject(),
//     status: latestDeviceData.isActive // Include current device status
//   };
// }

//   async unregisterDevice(email: string, deviceId: string): Promise<void> {
//     const result = await this.deviceUserModel.deleteOne({ email, deviceId });

//     if (result.deletedCount === 0) {
//       throw new NotFoundException('Device registration not found');
//     }
//   }

//    async updateDeviceUser(
//     email: string,
//     deviceId: string,
//     updateData: Partial<CreateDeviceUserDto>,
//     deviceImage?: Express.Multer.File,
//     removedeviceImage?: string,
//   ) {
//     const deviceExists = await this.deviceDataModel.exists({ deviceId });
//     if (!deviceExists) throw new BadRequestException('Device does not exist in system');

//     const deviceUser = await this.deviceUserModel.findOne({ email, deviceId });
//     if (!deviceUser) throw new NotFoundException('Device not registered for this user');

//     // Handle image removal
//     if (removedeviceImage === 'true') {
//       if (deviceUser.deviceImage?.startsWith('/uploads/')) {
//         const fileName = deviceUser.deviceImage.replace('/uploads/', '');
//         const filePath = path.join(this.uploadsDir, fileName);
//         if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//       }
//       deviceUser.deviceImage = null;
//     }

//     // Handle image replacement
//     if (deviceImage && removedeviceImage !== 'true') {
//       if (deviceUser.deviceImage?.startsWith('/uploads/')) {
//         const oldFile = path.join(this.uploadsDir, deviceUser.deviceImage.replace('/uploads/', ''));
//         if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
//       }

//       const fileName = `${uuid.v4()}${path.extname(deviceImage.originalname)}`;
//       const fullPath = path.join(this.uploadsDir, fileName);

//       if (!fs.existsSync(this.uploadsDir)) fs.mkdirSync(this.uploadsDir, { recursive: true });

//       fs.writeFileSync(fullPath, deviceImage.buffer);
//       deviceUser.deviceImage = `/uploads/devices/${fileName}`;
//     }

//     // Update fields
//     for (const key in updateData) {
//       if (Object.prototype.hasOwnProperty.call(updateData, key)) {
//         (deviceUser as any)[key] = (updateData as any)[key];
//       }
//     }

//     return await deviceUser.save();
//   }

//   async getAllUserDevices() {
//     return await this.deviceUserModel.find({}).lean();
//   }

//   async getAllDevices() {
//     return await this.deviceDataModel.find({}).lean();
//   }

//   async getDatabaseInfo() {
//     try {
//       const connection = this.deviceUserModel.db;
//       const connectionString = process.env.MONGO_URI;
//       const databaseName = connection.name;

//       const collectionName = this.deviceUserModel.collection.name;
//       const collectionExists = await connection.db.listCollections({ name: collectionName }).hasNext();

//       const documentCount = await this.deviceUserModel.countDocuments();

//       const collections = await connection.db.listCollections().toArray();
//       const collectionNames = collections.map(col => col.name);

//       const sampleDocument = await this.deviceUserModel.findOne();

//       return {
//         connectionInfo: {
//           mongoUri: connectionString,
//           connectedDatabase: databaseName,
//           cluster: connectionString?.split('@')[1]?.split('/')[0],
//         },
//         collectionInfo: {
//           collectionName: collectionName,
//           collectionExists: collectionExists,
//           documentCount: documentCount,
//         },
//         databaseContents: {
//           allCollections: collectionNames,
//           totalCollections: collectionNames.length,
//         },
//         sampleDocument: sampleDocument,
//         modelInfo: {
//           modelName: this.deviceUserModel.modelName,
//           schemaPath: this.deviceUserModel.schema.paths,
//         }
//       };
//     } catch (error) {
//       return {
//         error: error.message,
//         stack: error.stack
//       };
//     }
//   }

//  //location part - anjana
//   async findDeviceLocationsForUser(email: string) {
//     const userDevices = await this.deviceUserModel.find({email }).select('deviceId location deviceName');

//     if (userDevices.length === 0) {
//       return {
//         success: true,
//         message: 'No devices found for user',
//         data: []
//       };
//     }

//     const locationsWithDevices = userDevices.map(device => ({
//       deviceId: device.deviceId,
//       deviceName: device.deviceName,
//       location: device.location || 'Location not set'
//     }));

//     return {
//       success: true,
//       message: 'Device locations retrieved successfully',
//       data: locationsWithDevices
//     };
//   }

// //update location
// async updateDeviceLocation(
//   deviceId: string,
//   updateData: { location: string },
//   email: string
// ): Promise<DeviceUser | null> {
//   try {

//     const updatedDevice = await this.deviceUserModel.findOneAndUpdate(
//       { deviceId, email },
//       { location: updateData.location },
//       { new: true }
//     );

//     if (!updatedDevice) {
//       throw new NotFoundException('Device not found for this user');
//     }

//     return updatedDevice;
//   } catch (error) {
//     console.error('Error updating device location:', error);
//     throw error;
//   }
// }

// }

// import {
//   Injectable,
//   BadRequestException,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import * as fs from 'fs';
// import * as path from 'path';
// import * as uuid from 'uuid';
// import { DeviceUser, DeviceUserDocument } from './schemas/device-user.schema';
// import {
//   DeviceData,
//   DeviceDataDocument,
// } from 'src/device/schemas/device.schema';
// import { CreateDeviceUserDto } from './dto/create-device-user.dto';
// import { NotificationsService } from '../notifications/notifications.service';
// import { Notification as NotificationInterface } from '../notifications/interfaces/notification.interface';
// import { Logger } from '@nestjs/common';
// import mongoose from 'mongoose';

// @Injectable()
// export class DeviceUserService {
//   private readonly uploadsDir = path.join(process.cwd(), 'Uploads', 'devices');
//   private readonly logger = new Logger(DeviceUserService.name);

//   constructor(
//     @InjectModel(DeviceUser.name)
//     private deviceUserModel: Model<DeviceUserDocument>,
//     @InjectModel(DeviceData.name)
//     private deviceDataModel: Model<DeviceDataDocument>,
//     private notificationsService: NotificationsService,
//   ) {}

//   async registerDevice(createDto: CreateDeviceUserDto): Promise<DeviceUser> {
//     try {
//       this.logger.log('=== REGISTER DEVICE START ===');
//       this.logger.log('Input data:', JSON.stringify(createDto));

//       const deviceExists = await this.deviceDataModel.findOne({
//         deviceId: createDto.deviceId,
//       });

//       if (!deviceExists) {
//         throw new BadRequestException(
//           `Device with ID '${createDto.deviceId}' does not exist in the system. Please check the device ID and try again.`,
//         );
//       }

//       this.logger.log('Device found in devicedatas:', JSON.stringify(deviceExists));

//       const alreadyRegistered = await this.deviceUserModel.findOne({
//         email: createDto.email,
//         deviceId: createDto.deviceId,
//       });

//       if (alreadyRegistered) {
//         throw new BadRequestException(
//           `Device '${createDto.deviceId}' is already registered to user`,
//         );
//       }

//       const deviceUser = new this.deviceUserModel(createDto);
//       const savedDevice = await deviceUser.save();

//       this.logger.log('Device registered successfully:', JSON.stringify(savedDevice));

//       // Send notification to the user
//       const notification: NotificationInterface = {
//         id: new mongoose.Types.ObjectId().toString(),
//         title: 'Device Registered',
//         message: `Device "${createDto.deviceName}" (ID: ${createDto.deviceId}) has been successfully registered to your account.`,
//         userId: createDto.email, // Use email as userId
//         timestamp: new Date().toISOString(),
//       };

//       try {
//         this.logger.log(
//           `Creating notification for user ${createDto.email}: ${notification.id}`,
//         );
//         await this.notificationsService.createNotification(notification);
//         this.logger.log(`Notification created successfully for user ${createDto.email}`);
//       } catch (notificationError) {
//         this.logger.error(
//           `Failed to create notification for user ${createDto.email}`,
//           notificationError.stack,
//         );
//         // Note: Not throwing an error here to avoid failing the registration due to notification issues
//       }

//       return savedDevice;
//     } catch (error) {
//       this.logger.error('Error in registerDevice:', error.stack);
//       throw error;
//     }
//   }

//   async testSave(testData: any) {
//     console.log('Model name:', this.deviceUserModel.modelName);
//     console.log('Collection name:', this.deviceUserModel.collection.name);
//     console.log('Test data:', testData);

//     const deviceUser = new this.deviceUserModel(testData);
//     console.log('Created instance:', deviceUser);

//     const saved = await deviceUser.save();
//     console.log('Saved result:', saved);

//     return saved;
//   }

//   async getDevicesForUser(email: string) {
//     console.log('=== GET DEVICES FOR USER ===');
//     console.log('Searching for userId:', email);

//     const userDevices = await this.deviceUserModel.find({ email });
//     console.log('Found userDevices:', userDevices);

//     if (userDevices.length === 0) {
//       console.log('No devices found for user:', email);
//       return [];
//     }

//     const deviceIds = userDevices.map((ud) => ud.deviceId);

//     const latestDeviceData = await this.deviceDataModel.aggregate([
//       { $match: { deviceId: { $in: deviceIds } } },
//       { $sort: { deviceId: 1, createdAt: -1 } },
//       {
//         $group: {
//           _id: '$deviceId',
//           latestData: { $first: '$$ROOT' },
//         },
//       },
//     ]);

//     const deviceDataMap = new Map();
//     latestDeviceData.forEach((item) => {
//       deviceDataMap.set(item._id, item.latestData);
//     });

//     const devicesWithData = userDevices.map((userDevice) => {
//       const deviceData = deviceDataMap.get(userDevice.deviceId);
//       console.log('Device data for', userDevice.deviceId, ':', deviceData);

//       return {
//         userDevice: userDevice.toObject(),
//         deviceData: deviceData || null,
//       };
//     });

//     console.log('Final devicesWithData:', devicesWithData);
//     return devicesWithData;
//   }

//   async getDeviceStatistics(email: string) {
//     try {
//       const userDevices = await this.deviceUserModel
//         .find({ email })
//         .select('deviceId');
//       const deviceIds = userDevices.map((ud) => ud.deviceId);

//       if (deviceIds.length === 0) {
//         return {
//           userId: email,
//           total: 0,
//           active: 0,
//           inactive: 0,
//         };
//       }

//       const stats = await this.deviceDataModel.aggregate([
//         { $match: { deviceId: { $in: deviceIds } } },
//         { $sort: { deviceId: 1, createdAt: -1 } },
//         {
//           $group: {
//             _id: '$deviceId',
//             latestIsActive: { $first: '$isActive' },
//             latestCreatedAt: { $first: '$createdAt' },
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             total: { $sum: 1 },
//             active: {
//               $sum: {
//                 $cond: [{ $eq: ['$latestIsActive', true] }, 1, 0],
//               },
//             },
//             inactive: {
//               $sum: {
//                 $cond: [{ $eq: ['$latestIsActive', false] }, 1, 0],
//               },
//             },
//           },
//         },
//       ]);

//       const result = stats[0] || { total: 0, active: 0, inactive: 0 };

//       return {
//         userId: email,
//         total: result.total,
//         active: result.active,
//         inactive: result.inactive,
//       };
//     } catch (error) {
//       console.error(`Error fetching device statistics for user:`, error);
//       throw error;
//     }
//   }

//   async getDeviceForUser(email: string, deviceId: string) {
//     const [userDevice, latestDeviceData] = await Promise.all([
//       this.deviceUserModel.findOne({ email, deviceId }),
//       this.deviceDataModel.findOne({ deviceId }).sort({ createdAt: -1 }),
//     ]);

//     if (!userDevice) {
//       throw new NotFoundException('Device not registered for this user');
//     }

//     if (!latestDeviceData) {
//       throw new NotFoundException('Device data not found in system');
//     }

//     return {
//       userDevice: userDevice.toObject(),
//       deviceData: latestDeviceData.toObject(),
//       status: latestDeviceData.isActive,
//     };
//   }

//   async unregisterDevice(email: string, deviceId: string): Promise<void> {
//     const result = await this.deviceUserModel.deleteOne({ email, deviceId });

//     if (result.deletedCount === 0) {
//       throw new NotFoundException('Device registration not found');
//     }
//   }

//   async updateDeviceUser(
//     email: string,
//     deviceId: string,
//     updateData: Partial<CreateDeviceUserDto>,
//     deviceImage?: Express.Multer.File,
//     removedeviceImage?: string,
//   ) {
//     const deviceExists = await this.deviceDataModel.exists({ deviceId });
//     if (!deviceExists)
//       throw new BadRequestException('Device does not exist in system');

//     const deviceUser = await this.deviceUserModel.findOne({ email, deviceId });
//     if (!deviceUser)
//       throw new NotFoundException('Device not registered for this user');

//     if (removedeviceImage === 'true') {
//       if (deviceUser.deviceImage?.startsWith('/uploads/')) {
//         const fileName = deviceUser.deviceImage.replace('/uploads/', '');
//         const filePath = path.join(this.uploadsDir, fileName);
//         if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//       }
//       deviceUser.deviceImage = null;
//     }

//     if (deviceImage && removedeviceImage !== 'true') {
//       if (deviceUser.deviceImage?.startsWith('/uploads/')) {
//         const oldFile = path.join(
//           this.uploadsDir,
//           deviceUser.deviceImage.replace('/uploads/', ''),
//         );
//         if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
//       }

//       const fileName = `${uuid.v4()}${path.extname(deviceImage.originalname)}`;
//       const fullPath = path.join(this.uploadsDir, fileName);

//       if (!fs.existsSync(this.uploadsDir))
//         fs.mkdirSync(this.uploadsDir, { recursive: true });

//       fs.writeFileSync(fullPath, deviceImage.buffer);
//       deviceUser.deviceImage = `/uploads/devices/${fileName}`;
//     }

//     for (const key in updateData) {
//       if (Object.prototype.hasOwnProperty.call(updateData, key)) {
//         (deviceUser as any)[key] = (updateData as any)[key];
//       }
//     }

//     return await deviceUser.save();
//   }

//   async getAllUserDevices() {
//     return await this.deviceUserModel.find({}).lean();
//   }

//   async getAllDevices() {
//     return await this.deviceDataModel.find({}).lean();
//   }

//   async getDatabaseInfo() {
//     try {
//       const connection = this.deviceUserModel.db;
//       const connectionString = process.env.MONGO_URI;
//       const databaseName = connection.name;

//       const collectionName = this.deviceUserModel.collection.name;
//       const collectionExists = await connection.db
//         .listCollections({ name: collectionName })
//         .hasNext();

//       const documentCount = await this.deviceUserModel.countDocuments();

//       const collections = await connection.db.listCollections().toArray();
//       const collectionNames = collections.map((col) => col.name);

//       const sampleDocument = await this.deviceUserModel.findOne();

//       return {
//         connectionInfo: {
//           mongoUri: connectionString,
//           connectedDatabase: databaseName,
//           cluster: connectionString?.split('@')[1]?.split('/')[0],
//         },
//         collectionInfo: {
//           collectionName: collectionName,
//           collectionExists: collectionExists,
//           documentCount: documentCount,
//         },
//         databaseContents: {
//           allCollections: collectionNames,
//           totalCollections: collectionNames.length,
//         },
//         sampleDocument: sampleDocument,
//         modelInfo: {
//           modelName: this.deviceUserModel.modelName,
//           schemaPath: this.deviceUserModel.schema.paths,
//         },
//       };
//     } catch (error) {
//       return {
//         error: error.message,
//         stack: error.stack,
//       };
//     }
//   }

//   async findDeviceLocationsForUser(email: string) {
//     const userDevices = await this.deviceUserModel
//       .find({ email })
//       .select('deviceId location deviceName');

//     if (userDevices.length === 0) {
//       return {
//         success: true,
//         message: 'No devices found for user',
//         data: [],
//       };
//     }

//     const locationsWithDevices = userDevices.map((device) => ({
//       deviceId: device.deviceId,
//       deviceName: device.deviceName,
//       location: device.location || 'Location not set',
//     }));

//     return {
//       success: true,
//       message: 'Device locations retrieved successfully',
//       data: locationsWithDevices,
//     };
//   }

//   async updateDeviceLocation(
//     deviceId: string,
//     updateData: { location: string },
//     email: string,
//   ): Promise<DeviceUser | null> {
//     try {
//       const updatedDevice = await this.deviceUserModel.findOneAndUpdate(
//         { deviceId, email },
//         { location: updateData.location },
//         { new: true },
//       );

//       if (!updatedDevice) {
//         throw new NotFoundException('Device not found for this user');
//       }

//       return updatedDevice;
//     } catch (error) {
//       console.error('Error updating device location:', error);
//       throw error;
//     }
//   }
// }

//device-user.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid';
import { DeviceUser, DeviceUserDocument } from './schemas/device-user.schema';
import {
  DeviceData,
  DeviceDataDocument,
} from 'src/device/schemas/device.schema';
import { CreateDeviceUserDto } from './dto/create-device-user.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Notification as NotificationInterface } from '../notifications/interfaces/notification.interface';
import { Logger } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class DeviceUserService {
  private readonly uploadsDir = path.join(process.cwd(), 'Uploads', 'devices');
  private readonly logger = new Logger(DeviceUserService.name);

  constructor(
    @InjectModel(DeviceUser.name)
    private deviceUserModel: Model<DeviceUserDocument>,
    @InjectModel(DeviceData.name)
    private deviceDataModel: Model<DeviceDataDocument>,
    private notificationsService: NotificationsService,
  ) {}

  private isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async registerDevice(createDto: CreateDeviceUserDto): Promise<DeviceUser> {
    try {
      this.logger.log('=== REGISTER DEVICE START ===');
      this.logger.log('Input data:', JSON.stringify(createDto));

      // Validate email
      if (!this.isValidEmail(createDto.email)) {
        this.logger.error(`Invalid email format: ${createDto.email}`);
        throw new BadRequestException('Invalid email format');
      }

      // Check if device exists in deviceData
      const deviceExists = await this.deviceDataModel.findOne({
        deviceId: createDto.deviceId,
      });

      if (!deviceExists) {
        this.logger.error(`Device not found: ${createDto.deviceId}`);
        throw new BadRequestException(
          `Device with ID '${createDto.deviceId}' does not exist in the system. Please check the device ID and try again.`,
        );
      }

      this.logger.log(
        'Device found in devicedatas:',
        JSON.stringify(deviceExists),
      );

      // Check if device is already registered to user
      const alreadyRegistered = await this.deviceUserModel.findOne({
        email: createDto.email,
        deviceId: createDto.deviceId,
      });

      if (alreadyRegistered) {
        this.logger.warn(
          `Device already registered: ${createDto.deviceId} for user ${createDto.email}`,
        );
        throw new BadRequestException(
          `Device '${createDto.deviceId}' is already registered to user`,
        );
      }

      // Register device
      const deviceUser = new this.deviceUserModel(createDto);
      const savedDevice = await deviceUser.save();

      this.logger.log(
        'Device registered successfully:',
        JSON.stringify(savedDevice),
      );

      // Send notification to the user
      const notification: NotificationInterface = {
        id: new mongoose.Types.ObjectId().toString(),
        title: 'Device Registered',
        message: `Device "${createDto.deviceName}" (ID: ${createDto.deviceId}) has been successfully registered to your account.`,
        userId: createDto.email, // Use email as userId
        timestamp: new Date().toISOString(),
      };

      try {
        this.logger.log(
          `Creating notification for user ${createDto.email}: ${notification.id}`,
        );
        await this.notificationsService.createNotification(notification);
        this.logger.log(
          `Notification created successfully for user ${createDto.email}`,
        );
      } catch (notificationError) {
        this.logger.error(
          `Failed to create notification for user ${createDto.email}:`,
          notificationError.stack,
        );
        // Not throwing an error to avoid failing registration
      }

      return savedDevice;
    } catch (error) {
      this.logger.error('Error in registerDevice:', error.stack);
      throw error;
    }
  }

  async testSave(testData: any) {
    this.logger.log('Model name:', this.deviceUserModel.modelName);
    this.logger.log('Collection name:', this.deviceUserModel.collection.name);
    this.logger.log('Test data:', testData);

    const deviceUser = new this.deviceUserModel(testData);
    this.logger.log('Created instance:', deviceUser);

    const saved = await deviceUser.save();
    this.logger.log('Saved result:', saved);

    return saved;
  }

  async getDevicesForUser(email: string) {
    this.logger.log('=== GET DEVICES FOR USER ===');
    this.logger.log('Searching for userId:', email);

    const userDevices = await this.deviceUserModel.find({ email });
    this.logger.log('Found userDevices:', userDevices);

    if (userDevices.length === 0) {
      this.logger.log('No devices found for user:', email);
      return [];
    }

    const deviceIds = userDevices.map((ud) => ud.deviceId);

    const latestDeviceData = await this.deviceDataModel.aggregate([
      { $match: { deviceId: { $in: deviceIds } } },
      { $sort: { deviceId: 1, createdAt: -1 } },
      {
        $group: {
          _id: '$deviceId',
          latestData: { $first: '$$ROOT' },
        },
      },
    ]);

    const deviceDataMap = new Map();
    latestDeviceData.forEach((item) => {
      deviceDataMap.set(item._id, item.latestData);
    });

    const devicesWithData = userDevices.map((userDevice) => {
      const deviceData = deviceDataMap.get(userDevice.deviceId);
      this.logger.log('Device data for', userDevice.deviceId, ':', deviceData);

      return {
        userDevice: userDevice.toObject(),
        deviceData: deviceData || null,
      };
    });

    this.logger.log('Final devicesWithData:', devicesWithData);
    return devicesWithData;
  }

  async getDeviceStatistics(email: string) {
    try {
      const userDevices = await this.deviceUserModel
        .find({ email })
        .select('deviceId');
      const deviceIds = userDevices.map((ud) => ud.deviceId);

      if (deviceIds.length === 0) {
        return {
          userId: email,
          total: 0,
          active: 0,
          inactive: 0,
        };
      }

      const stats = await this.deviceDataModel.aggregate([
        { $match: { deviceId: { $in: deviceIds } } },
        { $sort: { deviceId: 1, createdAt: -1 } },
        {
          $group: {
            _id: '$deviceId',
            latestIsActive: { $first: '$isActive' },
            latestCreatedAt: { $first: '$createdAt' },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: {
                $cond: [{ $eq: ['$latestIsActive', true] }, 1, 0],
              },
            },
            inactive: {
              $sum: {
                $cond: [{ $eq: ['$latestIsActive', false] }, 1, 0],
              },
            },
          },
        },
      ]);

      const result = stats[0] || { total: 0, active: 0, inactive: 0 };

      return {
        userId: email,
        total: result.total,
        active: result.active,
        inactive: result.inactive,
      };
    } catch (error) {
      this.logger.error(`Error fetching device statistics for user:`, error);
      throw error;
    }
  }

  async getDeviceForUser(email: string, deviceId: string) {
    const [userDevice, latestDeviceData] = await Promise.all([
      this.deviceUserModel.findOne({ email, deviceId }),
      this.deviceDataModel.findOne({ deviceId }).sort({ createdAt: -1 }),
    ]);

    if (!userDevice) {
      throw new NotFoundException('Device not registered for this user');
    }

    if (!latestDeviceData) {
      throw new NotFoundException('Device data not found in system');
    }

    return {
      userDevice: userDevice.toObject(),
      deviceData: latestDeviceData.toObject(),
      status: latestDeviceData.isActive,
    };
  }

  async unregisterDevice(email: string, deviceId: string): Promise<void> {
    const result = await this.deviceUserModel.deleteOne({ email, deviceId });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Device registration not found');
    }
  }

  async updateDeviceUser(
    email: string,
    deviceId: string,
    updateData: Partial<CreateDeviceUserDto>,
    deviceImage?: Express.Multer.File,
    removedeviceImage?: string,
  ) {
    const deviceExists = await this.deviceDataModel.exists({ deviceId });
    if (!deviceExists)
      throw new BadRequestException('Device does not exist in system');

    const deviceUser = await this.deviceUserModel.findOne({ email, deviceId });
    if (!deviceUser)
      throw new NotFoundException('Device not registered for this user');

    if (removedeviceImage === 'true') {
      if (deviceUser.deviceImage?.startsWith('/uploads/')) {
        const fileName = deviceUser.deviceImage.replace('/uploads/', '');
        const filePath = path.join(this.uploadsDir, fileName);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      deviceUser.deviceImage = null;
    }

    if (deviceImage && removedeviceImage !== 'true') {
      if (deviceUser.deviceImage?.startsWith('/uploads/')) {
        const oldFile = path.join(
          this.uploadsDir,
          deviceUser.deviceImage.replace('/uploads/', ''),
        );
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
      }

      const fileName = `${uuid.v4()}${path.extname(deviceImage.originalname)}`;
      const fullPath = path.join(this.uploadsDir, fileName);

      if (!fs.existsSync(this.uploadsDir))
        fs.mkdirSync(this.uploadsDir, { recursive: true });

      fs.writeFileSync(fullPath, deviceImage.buffer);
      deviceUser.deviceImage = `/uploads/devices/${fileName}`;
    }

    for (const key in updateData) {
      if (Object.prototype.hasOwnProperty.call(updateData, key)) {
        (deviceUser as any)[key] = (updateData as any)[key];
      }
    }

    return await deviceUser.save();
  }

  async getAllUserDevices() {
    return await this.deviceUserModel.find({}).lean();
  }

  async getAllDevices() {
    return await this.deviceDataModel.find({}).lean();
  }

  async getDatabaseInfo() {
    try {
      const connection = this.deviceUserModel.db;
      const connectionString = process.env.MONGO_URI;
      const databaseName = connection.name;

      const collectionName = this.deviceUserModel.collection.name;
      const collectionExists = await connection.db
        .listCollections({ name: collectionName })
        .hasNext();

      const documentCount = await this.deviceUserModel.countDocuments();

      const collections = await connection.db.listCollections().toArray();
      const collectionNames = collections.map((col) => col.name);

      const sampleDocument = await this.deviceUserModel.findOne();

      return {
        connectionInfo: {
          mongoUri: connectionString,
          connectedDatabase: databaseName,
          cluster: connectionString?.split('@')[1]?.split('/')[0],
        },
        collectionInfo: {
          collectionName: collectionName,
          collectionExists: collectionExists,
          documentCount: documentCount,
        },
        databaseContents: {
          allCollections: collectionNames,
          totalCollections: collectionNames.length,
        },
        sampleDocument: sampleDocument,
        modelInfo: {
          modelName: this.deviceUserModel.modelName,
          schemaPath: this.deviceUserModel.schema.paths,
        },
      };
    } catch (error) {
      return {
        error: error.message,
        stack: error.stack,
      };
    }
  }

  async findDeviceLocationsForUser(email: string) {
    const userDevices = await this.deviceUserModel
      .find({ email })
      .select('deviceId location deviceName');

    if (userDevices.length === 0) {
      return {
        success: true,
        message: 'No devices found for user',
        data: [],
      };
    }

    const locationsWithDevices = userDevices.map((device) => ({
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      location: device.location || 'Location not set',
    }));

    return {
      success: true,
      message: 'Device locations retrieved successfully',
      data: locationsWithDevices,
    };
  }

  async updateDeviceLocation(
    deviceId: string,
    updateData: { location: string },
    email: string,
  ): Promise<DeviceUser | null> {
    try {
      const updatedDevice = await this.deviceUserModel.findOneAndUpdate(
        { deviceId, email },
        { location: updateData.location },
        { new: true },
      );

      if (!updatedDevice) {
        throw new NotFoundException('Device not found for this user');
      }

      return updatedDevice;
    } catch (error) {
      this.logger.error('Error updating device location:', error);
      throw error;
    }
  }
}
