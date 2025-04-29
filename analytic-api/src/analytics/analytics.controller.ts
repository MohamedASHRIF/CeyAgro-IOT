import {
  Controller,
  NotFoundException,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
  Get,
  Body,
  InternalServerErrorException,
  Delete,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { MessagePattern, Payload, Ctx } from '@nestjs/microservices';
import { KafkaContext } from '@nestjs/microservices';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  //Kafka consumer for the 'iot.device.data' topic, processes incoming IoT data
  @MessagePattern('iot.device.data')
  handleIoTData(@Payload() data: any, @Ctx() context: KafkaContext) {
    return this.analyticsService.processIoTData(data, context);
  }

  //Kafka consumer for the 'iot.device.status' topic, retrieves the latest device data
  @MessagePattern('iot.device.status')
  getDeviceStatus(@Payload() deviceId: string) {
    return this.analyticsService.getLatestDeviceData(deviceId);
  }

  //kafka post
  //HTTP POST endpoint to simulate IoT data
  @Post('data')
  async simulateIoTData(@Body() data: any) {
    const fakeKafkaContext = {
      getTopic: () => 'iot.device.data',
    } as KafkaContext;
    return this.analyticsService.processIoTData(data, fakeKafkaContext);
  }

  //HTTP POST endpoint to generate and upload an Excel report based on query parameters
  @Post('export')
  @UsePipes(new ValidationPipe({ transform: true }))
  async exportData(@Query() queryDto: AnalyticsQueryDto) {
    try {
      const result =
        await this.analyticsService.generateAndUploadReport(queryDto);
      return {
        success: true,
        message: 'Report generated successfully',
        data: {
          downloadUrl: result.downloadUrl,
          expiresIn: result.expiresIn,
          recordCount: result.recordCount,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          success: false,
          message: error.message,
          data: null,
        };
      }
      throw error;
    }
  }

  //HTTP GET endpoint to retrieve a list of unique device names
  @Get('names')
  async getDeviceNames(): Promise<string[]> {
    return this.analyticsService.getDeviceNames();
  }

  //HTTP GET endpoint to retrieve filtered device readings based on query parameters
  @Get('readings')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getReadings(@Query() queryDto: AnalyticsQueryDto) {
    try {
      const readings =
        await this.analyticsService.getReadingsByDeviceAndDate(queryDto);
      return {
        success: true,
        message: 'Readings fetched successfully',
        data: {
          deviceName: queryDto.name,
          startDate: queryDto.startDate,
          endDate: queryDto.endDate,
          readings,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          success: false,
          message: error.message,
          data: null,
        };
      }
      throw error;
    }
  }

  //HTTP DELETE endpoint to delete the file
  @Delete('files')
  async deleteFileByQuery(@Query('key') key: string) {
    try {
      if (!key) {
        return {
          success: false,
          message: 'File key is required',
        };
      }
      // Decode the URL parameter and clean it up
      key = decodeURIComponent(key).trim();

      // For security, ensure the key starts with 'analytics/' to prevent deletion outside intended folder
      if (!key.startsWith('analytics/')) {
        key = `analytics/${key}`;
      }

      console.log(`Processing delete request for key: "${key}"`);
      const result = await this.analyticsService.deleteReportFile(key);
      return result;
    } catch (error) {
      console.error('Error in deleteFileByQuery controller:', error);
      if (error instanceof NotFoundException) {
        return {
          success: false,
          message: error.message,
        };
      }
      return {
        success: false,
        message: `Error deleting file: ${error.message}`,
      };
    }
  }
}
