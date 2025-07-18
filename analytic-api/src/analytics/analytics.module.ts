import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { ExcelService } from './excel.service';
import { S3Service } from './s3.service';
import { ConfigModule } from '@nestjs/config';
import { DeviceData, DeviceDataSchema } from './schemas/analytics.schema';
import { DeviceUser, DeviceUserSchema } from './schemas/device-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeviceData.name, schema: DeviceDataSchema },
      { name: DeviceUser.name, schema: DeviceUserSchema }, // Register DeviceUser
    ]),
    ConfigModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, ExcelService, S3Service],
})
export class AnalyticsModule {}