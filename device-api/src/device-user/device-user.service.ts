

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
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

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
import { ActivityLogService } from 'src/activity-log/act-log.service';
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getCloudinaryPublicId(url: string): string | null {
  if (!url) return null;
  const parts = url.split('/');
  const lastPart = parts[parts.length - 1];
  const [publicId] = lastPart.split('.');
  return parts.slice(parts.length - 2, parts.length - 1)[0] + '/' + publicId;
}

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
 private readonly activityLogService: ActivityLogService,
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

    // Check if device ID is already registered (by anyone)
    const deviceIdExists = await this.deviceUserModel.findOne({
      deviceId: createDto.deviceId,
    });

    this.logger.log(`Checking if device ID exists: ${createDto.deviceId}`);
    this.logger.log(`Device ID exists result:`, JSON.stringify(deviceIdExists));

    if (deviceIdExists) {
      this.logger.warn(
        `Device ID already registered globally: ${createDto.deviceId} by another user.`,
      );
      throw new BadRequestException(
        `Device ID '${createDto.deviceId}' is already registered by another user.Please check your device ID and try again.`,
      );
    }

    // Check if serial number is already registered (by anyone) - only if serial number is provided
    if (createDto.serialNumber && createDto.serialNumber.trim() !== '') {
      const serialNumberExists = await this.deviceUserModel.findOne({
        serialNumber: createDto.serialNumber,
      });

      this.logger.log(`Checking if serial number exists: ${createDto.serialNumber}`);
      this.logger.log(`Serial number exists result:`, JSON.stringify(serialNumberExists));

      if (serialNumberExists) {
        this.logger.warn(
          `Serial number already registered globally: ${createDto.serialNumber} by another user.Please check your serial number and try again`,
        );
        throw new BadRequestException(
          `Serial number '${createDto.serialNumber}' is already registered by another user.`,
        );
      }
    }

    // Register device
    const deviceUser = new this.deviceUserModel(createDto);
    const savedDevice = await deviceUser.save();
     
    await this.activityLogService.log(
  createDto.email,
  'REGISTER_DEVICE',
  createDto.deviceId,
  `You have registered device: ${createDto.deviceName}`
);

    this.logger.log(
      'Device registered successfully:',
      JSON.stringify(savedDevice),
    );

    // Send notification to the user
    const notification: NotificationInterface = {
      id: new mongoose.Types.ObjectId().toString(),
      title: 'Device Registered',
      message: `Device "${createDto.deviceName}" (ID: ${createDto.deviceId}) has been successfully registered to your account.`,
      userId: createDto.email,
      timestamp: new Date().toISOString(),
      read: false,
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
      // Don't throw, registration should still succeed
    }

    return savedDevice;
  } catch (error) {
    this.logger.error('Error in registerDevice:', error.message, error.code, error.stack);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const duplicatedField = Object.keys(error.keyValue || {})[0];
      const duplicatedValue = error.keyValue?.[duplicatedField];

      if (duplicatedField === 'deviceId') {
        throw new BadRequestException(`Device ID '${duplicatedValue}' is already registered.`);
      }

      if (duplicatedField === 'serialNumber') {
        throw new BadRequestException(`Serial Number '${duplicatedValue}' is already registered.`);
      }

      throw new BadRequestException('Device ID or Serial Number is already registered.');
    }

    throw error;
  }
}


//test
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
    await this.activityLogService.log(
  email,
  'DELETE_DEVICE',
  deviceId,
  `You have deleted your device: ${deviceId}`
);

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

  const oldImage = deviceUser.deviceImage;
  const changes: Record<string, { oldValue: any; newValue: any }> = {};

  // ✅ Remove existing image
  if (removedeviceImage === 'true') {
    if (deviceUser.deviceImage?.startsWith('http')) {
      const publicId = getCloudinaryPublicId(deviceUser.deviceImage);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    } else if (deviceUser.deviceImage?.startsWith('/uploads/')) {
      const filePath = path.join(this.uploadsDir, deviceUser.deviceImage.replace('/uploads/', ''));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    deviceUser.deviceImage = null;
  }

  // ✅ Upload new image to Cloudinary if provided
  if (deviceImage && removedeviceImage !== 'true') {
    // Delete old image first
    if (deviceUser.deviceImage?.startsWith('http')) {
      const publicId = getCloudinaryPublicId(deviceUser.deviceImage);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    } else if (deviceUser.deviceImage?.startsWith('/uploads/')) {
      const oldFile = path.join(this.uploadsDir, deviceUser.deviceImage.replace('/uploads/', ''));
      if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
    }

    // Upload to Cloudinary folder: "device-imgs"
    const uploadedUrl = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'device-imgs' },
        (error, result) => {
          if (error || !result) return reject(error || new Error('Cloudinary upload failed'));
          resolve(result.secure_url); // 👈 this is what we store in MongoDB
        },
      );
      streamifier.createReadStream(deviceImage.buffer).pipe(uploadStream);
    });

    deviceUser.deviceImage = uploadedUrl;
  }

  // ✅ Track changes for image
  if (oldImage !== deviceUser.deviceImage) {
    changes.deviceImage = {
      oldValue: oldImage,
      newValue: deviceUser.deviceImage,
    };
  }

  // ✅ Track and apply other changes
  for (const key in updateData) {
    if (Object.prototype.hasOwnProperty.call(updateData, key)) {
      const oldValue = (deviceUser as any)[key];
      const newValue = (updateData as any)[key];
      if (oldValue !== newValue) {
        changes[key] = { oldValue, newValue };
        (deviceUser as any)[key] = newValue;
      }
    }
  }

  const updatedDevice = await deviceUser.save();

  // ✅ Log activity
  await this.activityLogService.log(
    email,
    'EDIT_DEVICE',
    deviceId,
    `You have successfully updated device: ${updateData.deviceName || deviceUser.deviceName}`,
    changes,
  );

  return updatedDevice;
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

/*// src/device-user/device-user.service.ts
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
import { ActivityLogService,LogMetadata } from 'src/activity-log/act-log.service';
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
    private readonly activityLogService: ActivityLogService, // Add ActivityLogService
  ) {}

  private isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async registerDevice(
    createDto: CreateDeviceUserDto, 
    metadata?: LogMetadata
  ): Promise<DeviceUser> {
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

      // Check if device ID is already registered (by anyone)
      const deviceIdExists = await this.deviceUserModel.findOne({
        deviceId: createDto.deviceId,
      });

      this.logger.log(`Checking if device ID exists: ${createDto.deviceId}`);
      this.logger.log(`Device ID exists result:`, JSON.stringify(deviceIdExists));

      if (deviceIdExists) {
        this.logger.warn(
          `Device ID already registered globally: ${createDto.deviceId} by another user.`,
        );
        throw new BadRequestException(
          `Device ID '${createDto.deviceId}' is already registered by another user.Please check your device ID and try again.`,
        );
      }

      // Check if serial number is already registered (by anyone)
      if (createDto.serialNumber && createDto.serialNumber.trim() !== '') {
        const serialNumberExists = await this.deviceUserModel.findOne({
          serialNumber: createDto.serialNumber,
        });

        this.logger.log(`Checking if serial number exists: ${createDto.serialNumber}`);
        this.logger.log(`Serial number exists result:`, JSON.stringify(serialNumberExists));

        if (serialNumberExists) {
          this.logger.warn(
            `Serial number already registered globally: ${createDto.serialNumber} by another user.`,
          );
          throw new BadRequestException(
            `Serial number '${createDto.serialNumber}' is already registered by another user.`,
          );
        }
      }

      // Register device
      const deviceUser = new this.deviceUserModel(createDto);
      const savedDevice = await deviceUser.save();

      this.logger.log(
        'Device registered successfully:',
        JSON.stringify(savedDevice),
      );

      // Log activity - Device Registration
      await this.activityLogService.logDeviceRegistered(
        createDto.email,
        {
          deviceId: savedDevice.deviceId,
          deviceName: savedDevice.deviceName || createDto.deviceName,
          ...savedDevice.toObject()
        },
        metadata
      );

      // Send notification to the user
      const notification: NotificationInterface = {
        id: new mongoose.Types.ObjectId().toString(),
        title: 'Device Registered',
        message: `Device "${createDto.deviceName}" (ID: ${createDto.deviceId}) has been successfully registered to your account.`,
        userId: createDto.email,
        timestamp: new Date().toISOString(),
        read: false,
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
      }

      return savedDevice;
    } catch (error) {
      this.logger.error('Error in registerDevice:', error.message, error.code, error.stack);

      // Handle MongoDB duplicate key error
      if (error.code === 11000) {
        const duplicatedField = Object.keys(error.keyValue || {})[0];
        const duplicatedValue = error.keyValue?.[duplicatedField];

        if (duplicatedField === 'deviceId') {
          throw new BadRequestException(`Device ID '${duplicatedValue}' is already registered.`);
        }

        if (duplicatedField === 'serialNumber') {
          throw new BadRequestException(`Serial Number '${duplicatedValue}' is already registered.`);
        }

        throw new BadRequestException('Device ID or Serial Number is already registered.');
      }

      throw error;
    }
  }

  async unregisterDevice(
    email: string, 
    deviceId: string, 
    metadata?: LogMetadata
  ): Promise<void> {
    // Get device data before deletion for logging
    const device = await this.deviceUserModel.findOne({ email, deviceId });
    
    if (!device) {
      throw new NotFoundException('Device registration not found');
    }

    const result = await this.deviceUserModel.deleteOne({ email, deviceId });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Device registration not found');
    }

    // Log activity - Device Unregistration
    await this.activityLogService.logDeviceUnregistered(
      email,
      {
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        ...device.toObject()
      },
      metadata
    );

    this.logger.log(`Device unregistered: ${device.deviceName} by ${email}`);
  }

  async updateDeviceUser(
    email: string,
    deviceId: string,
    updateData: Partial<CreateDeviceUserDto>,
    deviceImage?: Express.Multer.File,
    removedeviceImage?: string,
    metadata?: LogMetadata
  ) {
    const deviceExists = await this.deviceDataModel.exists({ deviceId });
    if (!deviceExists)
      throw new BadRequestException('Device does not exist in system');

    // Get old device data before update for logging
    const oldDeviceUser = await this.deviceUserModel.findOne({ email, deviceId }).lean();
    if (!oldDeviceUser)
      throw new NotFoundException('Device not registered for this user');

    const deviceUser = await this.deviceUserModel.findOne({ email, deviceId });

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

    const updatedDevice = await deviceUser.save();

    // Log activity - Device Update
    await this.activityLogService.logDeviceEdited(
      email,
      oldDeviceUser,
      updatedDevice.toObject(),
      metadata
    );

    this.logger.log(`Device updated: ${updatedDevice.deviceName} by ${email}`);

    return updatedDevice;
  }

  async updateDeviceLocation(
    deviceId: string,
    updateData: { location: string },
    email: string,
    metadata?: LogMetadata
  ): Promise<DeviceUser | null> {
    try {
      // Get old device data before update
      const oldDevice = await this.deviceUserModel.findOne({ deviceId, email }).lean();
      
      if (!oldDevice) {
        throw new NotFoundException('Device not found for this user');
      }

      const updatedDevice = await this.deviceUserModel.findOneAndUpdate(
        { deviceId, email },
        { location: updateData.location },
        { new: true },
      );

      // Log activity - Location Update (as device edit)
      await this.activityLogService.logDeviceEdited(
        email,
        oldDevice,
        updatedDevice.toObject(),
        metadata
      );

      this.logger.log(`Device location updated: ${updatedDevice.deviceName} by ${email}`);

      return updatedDevice;
    } catch (error) {
      this.logger.error('Error updating device location:', error);
      throw error;
    }
  }

  // Rest of your existing methods remain the same...
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
}
*/