import { Controller, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post(':userId/fcm-token')
  async updateFcmToken(
    @Param('userId') userId: string,
    @Body('fcmToken') fcmToken: string,
  ) {
    await this.usersService.updateFcmToken(userId, fcmToken);
    return { message: 'FCM token updated' };
  }
}
