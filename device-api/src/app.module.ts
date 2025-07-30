
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceModule } from './device/device.module';
import { DeviceUserModule } from './device-user/device-user.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UsersModule } from './users/users.module';
import { ActivityLogModule } from './activity-log/act-log.module';
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
    ActivityLogModule
  ],
})
export class AppModule {}
