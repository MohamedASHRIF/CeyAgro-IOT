import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import { NotificationsGateway } from './notifications.gateway';
import { Notification as NotificationInterface } from './interfaces/notification.interface';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersService } from '../users/users.service';
import mongoose from 'mongoose';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private notificationsGateway: NotificationsGateway,
    private firebaseService: FirebaseService,
    private usersService: UsersService,
  ) {}

  //create notifications
  async createNotification(
    notification: Partial<NotificationInterface>,
  ): Promise<NotificationInterface> {
    const notificationId = new mongoose.Types.ObjectId().toString();
    const newNotification = new this.notificationModel({
      ...notification,
      _id: notificationId,
    });
    // Save the notification to the database
    const saved: NotificationDocument = await newNotification.save();
    const result = {
      id: saved.id.toString(),
      title: saved.title,
      message: saved.message,
      userId: saved.userId,
      timestamp: saved.timestamp,
    };
    console.log('Notification created:', result);

    // Emit WebSocket notification
    this.notificationsGateway.emitNotification(result);

    // get FCM token and Send push notification using firebase
    const fcmToken = await this.usersService.getFcmToken(result.userId);
    if (fcmToken) {
      try {
        await this.firebaseService.sendPushNotification(
          fcmToken,
          result.title,
          result.message,
        );
      } catch (error) {
        console.error(
          `Failed to send push notification for user ${result.userId}:`,
          error,
        );
        // Optionally, remove invalid token
        if (error.code === 'messaging/registration-token-not-registered') {
          await this.usersService.updateFcmToken(result.userId, null);
          console.log(`Cleared invalid FCM token for user ${result.userId}`);
        }
      }
    } else {
      console.log(`No FCM token found for user ${result.userId}`);
    }

    return result;
  }

  //Finds all notifications for a specific user, sorted by latest first
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
    }));
  }

  // Deletes a notification by its ID and notifies the frontend via WebSocket
  async deleteNotification(id: string): Promise<void> {
    await this.notificationModel.findByIdAndDelete(id).exec();
    console.log('Notification deleted, emitting notificationDeleted:', id);
    this.notificationsGateway.emitNotificationDeleted(id);
  }
}
