import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // Updates or creates a user's FCM token in the database
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

  //Retrieves the FCM token for a given user
  async getFcmToken(userId: string): Promise<string | null> {
    const user = await this.userModel.findOne({ userId }).exec();
    return user?.fcmToken || null;
  }
}
