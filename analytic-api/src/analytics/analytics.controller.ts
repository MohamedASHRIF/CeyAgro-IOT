import { Controller, NotFoundException, Post, Query, UsePipes, ValidationPipe, Get, Body ,InternalServerErrorException,Delete} from '@nestjs/common';
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
    const fakeKafkaContext = { getTopic: () => 'iot.device.data' } as KafkaContext;
    return this.analyticsService.processIoTData(data, fakeKafkaContext);
  }

  //HTTP POST endpoint to generate and upload an Excel report based on query parameters
  @Post('export')
  @UsePipes(new ValidationPipe({ transform: true }))
  async exportData(@Query() queryDto: AnalyticsQueryDto) {
    try {
      const result = await this.analyticsService.generateAndUploadReport(queryDto);
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
      const readings = await this.analyticsService.getReadingsByDeviceAndDate(queryDto);
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

  //HTTP Delete endpoint to delete file permentanly
  @Delete('report')
  async deleteReport(@Body() body: { s3Key: string }) {
    try {
      // Validate the s3Key parameter
      if (!body.s3Key) {
        throw new InternalServerErrorException('S3 key is required');
      }
      // Delegate to AnalyticsService to delete the report
      await this.analyticsService.deleteReport(body.s3Key);
      return {
        success: true,
        message: `Report ${body.s3Key} deleted successfully`,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        return {
          success: false,
          message: error.message,
          data: null,
        };
      }
      throw error;
    }

}
}