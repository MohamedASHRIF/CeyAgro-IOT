import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert('./firebase-adminsdk.json'),
    });
  }

  //send push notifications
  async sendPushNotification(fcmToken: string, title: string, body: string) {
    const message = {
      notification: {
        title,
        body,
      },
      token: fcmToken,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Push notification sent:', response);
      return response;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }
}
