import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async updateFcmToken(userId: string, fcmToken: string | null): Promise<void> {
    console.log(`Updating FCM token for user ${userId}:`, fcmToken);
    const result = await this.userModel
      .findOneAndUpdate(
        { userId },
        { userId, fcmToken },
        { upsert: true, new: true },
      )
      .exec();
    console.log('MongoDB update result:', result);
  }

  async getFcmToken(userId: string): Promise<string | null> {
    const user = await this.userModel.findOne({ userId }).exec();
    return user?.fcmToken || null;
  }
}
