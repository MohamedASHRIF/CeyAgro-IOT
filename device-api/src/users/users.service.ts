import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getFcmToken(userId: string): Promise<string | null> {
    try {
      if (!this.isValidEmail(userId)) {
        this.logger.warn(`Invalid email format for userId: ${userId}`);
        throw new BadRequestException('Invalid email format');
      }
      const user = await this.userModel.findOne({ userId }).exec();
      if (!user) {
        this.logger.warn(`User not found: ${userId}`);
        return null;
      }
      // return user.fcmToken || null;
    } catch (error) {
      this.logger.error(
        `Error retrieving FCM token for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  async updateFcmToken(userId: string, fcmToken: string | null): Promise<void> {
    try {
      if (!this.isValidEmail(userId)) {
        this.logger.error(`Invalid email format for userId: ${userId}`);
        throw new BadRequestException('Invalid email format');
      }
      if (fcmToken && !this.isValidFcmToken(fcmToken)) {
        this.logger.error(`Invalid FCM token format for user ${userId}`);
        throw new BadRequestException('Invalid FCM token format');
      }
      await this.ensureUserExists(userId);
      const user = await this.userModel
        .findOneAndUpdate({ userId }, { fcmToken }, { upsert: true, new: true })
        .exec();
      this.logger.log(`Updated FCM token for user ${userId}: ${fcmToken}`);
    } catch (error) {
      this.logger.error(`Error updating FCM token for user ${userId}:`, error);
      throw error;
    }
  }

  async ensureUserExists(userId: string): Promise<void> {
    try {
      if (!this.isValidEmail(userId)) {
        this.logger.error(`Invalid email format for userId: ${userId}`);
        throw new BadRequestException('Invalid email format');
      }
      const user = await this.userModel.findOne({ userId }).exec();
      if (!user) {
        await this.userModel.create({ userId, fcmToken: null });
        this.logger.log(`Created new user: ${userId}`);
      }
    } catch (error) {
      this.logger.error(`Error ensuring user exists for ${userId}:`, error);
      throw error;
    }
  }

  private isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidFcmToken(token: string): boolean {
    return typeof token === 'string' && token.length > 100;
  }
}
