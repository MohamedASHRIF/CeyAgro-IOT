// import { Injectable, Logger } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import {
//   Notification,
//   NotificationDocument,
// } from './schemas/notification.schema';
// import { NotificationsGateway } from './notifications.gateway';
// import { Notification as NotificationInterface } from './interfaces/notification.interface';
// import mongoose from 'mongoose';

// @Injectable()
// export class NotificationsService {
//   private readonly logger = new Logger(NotificationsService.name);

//   constructor(
//     @InjectModel(Notification.name)
//     private notificationModel: Model<NotificationDocument>,
//     private notificationsGateway: NotificationsGateway,
//   ) {}

//   async createNotification(
//     notification: Partial<NotificationInterface>,
//   ): Promise<NotificationInterface> {
//     this.logger.log(`Creating notification: ${JSON.stringify(notification)}`);
//     const notificationId = new mongoose.Types.ObjectId().toString();
//     const newNotification = new this.notificationModel({
//       ...notification,
//       _id: notificationId,
//       timestamp: notification.timestamp || new Date().toISOString(),
//     });

//     try {
//       const saved: NotificationDocument = await newNotification.save();
//       const result: NotificationInterface = {
//         id: saved.id.toString(),
//         title: saved.title,
//         message: saved.message,
//         userId: saved.userId,
//         timestamp: saved.timestamp,
//       };
//       this.logger.log(`Notification saved: ${JSON.stringify(result)}`);

//       // Emit WebSocket notification
//       try {
//         this.notificationsGateway.emitNotification(result);
//         this.logger.log(
//           `WebSocket notification emitted for user: ${result.userId}`,
//         );
//       } catch (error) {
//         this.logger.error(
//           `Error emitting WebSocket notification: ${error.message}`,
//         );
//       }

//       return result;
//     } catch (error) {
//       this.logger.error(`Failed to save notification: ${error.message}`);
//       throw error;
//     }
//   }

//   async findAllByUserId(userId: string): Promise<NotificationInterface[]> {
//     this.logger.log(`Fetching notifications for userId: ${userId}`);
//     const notifications = await this.notificationModel
//       .find({ userId })
//       .sort({ timestamp: -1 })
//       .exec();
//     this.logger.log(
//       `Found ${notifications.length} notifications for userId: ${userId}`,
//     );
//     return notifications.map((notification) => ({
//       id: notification.id.toString(),
//       title: notification.title,
//       message: notification.message,
//       userId: notification.userId,
//       timestamp: notification.timestamp,
//     }));
//   }

//   async deleteNotification(id: string): Promise<void> {
//     this.logger.log(`Deleting notification with id: ${id}`);
//     const notification = await this.notificationModel.findById(id).exec();
//     if (!notification) {
//       this.logger.error(`Notification not found: ${id}`);
//       throw new Error('Notification not found');
//     }

//     const userId = notification.userId;

//     await this.notificationModel.findByIdAndDelete(id).exec();
//     this.logger.log(`Notification deleted: ${id} for user: ${userId}`);

//     try {
//       this.notificationsGateway.emitNotificationDeleted(id, userId);
//       this.logger.log(
//         `WebSocket notificationDeleted emitted: ${id} for user: ${userId}`,
//       );
//     } catch (error) {
//       this.logger.error(
//         `Error emitting WebSocket notificationDeleted: ${error.message}`,
//       );
//     }
//   }
// }

import { Injectable } from '@nestjs/common';
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
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(
    notification: Partial<NotificationInterface>,
  ): Promise<NotificationInterface> {
    const notificationId = new mongoose.Types.ObjectId().toString();
    const newNotification = new this.notificationModel({
      ...notification,
      _id: notificationId,
      timestamp: notification.timestamp || new Date().toISOString(),
      read: false, // Initialize as unread
    });

    const saved: NotificationDocument = await newNotification.save();
    const result: NotificationInterface = {
      id: saved.id.toString(),
      title: saved.title,
      message: saved.message,
      userId: saved.userId,
      timestamp: saved.timestamp,
      read: saved.read,
    };

    console.log('Notification created:', result);

    // Emit WebSocket notification
    try {
      this.notificationsGateway.emitNotification(result);
      console.log(`WebSocket notification emitted for user: ${result.userId}`);
    } catch (error) {
      console.error('Error emitting WebSocket notification:', error);
    }

    return result;
  }

  async markNotificationAsRead(id: string): Promise<NotificationInterface> {
    const notification = await this.notificationModel
      .findByIdAndUpdate(id, { read: true }, { new: true })
      .exec();
    if (!notification) {
      throw new Error('Notification not found');
    }

    const result: NotificationInterface = {
      id: notification.id.toString(),
      title: notification.title,
      message: notification.message,
      userId: notification.userId,
      timestamp: notification.timestamp,
      read: notification.read,
    };

    // Emit WebSocket event for read status
    try {
      this.notificationsGateway.emitNotificationRead(result);
      console.log(
        `WebSocket notificationRead emitted: ${id} for user: ${result.userId}`,
      );
    } catch (error) {
      console.error('Error emitting WebSocket notificationRead:', error);
    }

    return result;
  }

  async findAllByUserId(userId: string): Promise<NotificationInterface[]> {
    const notifications = await this.notificationModel
      .find({ userId })
      .sort({ timestamp: -1 })
      .exec();

    return notifications.map((notification) => ({
      id: notification.id.toString(),
      title: notification.title,
      message: notification.message,
      userId: notification.userId,
      timestamp: notification.timestamp,
      read: notification.read,
    }));
  }

  async deleteNotification(id: string): Promise<void> {
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      throw new Error('Notification not found');
    }

    const userId = notification.userId;

    await this.notificationModel.findByIdAndDelete(id).exec();
    console.log(`Notification deleted: ${id} for user: ${userId}`);

    try {
      this.notificationsGateway.emitNotificationDeleted(id, userId);
      console.log(
        `WebSocket notificationDeleted emitted: ${id} for user: ${userId}`,
      );
    } catch (error) {
      console.error('Error emitting WebSocket notificationDeleted:', error);
    }
  }
}
