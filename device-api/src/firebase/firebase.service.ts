// import { Injectable } from '@nestjs/common';
// import * as admin from 'firebase-admin';

// @Injectable()
// export class FirebaseService {
//   constructor() {
//     admin.initializeApp({
//       credential: admin.credential.cert('./firebase-adminsdk.json'),
//     });
//   }

//   //send push notifications
//   async sendPushNotification(
//     fcmToken: string,
//     title: string,
//     body: string,
//     p0: { notificationId: any },
//     data?: { [key: string]: string },
//   ) {
//     const message = {
//       notification: {
//         title,
//         body,
//       },
//       data: data || {},
//       token: fcmToken,
//     };

//     try {
//       const response = await admin.messaging().send(message);
//       console.log('Push notification sent:', response);
//       return response;
//     } catch (error) {
//       console.error('Error sending push notification:', error);
//       throw error;
//     }
//   }
// }

// firebase.service.ts
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert('./firebase-adminsdk.json'),
    });
  }

  async sendPushNotification(
    fcmToken: string,
    title: string,
    body: string,
    data?: { [key: string]: string },
  ) {
    const message = {
      notification: {
        title,
        body,
      },
      token: fcmToken,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log(`Push notification sent: ${response}`);
      return response;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }
}
