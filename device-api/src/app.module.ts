// import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
// import { MongooseModule } from '@nestjs/mongoose';
// import { DeviceModule } from './device/device.module';
// import { DeviceUserModule } from './device-user/device-user.module';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//       envFilePath: '.env',
//     }),
//     MongooseModule.forRoot(process.env.MONGO_URI), // MongoDB connection
//     DeviceModule,
//     DeviceUserModule,
//   ],
// })
// export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceModule } from './device/device.module';
import { DeviceUserModule } from './device-user/device-user.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGO_URI,
      }),
    }),
    MongooseModule.forRootAsync({
      connectionName: 'users_db',
      useFactory: () => ({
        uri: process.env.USERS_MONGO_URI,
      }),
    }),
    DeviceModule,
    DeviceUserModule,
    NotificationsModule,
    UsersModule, // Import UsersModule
  ],
})
export class AppModule {}
