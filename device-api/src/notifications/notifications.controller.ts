// //notification.controller.ts
// import { Controller, Get, Delete, Param } from '@nestjs/common';
// import { NotificationsService } from './notifications.service';
// import { Notification } from './interfaces/notification.interface';

// @Controller('notifications')
// export class NotificationsController {
//   constructor(private readonly notificationsService: NotificationsService) {}

//   @Get(':userId')
//   //retrieve all notifications for a specific user
//   async findAllByUserId(
//     @Param('userId') userId: string,
//   ): Promise<Notification[]> {
//     return this.notificationsService.findAllByUserId(userId);
//   }

//   //DELETE requests to remove a specific notification by its ID
//   @Delete(':id')
//   async deleteNotification(@Param('id') id: string): Promise<void> {
//     return this.notificationsService.deleteNotification(id);
//   }
// }

import { Controller, Get, Delete, Param, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from './interfaces/notification.interface';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get(':userId')
  async findAllByUserId(
    @Param('userId') userId: string,
  ): Promise<Notification[]> {
    return this.notificationsService.findAllByUserId(userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.markNotificationAsRead(id);
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string): Promise<void> {
    return this.notificationsService.deleteNotification(id);
  }
}
