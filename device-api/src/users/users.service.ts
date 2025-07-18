// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { User } from './schemas/user.schema';

// @Injectable()
// export class UsersService {
//   constructor(@InjectModel(User.name) private userModel: Model<User>) {}

//   // Updates or creates a user's FCM token in the database
//   async updateFcmToken(userId: string, fcmToken: string | null): Promise<void> {
//     console.log(`Updating FCM token for user ${userId}:`, fcmToken);
//     const result = await this.userModel
//       .findOneAndUpdate(
//         { userId },
//         { userId, fcmToken },
//         { upsert: true, new: true },
//       )
//       .exec();
//     console.log('MongoDB update result:', result);
//   }

//   //Retrieves the FCM token for a given user
//   async getFcmToken(userId: string): Promise<string | null> {
//     const user = await this.userModel.findOne({ userId }).exec();
//     return user?.fcmToken || null;
//   }
// }



// // users/users.service.ts
// import { Injectable, Logger } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { User, UserDocument } from './schemas/user.schema';

// @Injectable()
// export class UsersService {
//   private readonly logger = new Logger(UsersService.name);

//   constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

//   async getFcmToken(userId: string): Promise<string | null> {
//     try {
//       const user = await this.userModel.findOne({ userId }).exec();
//       if (!user) {
//         this.logger.warn(`User not found: ${userId}`);
//         return null;
//       }
//       return user.fcmToken || null;
//     } catch (error) {
//       this.logger.error(`Error retrieving FCM token for user ${userId}:`, error);
//       return null;
//     }
//   }

//   async updateFcmToken(userId: string, fcmToken: string | null): Promise<void> {
//     try {
//       const user = await this.userModel
//         .findOneAndUpdate(
//           { userId },
//           { fcmToken },
//           { upsert: true, new: true },
//         )
//         .exec();
//       this.logger.log(`Updated FCM token for user ${userId}: ${fcmToken}`);
//     } catch (error) {
//       this.logger.error(`Error updating FCM token for user ${userId}:`, error);
//       throw error;
//     }
//   }

//   // New method to ensure user exists
//   async ensureUserExists(userId: string): Promise<void> {
//     try {
//       const user = await this.userModel.findOne({ userId }).exec();
//       if (!user) {
//         await this.userModel.create({ userId, fcmToken: null });
//         this.logger.log(`Created new user: ${userId}`);
//       }
//     } catch (error) {
//       this.logger.error(`Error ensuring user exists for ${userId}:`, error);
//       throw error;
//     }
//   }
// }









// import { Injectable, Logger } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { User, UserDocument } from './schemas/user.schema';

// @Injectable()
// export class UsersService {
//   private readonly logger = new Logger(UsersService.name);

//   constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

//   async getFcmToken(userId: string): Promise<string | null> {
//     try {
//       if (!this.isValidEmail(userId)) {
//         this.logger.warn(`Invalid email format for userId: ${userId}`);
//         return null;
//       }
//       const user = await this.userModel.findOne({ userId }).exec();
//       if (!user) {
//         this.logger.warn(`User not found: ${userId}`);
//         return null;
//       }
//       return user.fcmToken || null;
//     } catch (error) {
//       this.logger.error(`Error retrieving FCM token for user ${userId}:`, error);
//       return null;
//     }
//   }

//   async updateFcmToken(userId: string, fcmToken: string | null): Promise<void> {
//     try {
//       if (!this.isValidEmail(userId)) {
//         this.logger.error(`Invalid email format for userId: ${userId}`);
//         throw new Error('Invalid email format');
//       }
//       if (fcmToken && !this.isValidFcmToken(fcmToken)) {
//         this.logger.error(`Invalid FCM token format for user ${userId}`);
//         throw new Error('Invalid FCM token format');
//       }
//       await this.ensureUserExists(userId);
//       const user = await this.userModel
//         .findOneAndUpdate(
//           { userId },
//           { fcmToken },
//           { upsert: true, new: true },
//         )
//         .exec();
//       this.logger.log(`Updated FCM token for user ${userId}: ${fcmToken}`);
//     } catch (error) {
//       this.logger.error(`Error updating FCM token for user ${userId}:`, error);
//       throw error;
//     }
//   }

//   async ensureUserExists(userId: string): Promise<void> {
//     try {
//       if (!this.isValidEmail(userId)) {
//         this.logger.error(`Invalid email format for userId: ${userId}`);
//         throw new Error('Invalid email format');
//       }
//       const user = await this.userModel.findOne({ userId }).exec();
//       if (!user) {
//         await this.userModel.create({ userId, fcmToken: null });
//         this.logger.log(`Created new user: ${userId}`);
//       }
//     } catch (error) {
//       this.logger.error(`Error ensuring user exists for ${userId}:`, error);
//       throw error;
//     }
//   }

//   private isValidEmail(email: string): boolean {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   }

//   private isValidFcmToken(token: string): boolean {
//     // FCM tokens are typically long strings (around 150-200 characters)
//     return typeof token === 'string' && token.length > 100;
//   }
// }


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
      return user.fcmToken || null;
    } catch (error) {
      this.logger.error(`Error retrieving FCM token for user ${userId}:`, error);
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
        .findOneAndUpdate(
          { userId },
          { fcmToken },
          { upsert: true, new: true },
        )
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