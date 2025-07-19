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






// // users/users.controller.ts
// import { Controller, Post, Param, Body } from '@nestjs/common';
// import { UsersService } from './users.service';

// @Controller('users')
// export class UsersController {
//   constructor(private readonly usersService: UsersService) {}

//   @Post(':userId/fcm-token')
//   async updateFcmToken(
//     @Param('userId') userId: string,
//     @Body() body: { fcmToken: string },
//   ): Promise<{ success: boolean }> {
//     await this.usersService.updateFcmToken(userId, body.fcmToken);
//     return { success: true };
//   }
// }









// import { Controller, Post, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
// import { UsersService } from './users.service';

// @Controller('users')
// export class UsersController {
//   constructor(private readonly usersService: UsersService) {}

//   @Post(':userId/fcm-token')
//   async updateFcmToken(
//     @Param('userId') userId: string,
//     @Body() body: { fcmToken: string },
//   ): Promise<{ success: boolean }> {
//     try {
//       const decodedUserId = decodeURIComponent(userId);
//       console.log(`Received request to update FCM token for user: ${decodedUserId}, token: ${body.fcmToken}`);
//       if (!body.fcmToken || typeof body.fcmToken !== 'string' || body.fcmToken.length < 100) {
//         throw new HttpException('Invalid FCM token', HttpStatus.BAD_REQUEST);
//       }
//       await this.usersService.updateFcmToken(decodedUserId, body.fcmToken);
//       return { success: true };
//     } catch (error) {
//       console.error(`Error in updateFcmToken for user ${decodeURIComponent(userId)}:`, error);
//       throw new HttpException(
//         `Failed to update FCM token: ${error.message}`,
//         error.status || HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }
// }





import { Controller, Post, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post(':userId/fcm-token')
  async updateFcmToken(
    @Param('userId') userId: string,
    @Body() body: { fcmToken: string },
  ): Promise<{ success: boolean }> {
    try {
      const decodedUserId = decodeURIComponent(userId);
      console.log(`Received request to update FCM token for user: ${decodedUserId}, token: ${body.fcmToken}`);
      if (!body.fcmToken || typeof body.fcmToken !== 'string' || body.fcmToken.length < 100) {
        throw new HttpException('Invalid FCM token', HttpStatus.BAD_REQUEST);
      }
      if (!decodedUserId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(decodedUserId)) {
        throw new HttpException('Invalid email format', HttpStatus.BAD_REQUEST);
      }
      await this.usersService.updateFcmToken(decodedUserId, body.fcmToken);
      return { success: true };
    } catch (error) {
      console.error(`Error in updateFcmToken for user ${decodeURIComponent(userId)}:`, error);
      if (error.name === 'MongoServerError' && error.code === 11000) {
        throw new HttpException(
          'Duplicate key error: Email already exists',
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        `Failed to update FCM token: ${error.message}`,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}