// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import {
//   Notification,
//   NotificationDocument,
// } from './schemas/notification.schema';
// import { NotificationsGateway } from './notifications.gateway';
// import { Notification as NotificationInterface } from './interfaces/notification.interface';
// import { FirebaseService } from '../firebase/firebase.service';
// import { UsersService } from '../users/users.service';
// import mongoose from 'mongoose';

// @Injectable()
// export class NotificationsService {
//   constructor(
//     @InjectModel(Notification.name)
//     private notificationModel: Model<NotificationDocument>,
//     private notificationsGateway: NotificationsGateway,
//     private firebaseService: FirebaseService,
//     private usersService: UsersService,
//   ) {}

//   //create notifications
//   async createNotification(
//     notification: Partial<NotificationInterface>,
//   ): Promise<NotificationInterface> {
//     const notificationId = new mongoose.Types.ObjectId().toString();
//     const newNotification = new this.notificationModel({
//       ...notification,
//       _id: notificationId,
//     });
//     // Save the notification to the database
//     const saved: NotificationDocument = await newNotification.save();
//     const result = {
//       id: saved.id.toString(),
//       title: saved.title,
//       message: saved.message,
//       userId: saved.userId,
//       timestamp: saved.timestamp,
//     };
//     console.log('Notification created:', result);

//     // Emit WebSocket notification
//     this.notificationsGateway.emitNotification(result);

//     // get FCM token and Send push notification using firebase
//     const fcmToken = await this.usersService.getFcmToken(result.userId);
//     if (fcmToken) {
//       try {
//         await this.firebaseService.sendPushNotification(
//           fcmToken,
//           result.title,
//           result.message,
//         );
//       } catch (error) {
//         console.error(
//           `Failed to send push notification for user ${result.userId}:`,
//           error,
//         );
//         // Optionally, remove invalid token
//         if (error.code === 'messaging/registration-token-not-registered') {
//           await this.usersService.updateFcmToken(result.userId, null);
//           console.log(`Cleared invalid FCM token for user ${result.userId}`);
//         }
//       }
//     } else {
//       console.log(`No FCM token found for user ${result.userId}`);
//     }

//     return result;
//   }

//   //Finds all notifications for a specific user, sorted by latest first
//   async findAllByUserId(userId: string): Promise<NotificationInterface[]> {
//     const notifications = await this.notificationModel
//       .find({ userId })
//       .sort({ timestamp: -1 })
//       .exec();
//     return notifications.map((notification) => ({
//       id: notification.id.toString(),
//       title: notification.title,
//       message: notification.message,
//       userId: notification.userId,
//       timestamp: notification.timestamp,
//     }));
//   }

//   // Deletes a notification by its ID and notifies the frontend via WebSocket
//   async deleteNotification(id: string): Promise<void> {
//     await this.notificationModel.findByIdAndDelete(id).exec();
//     console.log('Notification deleted, emitting notificationDeleted:', id);
//     this.notificationsGateway.emitNotificationDeleted(id);
//   }
// }

// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import {
//   Notification,
//   NotificationDocument,
// } from './schemas/notification.schema';
// import { NotificationsGateway } from './notifications.gateway';
// import { Notification as NotificationInterface } from './interfaces/notification.interface';
// import { FirebaseService } from '../firebase/firebase.service';
// import { UsersService } from '../users/users.service';
// import mongoose from 'mongoose';

// @Injectable()
// export class NotificationsService {
//   constructor(
//     @InjectModel(Notification.name)
//     private notificationModel: Model<NotificationDocument>,
//     private notificationsGateway: NotificationsGateway,
//     private firebaseService: FirebaseService,
//     private usersService: UsersService,
//   ) {}

//   async createNotification(
//     notification: Partial<NotificationInterface>,
//   ): Promise<NotificationInterface> {
//     const notificationId = new mongoose.Types.ObjectId().toString();
//     const newNotification = new this.notificationModel({
//       ...notification,
//       _id: notificationId,
//     });
//     const saved: NotificationDocument = await newNotification.save();
//     const result = {
//       id: saved.id.toString(),
//       title: saved.title,
//       message: saved.message,
//       userId: saved.userId,
//       timestamp: saved.timestamp,
//     };
//     console.log('Notification created:', result);

//     this.notificationsGateway.emitNotification(result);

//     const fcmToken = await this.usersService.getFcmToken(result.userId);
//     if (fcmToken) {
//       try {
//         await this.firebaseService.sendPushNotification(
//           fcmToken,
//           result.title,
//           result.message,
//         );
//         console.log(`Push notification sent to user ${result.userId}`);
//       } catch (error) {
//         console.error(
//           `Failed to send push notification for user ${result.userId}:`,
//           error,
//         );
//         if (error.code === 'messaging/registration-token-not-registered') {
//           await this.usersService.updateFcmToken(result.userId, null);
//           console.log(`Cleared invalid FCM token for user ${result.userId}`);
//         }
//       }
//     } else {
//       console.warn(`No FCM token found for user ${result.userId}. Ensure the frontend has sent the token.`);
//     }

//     return result;
//   }

//   async findAllByUserId(userId: string): Promise<NotificationInterface[]> {
//     const notifications = await this.notificationModel
//       .find({ userId })
//       .sort({ timestamp: -1 })
//       .exec();
//     return notifications.map((notification) => ({
//       id: notification.id.toString(),
//       title: notification.title,
//       message: notification.message,
//       userId: notification.userId,
//       timestamp: notification.timestamp,
//     }));
//   }

//   async deleteNotification(id: string): Promise<void> {
//     await this.notificationModel.findByIdAndDelete(id).exec();
//     console.log('Notification deleted, emitting notificationDeleted:', id);
//     this.notificationsGateway.emitNotificationDeleted(id);
//   }
// }

// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import {
//   Notification,
//   NotificationDocument,
// } from './schemas/notification.schema';
// import { NotificationsGateway } from './notifications.gateway';
// import { Notification as NotificationInterface } from './interfaces/notification.interface';
// import { FirebaseService } from '../firebase/firebase.service';
// import { UsersService } from '../users/users.service';
// import mongoose from 'mongoose';

// @Injectable()
// export class NotificationsService {
//   constructor(
//     @InjectModel(Notification.name)
//     private notificationModel: Model<NotificationDocument>,
//     private notificationsGateway: NotificationsGateway,
//     private firebaseService: FirebaseService,
//     private usersService: UsersService,
//   ) {}

//   private isValidFcmToken(token: string): boolean {
//     return typeof token === 'string' && token.length > 100;
//   }

//   async createNotification(
//     notification: Partial<NotificationInterface>,
//   ): Promise<NotificationInterface> {
//     const notificationId = new mongoose.Types.ObjectId().toString();
//     const newNotification = new this.notificationModel({
//       ...notification,
//       _id: notificationId,
//     });
//     const saved: NotificationDocument = await newNotification.save();
//     const result = {
//       id: saved.id.toString(),
//       title: saved.title,
//       message: saved.message,
//       userId: saved.userId,
//       timestamp: saved.timestamp,
//     };
//     console.log('Notification created:', result);

//     // Emit WebSocket notification
//     this.notificationsGateway.emitNotification(result);

//     // Send push notification with retries
//     const fcmToken = await this.usersService.getFcmToken(result.userId);
//     if (fcmToken && this.isValidFcmToken(fcmToken)) {
//       const maxRetries = 3;
//       for (let attempt = 1; attempt <= maxRetries; attempt++) {
//         try {
//           await this.firebaseService.sendPushNotification(
//             fcmToken,
//             result.title,
//             result.message,
//           );
//           console.log(`Push notification sent to user ${result.userId} on attempt ${attempt}`);
//           break; // Exit loop on success
//         } catch (error) {
//           console.error(
//             `Failed to send push notification for user ${result.userId} (attempt ${attempt}):`,
//             error,
//           );
//           if (error.code === 'messaging/registration-token-not-registered') {
//             await this.usersService.updateFcmToken(result.userId, null);
//             console.log(`Cleared invalid FCM token for user ${result.userId}`);
//             break;
//           }
//           if (attempt === maxRetries) {
//             console.error(`Max retries reached for push notification to user ${result.userId}`);
//           } else {
//             await new Promise((resolve) => setTimeout(resolve, attempt * 1000)); // Wait before retry
//           }
//         }
//       }
//     } else {
//       console.warn(`No valid FCM token found for user ${result.userId}. Ensure the frontend has sent the token.`);
//     }

//     return result;
//   }

//   async findAllByUserId(userId: string): Promise<NotificationInterface[]> {
//     const notifications = await this.notificationModel
//       .find({ userId })
//       .sort({ timestamp: -1 })
//       .exec();
//     return notifications.map((notification) => ({
//       id: notification.id.toString(),
//       title: notification.title,
//       message: notification.message,
//       userId: notification.userId,
//       timestamp: notification.timestamp,
//     }));
//   }

//   async deleteNotification(id: string): Promise<void> {
//     await this.notificationModel.findByIdAndDelete(id).exec();
//     console.log('Notification deleted, emitting notificationDeleted:', id);
//     this.notificationsGateway.emitNotificationDeleted(id);
//   }
// }

//notification.service.ts

// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import {
//   Notification,
//   NotificationDocument,
// } from './schemas/notification.schema';
// import { NotificationsGateway } from './notifications.gateway';
// import { Notification as NotificationInterface } from './interfaces/notification.interface';
// import { FirebaseService } from '../firebase/firebase.service';
// import { UsersService } from '../users/users.service';
// import mongoose from 'mongoose';

// @Injectable()
// export class NotificationsService {
//   constructor(
//     @InjectModel(Notification.name)
//     private notificationModel: Model<NotificationDocument>,
//     private notificationsGateway: NotificationsGateway,
//     private firebaseService: FirebaseService,
//     private usersService: UsersService,
//   ) {}

//   private isValidFcmToken(token: string): boolean {
//     return typeof token === 'string' && token.length > 100;
//   }

//   async createNotification(
//     notification: Partial<NotificationInterface>,
//   ): Promise<NotificationInterface> {
//     const notificationId = new mongoose.Types.ObjectId().toString();
//     const newNotification = new this.notificationModel({
//       ...notification,
//       _id: notificationId,
//       timestamp: notification.timestamp || new Date(),
//     });

//     const saved: NotificationDocument = await newNotification.save();
//     const result: NotificationInterface = {
//       id: saved.id.toString(),
//       title: saved.title,
//       message: saved.message,
//       userId: saved.userId,
//       timestamp: saved.timestamp,
//     };

//     console.log('Notification created:', result);

//     // Emit WebSocket notification IMMEDIATELY after saving
//     try {
//       this.notificationsGateway.emitNotification(result);
//       console.log(`WebSocket notification emitted for user: ${result.userId}`);
//     } catch (error) {
//       console.error('Error emitting WebSocket notification:', error);
//     }

//     // Send push notification with retries (async, don't block)
//     this.sendPushNotificationAsync(result);

//     return result;
//   }

//   private async sendPushNotificationAsync(notification: NotificationInterface) {
//     try {
//       const fcmToken = await this.usersService.getFcmToken(notification.userId);
//       if (fcmToken && this.isValidFcmToken(fcmToken)) {
//         const maxRetries = 3;
//         for (let attempt = 1; attempt <= maxRetries; attempt++) {
//           try {
//             await this.firebaseService.sendPushNotification(
//               fcmToken,
//               notification.title,
//               notification.message,
//             );
//             console.log(
//               `Push notification sent to user ${notification.userId} on attempt ${attempt}`,
//             );
//             break;
//           } catch (error) {
//             console.error(
//               `Failed to send push notification for user ${notification.userId} (attempt ${attempt}):`,
//               error,
//             );
//             if (error.code === 'messaging/registration-token-not-registered') {
//               await this.usersService.updateFcmToken(notification.userId, null);
//               console.log(
//                 `Cleared invalid FCM token for user ${notification.userId}`,
//               );
//               break;
//             }
//             if (attempt === maxRetries) {
//               console.error(
//                 `Max retries reached for push notification to user ${notification.userId}`,
//               );
//             } else {
//               await new Promise((resolve) =>
//                 setTimeout(resolve, attempt * 1000),
//               );
//             }
//           }
//         }
//       } else {
//         console.warn(
//           `No valid FCM token found for user ${notification.userId}`,
//         );
//       }
//     } catch (error) {
//       console.error('Error in sendPushNotificationAsync:', error);
//     }
//   }

//   async findAllByUserId(userId: string): Promise<NotificationInterface[]> {
//     const notifications = await this.notificationModel
//       .find({ userId })
//       .sort({ timestamp: -1 })
//       .exec();

//     return notifications.map((notification) => ({
//       id: notification.id.toString(),
//       title: notification.title,
//       message: notification.message,
//       userId: notification.userId,
//       timestamp: notification.timestamp,
//     }));
//   }

//   async deleteNotification(id: string): Promise<void> {
//     // Find the notification first to get userId
//     const notification = await this.notificationModel.findById(id).exec();
//     if (!notification) {
//       throw new Error('Notification not found');
//     }

//     const userId = notification.userId;

//     // Delete from database
//     await this.notificationModel.findByIdAndDelete(id).exec();
//     console.log(`Notification deleted: ${id} for user: ${userId}`);

//     // Emit WebSocket event with userId
//     try {
//       this.notificationsGateway.emitNotificationDeleted(id, userId);
//       console.log(
//         `WebSocket notificationDeleted emitted: ${id} for user: ${userId}`,
//       );
//     } catch (error) {
//       console.error('Error emitting WebSocket notificationDeleted:', error);
//     }
//   }
// }
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import { NotificationsGateway } from './notifications.gateway';
import { Notification as NotificationInterface } from './interfaces/notification.interface';
import mongoose from 'mongoose';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(
    notification: Partial<NotificationInterface>,
  ): Promise<NotificationInterface> {
    this.logger.log(`Creating notification: ${JSON.stringify(notification)}`);
    const notificationId = new mongoose.Types.ObjectId().toString();
    const newNotification = new this.notificationModel({
      ...notification,
      _id: notificationId,
      timestamp: notification.timestamp || new Date().toISOString(),
    });

    try {
      const saved: NotificationDocument = await newNotification.save();
      const result: NotificationInterface = {
        id: saved.id.toString(),
        title: saved.title,
        message: saved.message,
        userId: saved.userId,
        timestamp: saved.timestamp,
      };
      this.logger.log(`Notification saved: ${JSON.stringify(result)}`);

      // Emit WebSocket notification
      try {
        this.notificationsGateway.emitNotification(result);
        this.logger.log(
          `WebSocket notification emitted for user: ${result.userId}`,
        );
      } catch (error) {
        this.logger.error(
          `Error emitting WebSocket notification: ${error.message}`,
        );
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to save notification: ${error.message}`);
      throw error;
    }
  }

  async findAllByUserId(userId: string): Promise<NotificationInterface[]> {
    this.logger.log(`Fetching notifications for userId: ${userId}`);
    const notifications = await this.notificationModel
      .find({ userId })
      .sort({ timestamp: -1 })
      .exec();
    this.logger.log(
      `Found ${notifications.length} notifications for userId: ${userId}`,
    );
    return notifications.map((notification) => ({
      id: notification.id.toString(),
      title: notification.title,
      message: notification.message,
      userId: notification.userId,
      timestamp: notification.timestamp,
    }));
  }

  async deleteNotification(id: string): Promise<void> {
    this.logger.log(`Deleting notification with id: ${id}`);
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      this.logger.error(`Notification not found: ${id}`);
      throw new Error('Notification not found');
    }

    const userId = notification.userId;

    await this.notificationModel.findByIdAndDelete(id).exec();
    this.logger.log(`Notification deleted: ${id} for user: ${userId}`);

    try {
      this.notificationsGateway.emitNotificationDeleted(id, userId);
      this.logger.log(
        `WebSocket notificationDeleted emitted: ${id} for user: ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error emitting WebSocket notificationDeleted: ${error.message}`,
      );
    }
  }
}
