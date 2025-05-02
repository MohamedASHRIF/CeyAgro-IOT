import { Injectable, Logger } from '@nestjs/common';
import { SNS } from 'aws-sdk';

@Injectable()
export class SnsService {
  private readonly sns: SNS;
  private readonly logger = new Logger(SnsService.name);

  constructor() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    //if credentials are not found log an error
    if (!accessKeyId || !secretAccessKey) {
      this.logger.error(
        'AWS credentials are missing. Ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set in .env',
      );
      throw new Error('AWS credentials are missing...');
    }

    //Initializes the SNS client with region and credentials.
    this.sns = new SNS({
      region: 'eu-north-1',
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    this.logger.log('SNS client initialized successfully');
  }

  async subscribeEmail(email: string): Promise<void> {
    try {
      this.logger.log(`Subscribing ${email} to SNS topic`);
      const params = {
        Protocol: 'email',
        TopicArn: 'arn:aws:sns:eu-north-1:911167929681:aws-sns-auth',
        Endpoint: email,
      };
      const response = await this.sns.subscribe(params).promise();
      this.logger.log(
        `SNS subscription requested for ${email}: ${JSON.stringify(response)}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to subscribe ${email} to SNS: ${error.message}`,
      );
      throw error;
    }
  }

  async sendSubscriptionEmail(email: string, name: string): Promise<void> {
    try {
      this.logger.log(`Sending subscription email to ${email}`);
      const params = {
        TopicArn: 'arn:aws:sns:eu-north-1:911167929681:aws-sns-auth',
        Message: JSON.stringify({
          default: `Welcome ${name}!`,
          email: {
            subject: 'Confirm Your Subscription',
            body: `Hello ${name},\n\nThank you for signing up! Please confirm your subscription to receive login notifications.`,
          },
        }),
        MessageStructure: 'json',
        MessageAttributes: {
          email: {
            DataType: 'String',
            StringValue: email,
          },
        },
      };
      const response = await this.sns.publish(params).promise();
      this.logger.log(
        `Subscription email sent to ${email}: ${JSON.stringify(response)}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send subscription email to ${email}: ${error.message}`,
      );
      throw error;
    }
  }

  async sendLoginSuccessEmail(email: string, name: string): Promise<void> {
    try {
      this.logger.log(`Sending login success email to ${email}`);
      const params = {
        TopicArn: 'arn:aws:sns:eu-north-1:911167929681:aws-sns-auth',
        Message: JSON.stringify({
          default: `Login Successful for ${name}`,
          email: {
            subject: 'Login Successful',
            body: `Hello ${name},\n\nYou have successfully logged in to your account.`,
          },
        }),
        MessageStructure: 'json',
        MessageAttributes: {
          email: {
            DataType: 'String',
            StringValue: email,
          },
        },
      };
      const response = await this.sns.publish(params).promise();
      this.logger.log(
        `Login success email sent to ${email}: ${JSON.stringify(response)}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send login success email to ${email}: ${error.message}`,
      );
      throw error;
    }
  }
}
