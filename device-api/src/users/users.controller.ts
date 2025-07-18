// import { Controller, Post, Body, Param } from '@nestjs/common';
// import { UsersService } from './users.service';

// @Controller('users')
// export class UsersController {
//   constructor(private readonly usersService: UsersService) {}

//   @Post(':userId/fcm-token')
//   async updateFcmToken(
//     @Param('userId') userId: string,
//     @Body('fcmToken') fcmToken: string,
//   ) {
//     await this.usersService.updateFcmToken(userId, fcmToken);
//     return { message: 'FCM token updated' };
//   }
// }

// // notifications.controller.ts
// import { Controller, Get, Delete, Param } from '@nestjs/common';
// import { NotificationsService } from '../notifications/notifications.service';
// import { Notification } from '../notifications/interfaces/notification.interface';

// @Controller('notifications')
// export class NotificationsController {
//   constructor(private readonly notificationsService: NotificationsService) {}

//   @Get(':email') // Changed from userId to email
//   async findAllByUserId(
//     @Param('email') email: string,
//   ): Promise<Notification[]> {
//     return this.notificationsService.findAllByUserId(email);
//   }

//   @Delete(':id')
//   async deleteNotification(@Param('id') id: string): Promise<void> {
//     return this.notificationsService.deleteNotification(id);
//   }
// }

// users.controller.ts
import { Controller, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post(':email/fcm-token') // Changed from userId to email
  async updateFcmToken(
    @Param('email') email: string,
    @Body('fcmToken') fcmToken: string,
  ) {
    await this.usersService.updateFcmToken(email, fcmToken);
    return { message: 'FCM token updated' };
  }
}
