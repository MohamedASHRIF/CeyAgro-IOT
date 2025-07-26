// // src/users/user.controller.ts
// import {
//   Controller,
//   Body,
//   Param,
//   UseInterceptors,
//   UploadedFile,
//   Patch,
//   Get,
// } from '@nestjs/common';
// import { UserService } from './user.service';
// import { UpdateUserDto } from './dto/user.dto';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { Express } from 'express';
// import { User } from './schema/user.schema';

// @Controller('user') //handle routes under user
// export class UserController {
//   constructor(private readonly userService: UserService) {}

//   @Get('profile/:email')
//   async getProfile(@Param('email') email: string): Promise<Partial<User>> {
//     return this.userService.getProfile(email);
//   }

//   @Patch('profile/:email')
//   @UseInterceptors(FileInterceptor('picture'))
//   async updateProfile(
//     @Param('email') email: string,
//     @Body() updateUserDto: UpdateUserDto, //dto for data transfer
//     @UploadedFile() picture: Express.Multer.File,
//   ) {
//     // Extract removePicture from the body
//     const { removePicture, ...restDto } = updateUserDto as any;
//     return this.userService.updateProfile(email, restDto, picture, removePicture);
//   }

//   // get name and picture
//   @Get('profile-short/:email')
//   async getProfileShort(@Param('email') email: string) {
//     const profile = await this.userService.getProfileShort(email);
//     return {
//       name: profile.name,
//       picture: profile.picture,
//     };
//   }
// }

// // src/users/user.controller.ts
// import {
//   Controller,
//   Body,
//   Param,
//   UseInterceptors,
//   UploadedFile,
//   Patch,
//   Get,
// } from '@nestjs/common';
// import { UserService } from './user.service';
// import { UpdateUserDto } from './dto/user.dto';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { Express } from 'express';
// import { User } from './schema/user.schema';

// @Controller('user') //handle routes under user
// export class UserController {
//   constructor(private readonly userService: UserService) {}

//   @Get('profile/:email')
//   async getProfile(@Param('email') email: string): Promise<Partial<User>> {
//     return this.userService.getProfile(email);
//   }

//   @Patch('profile/:email')
//   @UseInterceptors(FileInterceptor('picture'))
//   async updateProfile(
//     @Param('email') email: string,
//     @Body() updateUserDto: UpdateUserDto, //dto for data transfer
//     @UploadedFile() picture: Express.Multer.File,
//   ) {
//     // Extract removePicture from the body
//     const { removePicture, ...restDto } = updateUserDto as any;
//     return this.userService.updateProfile(email, restDto, picture, removePicture);
//   }

//   // get name and picture
//   @Get('profile-short/:email')
//   async getProfileShort(@Param('email') email: string) {
//     const profile = await this.userService.getProfileShort(email);
//     return {
//       name: profile.name,
//       picture: profile.picture,
//     };
//   }

//   //login count
//   // user.controller.ts

// @Get('login-count/:email')
// async getLoginCount(@Param('email') email: string) {
//   const count = await this.userService.getLoginCountByEmail(email);
//   return { count };
// }
// }

import {
  Controller,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Patch,
  Get,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { User } from './schema/user.schema';

@Controller('user') //handle routes under user
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile/:email')
  async getProfile(@Param('email') email: string): Promise<Partial<User>> {
    return this.userService.getProfile(email);
  }

  @Patch('profile/:email')
  @UseInterceptors(FileInterceptor('picture'))
  async updateProfile(
    @Param('email') email: string,
    @Body() updateUserDto: UpdateUserDto, //dto for data transfer
    @UploadedFile() picture: Express.Multer.File,
  ) {
    // Extract removePicture from the body
    const { removePicture, ...restDto } = updateUserDto as any;
    return this.userService.updateProfile(
      email,
      restDto,
      picture,
      removePicture,
    );
  }

  // get name and picture
  @Get('profile-short/:email')
  async getProfileShort(@Param('email') email: string) {
    const profile = await this.userService.getProfileShort(email);
    return {
      name: profile.name,
      picture: profile.picture,
    };
  }

  //login count
  // user.controller.ts

  @Get('login-count/:email')
  async getLoginCount(@Param('email') email: string) {
    const count = await this.userService.getLoginCountByEmail(email);
    return { count };
  }
}
