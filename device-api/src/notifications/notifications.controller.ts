import { Controller, Get, Delete, Param } from '@nestjs/common';
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

  @Delete(':id')
  async deleteNotification(@Param('id') id: string): Promise<void> {
    return this.notificationsService.deleteNotification(id);
  }
}
