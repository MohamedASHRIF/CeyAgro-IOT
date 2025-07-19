import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeviceData, DeviceDataDocument } from './schemas/device.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { KafkaContext } from '@nestjs/microservices';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);

  constructor(
    @InjectModel(DeviceData.name) private deviceDataModel: Model<DeviceDataDocument>,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  async processIoTData(data: any, context: KafkaContext) {
    const topic = context.getTopic();
    this.logger.log(
      `Received message from topic ${topic}: ${JSON.stringify(data)}`,
    );

    try {
      // Handle userId - if it's missing, undefined, null, or "unknown", use default
      let userId = data.userId;
      if (!userId || userId === "unknown" || userId === "undefined" || userId === "null") {
        userId = "test@example.com";
      }
      
      // Only validate email if userId is provided and not a default
      if (userId !== "test@example.com" && !this.isValidEmail(userId)) {
        throw new BadRequestException(`Invalid email format for userId: ${userId}`);
      }

      // Try to ensure user exists, but don't fail if it doesn't work
      try {
        await this.usersService.ensureUserExists(userId);
      } catch (userError) {
        this.logger.warn(`Failed to ensure user exists: ${userError.message}`);
        // Continue anyway - don't fail the whole request
      }

      const deviceData = new this.deviceDataModel({
        deviceId: data.deviceId,
        temperatureValue: data.temperatureValue,
        humidityValue: data.humidityValue,
        isActive: data.isActive ?? true,
        date: data.date ? new Date(data.date) : new Date(),
        topic: topic,
        userId,
      });

      await deviceData.save();
      this.logger.log(`Saved device data for deviceId ${data.deviceId} to MongoDB`);

      // Try to create notification, but don't fail if it doesn't work
      try {
        await this.notificationsService.createNotification({
          title: 'New Device Added',
          message: `Device ${data.deviceId} has been added with temperature ${data.temperatureValue}°C and humidity ${data.humidityValue}%.`,
          userId,
        });
      } catch (notificationError) {
        this.logger.warn(`Failed to create notification: ${notificationError.message}`);
        // Continue anyway - don't fail the whole request
      }

      return { status: "processed", data: deviceData };
    } catch (error) {
      this.logger.error(
        `Failed to process IoT data for deviceId ${data.deviceId}`,
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
    return this.deviceDataModel.find({ deviceId }).sort({ createdAt: -1 }).exec();
  }

  async getLatestDeviceData(deviceId: string) {
    return this.deviceDataModel
      .findOne({ deviceId })
      .sort({ createdAt: -1 })
      .exec();
  }
}