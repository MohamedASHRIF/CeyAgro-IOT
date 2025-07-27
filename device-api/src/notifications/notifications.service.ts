// import { Injectable, Logger } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import {
//   Notification,
//   NotificationDocument,
// } from './schemas/notification.schema';
// import { NotificationsGateway } from './notifications.gateway';
// import { Notification as NotificationInterface } from './interfaces/notification.interface';
// import { User, UserDocument } from '../users/schemas/user.schema';
// import axios from 'axios';
// import mongoose from 'mongoose';

// @Injectable()
// export class NotificationsService {
//   private readonly logger = new Logger(NotificationsService.name);

//   constructor(
//     @InjectModel(Notification.name)
//     private notificationModel: Model<NotificationDocument>,
//     @InjectModel(User.name, 'users_db')
//     private userModel: Model<UserDocument>,
//     private notificationsGateway: NotificationsGateway,
//   ) {
//     this.logger.log('NotificationsService initialized');
//   }

//   async createNotification(
//     notification: Partial<NotificationInterface>,
//   ): Promise<NotificationInterface> {
//     this.logger.debug(
//       `Starting createNotification for userId: ${notification.userId}`,
//     );

//     const notificationId = new mongoose.Types.ObjectId().toString();
//     const newNotification = new this.notificationModel({
//       ...notification,
//       _id: notificationId,
//       timestamp: notification.timestamp || new Date().toISOString(),
//       read: false,
//     });

//     this.logger.debug(
//       `Saving notification: ${JSON.stringify(newNotification)}`,
//     );
//     const saved: NotificationDocument = await newNotification.save();
//     const result: NotificationInterface = {
//       id: saved.id.toString(),
//       title: saved.title,
//       message: saved.message,
//       userId: saved.userId,
//       timestamp: saved.timestamp,
//       read: saved.read,
//     };

//     this.logger.log(
//       `Notification created successfully: ${JSON.stringify(result)}`,
//     );

//     // Emit WebSocket notification
//     try {
//       this.logger.debug(
//         `Emitting WebSocket notification for user: ${result.userId}`,
//       );
//       this.notificationsGateway.emitNotification(result);
//       this.logger.log(
//         `WebSocket notification emitted for user: ${result.userId}`,
//       );
//     } catch (error) {
//       this.logger.error(
//         `Error emitting WebSocket notification for user ${result.userId}: ${error.message}`,
//         error.stack,
//       );
//     }

//     // Send SMS notification
//     try {
//       this.logger.debug(
//         `Attempting to send SMS for notification: ${JSON.stringify(result)}`,
//       );
//       await this.sendSMSNotification(result);
//       this.logger.log(
//         `SMS notification sent successfully for user: ${result.userId}`,
//       );
//     } catch (error) {
//       this.logger.error(
//         `Error sending SMS notification for user ${result.userId}: ${error.message}`,
//         error.stack,
//       );
//     }

//     return result;
//   }

//   async sendSMSNotification(
//     notification: NotificationInterface,
//   ): Promise<void> {
//     this.logger.debug(
//       `Starting sendSMSNotification for userId: ${notification.userId}`,
//     );

//     // Step 1: Fetch user from users_db
//     this.logger.debug(`Looking up user with email: ${notification.userId}`);
//     const user = await this.userModel
//       .findOne({ email: notification.userId })
//       .exec();
//     if (!user) {
//       this.logger.warn(`No user found for email: ${notification.userId}`);
//       throw new Error(`No user found for email: ${notification.userId}`);
//     }
//     this.logger.debug(
//       `User found: ${JSON.stringify({ email: user.email, telephone: user.telephone })}`,
//     );

//     // Step 2: Check for telephone field
//     if (!user.telephone) {
//       this.logger.warn(
//         `No phone number found for user: ${notification.userId}`,
//       );
//       throw new Error(`No phone number found for user: ${notification.userId}`);
//     }
//     this.logger.debug(`User phone number: ${user.telephone}`);

//     // Step 3: Format phone number
//     const phoneNumber = this.formatPhoneNumber(user.telephone);
//     if (!phoneNumber) {
//       this.logger.warn(
//         `Invalid phone number format for user: ${notification.userId}, phone: ${user.telephone}`,
//       );
//       throw new Error(`Invalid phone number format: ${user.telephone}`);
//     }
//     this.logger.debug(`Formatted phone number: ${phoneNumber}`);

//     // Step 4: Prepare SMS data
//     const smsData = {
//       user_id: process.env.NOTIFY_LK_USER_ID,
//       api_key: process.env.NOTIFY_LK_API_KEY,
//       sender_id: process.env.NOTIFY_LK_SENDER_ID,
//       to: phoneNumber,
//       message: `${notification.title}: ${notification.message}`.substring(
//         0,
//         160,
//       ), // Limit to 160 characters
//     };
//     this.logger.debug(
//       `SMS request data: ${JSON.stringify({
//         user_id: smsData.user_id,
//         sender_id: smsData.sender_id,
//         to: smsData.to,
//         message: smsData.message,
//         api_key: '[REDACTED]',
//       })}`,
//     );

//     // Step 5: Send SMS via Notify.lk API
//     try {
//       this.logger.debug(
//         `Sending SMS request to Notify.lk API for ${phoneNumber}`,
//       );
//       const response = await axios.post(
//         'https://app.notify.lk/api/v1/send',
//         smsData,
//       );
//       this.logger.log(
//         `SMS sent successfully to ${phoneNumber}: ${JSON.stringify(response.data)}`,
//       );
//     } catch (error) {
//       const errorMessage = error.response
//         ? `Notify.lk API error: ${JSON.stringify(error.response.data)}`
//         : `Failed to send SMS to ${phoneNumber}: ${error.message}`;
//       this.logger.error(errorMessage, error.stack);
//       throw new Error(errorMessage);
//     }
//   }

//   private formatPhoneNumber(phone: string): string | null {
//     this.logger.debug(`Formatting phone number: ${phone}`);
//     // Remove any non-digit characters except the leading +
//     const cleaned = phone.replace(/[^0-9+]/g, '');
//     // Validate Sri Lankan mobile number: +94 or 0 followed by 7 and 8 digits, or 9 digits
//     const sriLankaMobileRegex =
//       /^(?:\+94[7][0-9]{8}|0[7][0-9]{8}|[7][0-9]{8})$/;

//     if (!sriLankaMobileRegex.test(cleaned)) {
//       this.logger.warn(`Invalid phone number format: ${phone}`);
//       return null;
//     }

//     // Convert to 11-digit format without + (e.g., 94705728867)
//     let formatted = cleaned;
//     if (cleaned.startsWith('+94')) {
//       formatted = cleaned.slice(1); // Remove +
//       this.logger.debug(`Converted +94 number to 11 digits: ${formatted}`);
//     } else if (cleaned.startsWith('0')) {
//       formatted = `94${cleaned.slice(1)}`;
//       this.logger.debug(
//         `Converted 0-prefixed number to 11 digits: ${formatted}`,
//       );
//     } else if (cleaned.length === 9) {
//       formatted = `94${cleaned}`;
//       this.logger.debug(`Converted 9-digit number to 11 digits: ${formatted}`);
//     }

//     // Final validation: ensure exactly 11 digits
//     if (formatted.length === 11 && /^[7][0-9]{8}$/.test(formatted.slice(2))) {
//       this.logger.debug(`Phone number is valid (11 digits): ${formatted}`);
//       return formatted;
//     }

//     this.logger.warn(`Invalid phone number after formatting: ${formatted}`);
//     return null;
//   }

//   async markNotificationAsRead(id: string): Promise<NotificationInterface> {
//     this.logger.debug(`Marking notification as read: ${id}`);
//     const notification = await this.notificationModel
//       .findByIdAndUpdate(id, { read: true }, { new: true })
//       .exec();
//     if (!notification) {
//       this.logger.error(`Notification not found: ${id}`);
//       throw new Error('Notification not found');
//     }

//     const result: NotificationInterface = {
//       id: notification.id.toString(),
//       title: notification.title,
//       message: notification.message,
//       userId: notification.userId,
//       timestamp: notification.timestamp,
//       read: notification.read,
//     };

//     this.logger.log(`Notification marked as read: ${id}`);

//     try {
//       this.logger.debug(
//         `Emitting WebSocket notificationRead for user: ${result.userId}`,
//       );
//       this.notificationsGateway.emitNotificationRead(result);
//       this.logger.log(
//         `WebSocket notificationRead emitted: ${id} for user: ${result.userId}`,
//       );
//     } catch (error) {
//       this.logger.error(
//         `Error emitting WebSocket notificationRead for ${id}: ${error.message}`,
//         error.stack,
//       );
//     }

//     return result;
//   }

//   async findAllByUserId(userId: string): Promise<NotificationInterface[]> {
//     this.logger.debug(`Fetching notifications for userId: ${userId}`);
//     const notifications = await this.notificationModel
//       .find({ userId })
//       .sort({ timestamp: -1 })
//       .exec();

//     this.logger.log(
//       `Found ${notifications.length} notifications for user: ${userId}`,
//     );
//     return notifications.map((notification) => ({
//       id: notification.id.toString(),
//       title: notification.title,
//       message: notification.message,
//       userId: notification.userId,
//       timestamp: notification.timestamp,
//       read: notification.read,
//     }));
//   }

//   async deleteNotification(id: string): Promise<void> {
//     this.logger.debug(`Deleting notification: ${id}`);
//     const notification = await this.notificationModel.findById(id).exec();
//     if (!notification) {
//       this.logger.error(`Notification not found: ${id}`);
//       throw new Error('Notification not found');
//     }

//     const userId = notification.userId;

//     await this.notificationModel.findByIdAndDelete(id).exec();
//     this.logger.log(`Notification deleted: ${id} for user: ${userId}`);

//     try {
//       this.logger.debug(
//         `Emitting WebSocket notificationDeleted for user: ${userId}`,
//       );
//       this.notificationsGateway.emitNotificationDeleted(id, userId);
//       this.logger.log(
//         `WebSocket notificationDeleted emitted: ${id} for user: ${userId}`,
//       );
//     } catch (error) {
//       this.logger.error(
//         `Error emitting WebSocket notificationDeleted for ${id}: ${error.message}`,
//         error.stack,
//       );
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
import { User, UserDocument } from '../users/schemas/user.schema';
import axios from 'axios';
import mongoose from 'mongoose';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name, 'users_db')
    private userModel: Model<UserDocument>,
    private notificationsGateway: NotificationsGateway,
  ) {
    this.logger.log('NotificationsService initialized');
  }
  async createNotification(
    notification: Partial<NotificationInterface>,
  ): Promise<NotificationInterface> {
    this.logger.debug(
      `Starting createNotification for userId: ${notification.userId}`,
    );

    if (!notification.userId) {
      this.logger.error('Cannot create notification: userId is missing');
      throw new Error('userId is required');
    }

    const notificationId = new mongoose.Types.ObjectId().toString();
    const newNotification = new this.notificationModel({
      ...notification,
      _id: notificationId,
      timestamp: notification.timestamp || new Date().toISOString(),
      read: false,
    });

    this.logger.debug(
      `Saving notification: ${JSON.stringify(newNotification)}`,
    );
    const saved: NotificationDocument = await newNotification.save();
    const result: NotificationInterface = {
      id: saved.id.toString(),
      title: saved.title,
      message: saved.message,
      userId: saved.userId,
      timestamp: saved.timestamp,
      read: saved.read,
    };

    this.logger.log(
      `Notification created successfully: ${JSON.stringify(result)}`,
    );

    // Emit WebSocket notification
    try {
      if (this.notificationsGateway.isUserConnected(result.userId)) {
        this.logger.debug(
          `Emitting WebSocket notification for user: ${result.userId}`,
        );
        this.notificationsGateway.emitNotification(result);
        this.logger.log(
          `WebSocket notification emitted for user: ${result.userId}`,
        );
      } else {
        this.logger.warn(
          `User ${result.userId} is not connected; skipping WebSocket emission`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error emitting WebSocket notification for user ${result.userId}: ${error.message}`,
        error.stack,
      );
    }

    // Send SMS notification
    try {
      this.logger.debug(
        `Attempting to send SMS for notification: ${JSON.stringify(result)}`,
      );
      await this.sendSMSNotification(result);
      this.logger.log(
        `SMS notification sent successfully for user: ${result.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending SMS notification for user ${result.userId}: ${error.message}`,
        error.stack,
      );
    }

    return result;
  }
  async sendSMSNotification(
    notification: NotificationInterface,
  ): Promise<void> {
    this.logger.debug(
      `Starting sendSMSNotification for userId: ${notification.userId}`,
    );

    // Step 1: Fetch user from users_db
    this.logger.debug(`Looking up user with email: ${notification.userId}`);
    const user = await this.userModel
      .findOne({ email: notification.userId })
      .exec();
    if (!user) {
      this.logger.warn(`No user found for email: ${notification.userId}`);
      throw new Error(`No user found for email: ${notification.userId}`);
    }
    this.logger.debug(
      `User found: ${JSON.stringify({ email: user.email, telephone: user.telephone })}`,
    );

    // Step 2: Check for telephone field
    if (!user.telephone) {
      this.logger.warn(
        `No phone number found for user: ${notification.userId}`,
      );
      throw new Error(`No phone number found for user: ${notification.userId}`);
    }
    this.logger.debug(`User phone number: ${user.telephone}`);

    // Step 3: Format phone number
    const phoneNumber = this.formatPhoneNumber(user.telephone);
    if (!phoneNumber) {
      this.logger.warn(
        `Invalid phone number format for user: ${notification.userId}, phone: ${user.telephone}`,
      );
      throw new Error(`Invalid phone number format: ${user.telephone}`);
    }
    this.logger.debug(`Formatted phone number: ${phoneNumber}`);

    // Step 4: Prepare SMS data
    const smsData = {
      user_id: process.env.NOTIFY_LK_USER_ID,
      api_key: process.env.NOTIFY_LK_API_KEY,
      sender_id: process.env.NOTIFY_LK_SENDER_ID,
      to: phoneNumber,
      message: `${notification.title}: ${notification.message}`.substring(
        0,
        160,
      ), // Limit to 160 characters
    };
    this.logger.debug(
      `SMS request data: ${JSON.stringify({
        user_id: smsData.user_id,
        sender_id: smsData.sender_id,
        to: smsData.to,
        message: smsData.message,
        api_key: '[REDACTED]',
      })}`,
    );

    // Step 5: Send SMS via Notify.lk API
    try {
      this.logger.debug(
        `Sending SMS request to Notify.lk API for ${phoneNumber}`,
      );
      const response = await axios.post(
        'https://app.notify.lk/api/v1/send',
        smsData,
      );
      this.logger.log(
        `SMS sent successfully to ${phoneNumber}: ${JSON.stringify(response.data)}`,
      );
    } catch (error) {
      const errorMessage = error.response
        ? `Notify.lk API error: ${JSON.stringify(error.response.data)}`
        : `Failed to send SMS to ${phoneNumber}: ${error.message}`;
      this.logger.error(errorMessage, error.stack);
      throw new Error(errorMessage);
    }
  }

  private formatPhoneNumber(phone: string): string | null {
    this.logger.debug(`Formatting phone number: ${phone}`);
    // Remove any non-digit characters except the leading +
    const cleaned = phone.replace(/[^0-9+]/g, '');
    // Validate Sri Lankan mobile number: +94 or 0 followed by 7 and 8 digits, or 9 digits
    const sriLankaMobileRegex =
      /^(?:\+94[7][0-9]{8}|0[7][0-9]{8}|[7][0-9]{8})$/;

    if (!sriLankaMobileRegex.test(cleaned)) {
      this.logger.warn(`Invalid phone number format: ${phone}`);
      return null;
    }

    // Convert to 11-digit format without + (e.g., 94705728867)
    let formatted = cleaned;
    if (cleaned.startsWith('+94')) {
      formatted = cleaned.slice(1); // Remove +
      this.logger.debug(`Converted +94 number to 11 digits: ${formatted}`);
    } else if (cleaned.startsWith('0')) {
      formatted = `94${cleaned.slice(1)}`;
      this.logger.debug(
        `Converted 0-prefixed number to 11 digits: ${formatted}`,
      );
    } else if (cleaned.length === 9) {
      formatted = `94${cleaned}`;
      this.logger.debug(`Converted 9-digit number to 11 digits: ${formatted}`);
    }

    // Final validation: ensure exactly 11 digits
    if (formatted.length === 11 && /^[7][0-9]{8}$/.test(formatted.slice(2))) {
      this.logger.debug(`Phone number is valid (11 digits): ${formatted}`);
      return formatted;
    }

    this.logger.warn(`Invalid phone number after formatting: ${formatted}`);
    return null;
  }

  async markNotificationAsRead(id: string): Promise<NotificationInterface> {
    this.logger.debug(`Marking notification as read: ${id}`);
    const notification = await this.notificationModel
      .findByIdAndUpdate(id, { read: true }, { new: true })
      .exec();
    if (!notification) {
      this.logger.error(`Notification not found: ${id}`);
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

    this.logger.log(`Notification marked as read: ${id}`);

    try {
      this.logger.debug(
        `Emitting WebSocket notificationRead for user: ${result.userId}`,
      );
      this.notificationsGateway.emitNotificationRead(result);
      this.logger.log(
        `WebSocket notificationRead emitted: ${id} for user: ${result.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error emitting WebSocket notificationRead for ${id}: ${error.message}`,
        error.stack,
      );
    }

    return result;
  }

  async findAllByUserId(userId: string): Promise<NotificationInterface[]> {
    this.logger.debug(`Fetching notifications for userId: ${userId}`);
    const notifications = await this.notificationModel
      .find({ userId })
      .sort({ timestamp: -1 })
      .exec();

    this.logger.log(
      `Found ${notifications.length} notifications for user: ${userId}`,
    );
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
    this.logger.debug(`Deleting notification: ${id}`);
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      this.logger.error(`Notification not found: ${id}`);
      throw new Error('Notification not found');
    }

    const userId = notification.userId;

    await this.notificationModel.findByIdAndDelete(id).exec();
    this.logger.log(`Notification deleted: ${id} for user: ${userId}`);

    try {
      this.logger.debug(
        `Emitting WebSocket notificationDeleted for user: ${userId}`,
      );
      this.notificationsGateway.emitNotificationDeleted(id, userId);
      this.logger.log(
        `WebSocket notificationDeleted emitted: ${id} for user: ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error emitting WebSocket notificationDeleted for ${id}: ${error.message}`,
        error.stack,
      );
    }
  }
}
