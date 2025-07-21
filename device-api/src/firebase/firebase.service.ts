import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private isInitialized = false;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const serviceAccountPath = './firebase-adminsdk.json';
      
      // Check if service account file exists
      if (fs.existsSync(serviceAccountPath)) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
        });
        this.isInitialized = true;
        this.logger.log('Firebase initialized successfully');
      } else {
        this.logger.warn('Firebase service account file not found. Firebase notifications will be disabled.');
        this.isInitialized = false;
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase:', error.message);
      this.isInitialized = false;
    }
  }

  //send push notifications
  async sendPushNotification(fcmToken: string, title: string, body: string) {
    if (!this.isInitialized) {
      this.logger.warn('Firebase not initialized. Skipping push notification.');
      return null;
    }

    const message = {
      notification: {
        title,
        body,
      },
      token: fcmToken,
    };

    try {
      const response = await admin.messaging().send(message);
      this.logger.log('Push notification sent:', response);
      return response;
    } catch (error) {
      this.logger.error('Error sending push notification:', error);
      throw error;
    }
  }
}
