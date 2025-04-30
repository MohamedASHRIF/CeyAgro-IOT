import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './users/users.module';
import { DeviceModule } from './devices/devices.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationsModule } from './notification/notifications.module';

@Module({
    imports: [
        MongooseModule.forRoot('mongodb+srv://nestapi-user:navod1212@nest-api-cluster.10d1u.mongodb.net/ad1-backend'),
        UserModule,
        DeviceModule,
        DashboardModule,
        NotificationsModule,
    ],
})
export class AppModule { }
