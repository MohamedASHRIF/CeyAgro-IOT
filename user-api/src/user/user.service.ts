import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  //Finding or creating users on login
  async findOrCreateUser(email: string, name: string): Promise<User> {
    const normalizedEmail = email.toLowerCase();
    try {
      console.log(`Finding user for email: ${normalizedEmail}`);
      const existingUser = await this.userModel
        .findOne({ email: normalizedEmail })
        .exec();
      if (existingUser) {
        console.log(
          `Found user: email=${normalizedEmail}, sns_subscription_status=${existingUser.sns_subscription_status}, login_count=${existingUser.login_count}, user_id=${existingUser.user_id}`,
        );
        const updateData: any = {
          name,
          updated_at: new Date(),
          last_login: new Date(),
        };
        if (!existingUser.sns_subscription_status) {
          updateData.sns_subscription_status = 'unsubscribed';
          updateData.last_sns_subscription_attempt = null;
        }
        if (existingUser.sns_subscription_status === 'subscribed') {
          console.log(
            `Preserving sns_subscription_status: subscribed for ${normalizedEmail}`,
          );
        }
        if (!existingUser.login_count) {
          updateData.login_count = 0;
        }
        const updatedUser = await this.userModel
          .findOneAndUpdate(
            { email: normalizedEmail },
            { $set: updateData },
            { new: true },
          )
          .exec();
        if (!updatedUser) {
          throw new Error(`Failed to update user for ${normalizedEmail}`);
        }
        console.log(
          `Updated user: email=${normalizedEmail}, sns_subscription_status=${updatedUser.sns_subscription_status}, login_count=${updatedUser.login_count}, user_id=${updatedUser.user_id}`,
        );
        return updatedUser;
      }

      //if user doesn't exist Logs that no user was found, so we’re going to create one
      console.log(`Creating new user for ${normalizedEmail}`);
      const newUser = new this.userModel({
        email: normalizedEmail,
        name,
        user_id: `manual|${normalizedEmail}`,
        login_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
        last_login: new Date(),
        identities: [],
        user_metadata: {},
        sns_subscription_status: 'unsubscribed',
        last_sns_subscription_attempt: null,
      });
      const savedUser = await newUser.save();
      console.log(
        `Created user: email=${normalizedEmail}, sns_subscription_status=${savedUser.sns_subscription_status}, user_id=${savedUser.user_id}`,
      );
      return savedUser;
    } catch (error) {
      console.error(
        `Failed to find or create user for ${normalizedEmail}: ${error.message}`,
      );
      throw new Error(`Failed to find or create user: ${error.message}`);
    }
  }

  //Tracks user activity on each login and increment login count
  async incrementLoginCount(email: string): Promise<User> {
    const normalizedEmail = email.toLowerCase();
    try {
      console.log(`Incrementing login_count for ${normalizedEmail}`);
      const user = await this.userModel
        .findOneAndUpdate(
          { email: normalizedEmail },
          {
            $inc: { login_count: 1 },
            $set: { last_login: new Date(), updated_at: new Date() },
          },
          { new: true },
        )
        .exec();
      if (!user) {
        throw new Error(`User with email ${normalizedEmail} not found`);
      }
      console.log(
        `User after increment: email=${normalizedEmail}, sns_subscription_status=${user.sns_subscription_status}, login_count=${user.login_count}, user_id=${user.user_id}`,
      );
      return user;
    } catch (error) {
      console.error(
        `Failed to increment login count for ${normalizedEmail}: ${error.message}`,
      );
      throw new Error(`Failed to increment login count: ${error.message}`);
    }
  }

  //Keeps SNS subscription state in sync with AWS SNS
  async updateSubscriptionStatus(
    email: string,
    status: string,
    attempt?: Date,
  ): Promise<User> {
    const normalizedEmail = email.toLowerCase();
    try {
      console.log(
        `Updating subscription status for ${normalizedEmail} to ${status}`,
      );
      const update: any = { sns_subscription_status: status };
      if (attempt) {
        update.last_sns_subscription_attempt = attempt;
      }
      const user = await this.userModel
        .findOneAndUpdate(
          { email: normalizedEmail },
          { $set: update },
          { new: true },
        )
        .exec();
      if (!user) {
        console.error(
          `User with email ${normalizedEmail} not found in database`,
        );
        throw new Error(`User with email ${normalizedEmail} not found`);
      }
      console.log(
        `Successfully updated subscription status: email=${normalizedEmail}, sns_subscription_status=${user.sns_subscription_status}, user_id=${user.user_id}`,
      );
      return user;
    } catch (error) {
      console.error(
        `Failed to update subscription status for ${normalizedEmail}: ${error.message}`,
      );
      throw new Error(`Failed to update subscription status: ${error.message}`);
    }
  }
}
