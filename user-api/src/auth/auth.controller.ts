// import { Controller, Post, Body } from '@nestjs/common';
// import { UserService } from '../../user.service';
// import { SnsService } from '../../sns.service';

// @Controller('auth')
// export class AuthController {
//   constructor(
//     private userService: UserService,
//     private snsService: SnsService,
//   ) {}

//   @Post('login')
//   async handleLogin(
//     @Body() body: { email: string; name: string },
//   ): Promise<{ message: string; isSubscribed: boolean }> {
//     console.log('Received login request:', body);
//     const { email, name } = body;
//     let user = await this.userService.findOrCreateUser(email, name);

//     // Only increment if login_count is 0 or unset (not set by Auth0)
//     if (!user.login_count || user.login_count === 0) {
//       console.log(`Incrementing login_count for ${email}`);
//       user = await this.userService.incrementLoginCount(email);
//     } else {
//       console.log(
//         `Skipping increment for ${email}: login_count already set to ${user.login_count}`,
//       );
//     }

//     const isSubscribed = user.sns_subscription_status === 'subscribed';

//     if (user.login_count === 1 && isSubscribed) {
//       await this.snsService.sendSubscriptionEmail(email, name);
//     } else if (user.login_count > 1 && isSubscribed) {
//       await this.snsService.sendLoginSuccessEmail(email, name);
//     }

//     return { message: 'Login processed successfully', isSubscribed };
//   }
// }

import { Controller, Post, Body, Logger } from '@nestjs/common';
import { UserService } from '../../src/user/user.service';
import { SnsService } from '../../src/sns/sns.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private userService: UserService,
    private snsService: SnsService,
  ) {}

  @Post('login')
  async handleLogin(
    @Body() body: { email: string; name: string },
  ): Promise<{ message: string; isSubscribed: boolean }> {
    this.logger.log(`Received login request: ${JSON.stringify(body)}`);
    const { email, name } = body;
    const normalizedEmail = email.toLowerCase();

    let user = await this.userService.findOrCreateUser(normalizedEmail, name);
    this.logger.log(
      `User before increment: email=${user.email}, sns_subscription_status=${user.sns_subscription_status}, login_count=${user.login_count}, user_id=${user.user_id}`,
    );
    user = await this.userService.incrementLoginCount(normalizedEmail);
    this.logger.log(
      `User after increment: email=${user.email}, sns_subscription_status=${user.sns_subscription_status}, login_count=${user.login_count}, user_id=${user.user_id}`,
    );

    if (
      user.login_count === 1 &&
      user.sns_subscription_status === 'unsubscribed'
    ) {
      try {
        this.logger.log(`Initiating SNS subscription for ${normalizedEmail}`);
        await this.snsService.subscribeEmail(normalizedEmail);
        user = await this.userService.updateSubscriptionStatus(
          normalizedEmail,
          'pending',
          new Date(),
        );
        this.logger.log(
          `SNS subscription status set to pending for ${normalizedEmail}`,
        );
        await this.snsService.sendSubscriptionEmail(normalizedEmail, name);
        this.logger.log(
          `Subscription email sent successfully to ${normalizedEmail}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to initiate SNS subscription or send email for ${normalizedEmail}: ${error.message}`,
        );
        throw error;
      }
    }

    const isSubscribed = user.sns_subscription_status === 'subscribed';
    this.logger.log(
      `Returning response: isSubscribed=${isSubscribed}, sns_subscription_status=${user.sns_subscription_status}, email=${normalizedEmail}, login_count=${user.login_count}`,
    );

    if (user.login_count >= 1 && isSubscribed) {
      try {
        this.logger.log(`Sending login success email to ${normalizedEmail}`);
        await this.snsService.sendLoginSuccessEmail(normalizedEmail, name);
        this.logger.log(
          `Login success email sent successfully to ${normalizedEmail}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send login success email to ${normalizedEmail}: ${error.message}`,
        );
      }
    } else {
      this.logger.log(
        `No login success email sent. Conditions not met: isSubscribed=${isSubscribed}, login_count=${user.login_count}`,
      );
    }

    return { message: 'Login processed successfully', isSubscribed };
  }

  @Post('confirm-subscription')
  async confirmSubscription(
    @Body() body: { email: string },
  ): Promise<{ message: string }> {
    const normalizedEmail = body.email.toLowerCase();
    this.logger.log(`Confirming SNS subscription for ${normalizedEmail}`);
    const user = await this.userService.updateSubscriptionStatus(
      normalizedEmail,
      'subscribed',
    );
    this.logger.log(
      `SNS subscription confirmed for ${normalizedEmail}: sns_subscription_status=${user.sns_subscription_status}, user_id=${user.user_id}`,
    );
    return { message: `Subscription confirmed for ${normalizedEmail}` };
  }
}
