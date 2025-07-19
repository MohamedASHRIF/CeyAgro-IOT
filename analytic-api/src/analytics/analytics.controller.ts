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
  Param,
  ForbiddenException,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { MessagePattern, Payload, Ctx } from '@nestjs/microservices';
import { KafkaContext } from '@nestjs/microservices';
import { Request } from 'express';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @MessagePattern('iot.device.data')
  handleIoTData(@Payload() data: any, @Ctx() context: KafkaContext) {
    return this.analyticsService.processIoTData(data, context);
  }

<<<<<<< Updated upstream
  //Kafka consumer for the 'iot.device.status' topic, retrieves the latest device data
  @MessagePattern('iot.device.status')
  getDeviceStatus(@Payload() deviceId: string) {
    return this.analyticsService.getLatestDeviceData(deviceId);
  }

  //kafka post
  //HTTP POST endpoint to simulate IoT data
=======
>>>>>>> Stashed changes
  @Post('data')
  async simulateIoTData(@Body() data: any) {
    const fakeKafkaContext = {
      getTopic: () => 'iot.device.data',
    } as KafkaContext;
    return this.analyticsService.processIoTData(data, fakeKafkaContext);
  }

  @Get('device-names')
  async getDeviceNamesForUser(@Query('email') email: string) {
    try {
      const deviceNames = await this.analyticsService.getDeviceNamesForUser(email);
      return { success: true, message: 'User device names fetched successfully', data: deviceNames };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { success: false, message: error.message, data: [] };
      }
      throw new InternalServerErrorException('Failed to fetch user device names');
    }
  }

  @Get('readings')
  async getReadingsByDeviceAndDate(
    @Query() queryDto: AnalyticsQueryDto,
    @Query('email') email?: string,
  ) {
    try {
      const data = await this.analyticsService.getReadingsByDeviceAndDate(queryDto, email);
      return {
        success: true,
        message: data.length > 0 ? 'Readings fetched successfully' : 'No readings found for the given criteria',
        data: { readings: data },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        return { success: false, message: error.message, data: null };
      }
      throw new InternalServerErrorException('Failed to fetch readings');
    }
  }

  @Post('export')
  async exportReport(@Query() queryDto: AnalyticsQueryDto, @Query('email') email?: string) {
    try {
      const result = await this.analyticsService.generateAndUploadReport(queryDto, email);
      return { success: true, message: 'Report generated successfully', data: result };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { success: false, message: error.message, data: null };
      }
      throw error;
    }
  }

  @Delete('files')
  async deleteReportFile(@Query('key') s3Key: string) {
    try {
      const result = await this.analyticsService.deleteReportFile(s3Key);
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete report file');
    }
  }

  @Get('realtime/:deviceId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getRealtimeStats(
    @Param('deviceId') deviceId: string,
    @Query('metric') metric: 'temperature' | 'humidity',
    @Query('email') email: string,
  ) {
    if (!email) throw new ForbiddenException('User email is required');
    const userDeviceIds = await this.analyticsService.getDeviceIdsForUser(email);
    if (!userDeviceIds.includes(deviceId)) throw new ForbiddenException('Access to this device is forbidden');
    try {
      return await this.analyticsService.getRealtimeStats(deviceId, metric);
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch realtime stats',
        data: null,
      };
    }
  }

  @Get('history/:deviceId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getHistoricalStats(
    @Param('deviceId') deviceId: string,
    @Query('metric') metric: 'temperature' | 'humidity',
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('email') email: string,
  ) {
    if (!email) throw new ForbiddenException('User email is required');
    const userDeviceIds = await this.analyticsService.getDeviceIdsForUser(email);
    if (!userDeviceIds.includes(deviceId)) throw new ForbiddenException('Access to this device is forbidden');
    try {
      return await this.analyticsService.getHistoricalStats(deviceId, metric, startDate, endDate);
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch historical stats',
        data: null,
      };
    }
  }

  @Get('stats/:deviceId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getStats(
    @Param('deviceId') deviceId: string,
    @Query('metric') metric: 'temperature' | 'humidity',
    @Query('timeRange') timeRange: string,
    @Query('email') email: string,
  ) {
    if (!email) throw new ForbiddenException('User email is required');
    const userDeviceIds = await this.analyticsService.getDeviceIdsForUser(email);
    if (!userDeviceIds.includes(deviceId)) throw new ForbiddenException('Access to this device is forbidden');
    try {
      return await this.analyticsService.getStats(deviceId, metric, timeRange);
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch stats',
        data: null,
      };
    }
  }

  @Get('metrics/:deviceId')
  async getAvailableMetrics(@Param('deviceId') deviceId: string) {
    try {
      return await this.analyticsService.getAvailableMetrics(deviceId);
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch metrics',
        data: null,
      };
    }
  }

  @Get('user-devices')
  async getUserDevices(@Query('email') email: string) {
    if (!email) {
      throw new ForbiddenException('User email is required');
    }
    const deviceIds = await this.analyticsService.getDeviceIdsForUser(email);
    return { success: true, data: deviceIds };
  }

<<<<<<< Updated upstream
// --- Advanced Analytics Endpoints ---
// Anomaly Detection
@Get('anomaly/:deviceId')
@UsePipes(new ValidationPipe({ transform: true }))
async getAnomalies(
  @Param('deviceId') deviceId: string,
  @Query('metric') metric: 'temperature' | 'humidity',
  @Query('startDate') startDate: string,
  @Query('endDate') endDate: string,
  @Query('email') email: string
) {
  if (!email) throw new ForbiddenException('User email is required');
  const userDeviceIds = await this.analyticsService.getDeviceIdsForUser(email);
  if (!userDeviceIds.includes(deviceId)) throw new ForbiddenException('Access to this device is forbidden');
  try {
    return await this.analyticsService.getAnomalies(deviceId, metric, startDate, endDate);
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to fetch anomalies',
      data: null,
    };
  }
}
// Device/Period Comparison
@Get('compare')
@UsePipes(new ValidationPipe({ transform: true }))
async compareDevicesOrPeriods(
  @Query('deviceA') deviceA: string,
  @Query('deviceB') deviceB: string,
  @Query('metric') metric: 'temperature' | 'humidity',
  @Query('startDateA') startDateA: string,
  @Query('endDateA') endDateA: string,
  @Query('startDateB') startDateB: string,
  @Query('endDateB') endDateB: string,
  @Query('email') email: string
) {
  if (!email) throw new ForbiddenException('User email is required');
  const userDeviceIds = await this.analyticsService.getDeviceIdsForUser(email);
  if (!userDeviceIds.includes(deviceA) || !userDeviceIds.includes(deviceB)) throw new ForbiddenException('Access to one or both devices is forbidden');
  try {
    return await this.analyticsService.compareDevicesOrPeriods(deviceA, deviceB, metric, startDateA, endDateA, startDateB, endDateB);
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to compare',
      data: null,
    };
  }
}
// Correlation
@Get('correlation/:deviceId')
@UsePipes(new ValidationPipe({ transform: true }))
async getCorrelation(
  @Param('deviceId') deviceId: string,
  @Query('startDate') startDate: string,
  @Query('endDate') endDate: string,
  @Query('email') email: string
) {
  if (!email) throw new ForbiddenException('User email is required');
  const userDeviceIds = await this.analyticsService.getDeviceIdsForUser(email);
  if (!userDeviceIds.includes(deviceId)) throw new ForbiddenException('Access to this device is forbidden');
  try {
    return await this.analyticsService.getCorrelation(deviceId, startDate, endDate);
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to fetch correlation',
      data: null,
    };
  }
}
}
=======
  @Get('user-device-list')
  async getUserDeviceList(@Query('email') email: string) {
    if (!email) {
      throw new ForbiddenException('User email is required');
    }
    try {
      const deviceList = await this.analyticsService.getUserDeviceList(email);
      return { success: true, data: deviceList };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { success: false, message: error.message, data: [] };
      }
      throw new InternalServerErrorException('Failed to fetch user device list');
    }
  }

  @Get('anomaly/:deviceId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAnomalies(
    @Param('deviceId') deviceId: string,
    @Query('metric') metric: 'temperature' | 'humidity',
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('email') email: string,
  ) {
    if (!email) throw new ForbiddenException('User email is required');
    const userDeviceIds = await this.analyticsService.getDeviceIdsForUser(email);
    if (!userDeviceIds.includes(deviceId)) throw new ForbiddenException('Access to this device is forbidden');
    try {
      return await this.analyticsService.getAnomalies(deviceId, metric, startDate, endDate);
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch anomalies',
        data: null,
      };
    }
  }
>>>>>>> Stashed changes

  @Get('compare')
  @UsePipes(new ValidationPipe({ transform: true }))
  async compareDevicesOrPeriods(
    @Query('deviceA') deviceA: string,
    @Query('deviceB') deviceB: string,
    @Query('metric') metric: 'temperature' | 'humidity',
    @Query('startDateA') startDateA: string,
    @Query('endDateA') endDateA: string,
    @Query('startDateB') startDateB: string,
    @Query('endDateB') endDateB: string,
    @Query('email') email: string,
  ) {
    if (!email) throw new ForbiddenException('User email is required');
    const userDeviceIds = await this.analyticsService.getDeviceIdsForUser(email);
    if (!userDeviceIds.includes(deviceA) || !userDeviceIds.includes(deviceB)) throw new ForbiddenException('Access to one or both devices is forbidden');
    try {
      return await this.analyticsService.compareDevicesOrPeriods(deviceA, deviceB, metric, startDateA, endDateA, startDateB, endDateB);
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to compare',
        data: null,
      };
    }
  }

  @Get('correlation/:deviceId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getCorrelation(
    @Param('deviceId') deviceId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('email') email: string,
  ) {
    if (!email) throw new ForbiddenException('User email is required');
    const userDeviceIds = await this.analyticsService.getDeviceIdsForUser(email);
    if (!userDeviceIds.includes(deviceId)) throw new ForbiddenException('Access to this device is forbidden');
    try {
      return await this.analyticsService.getCorrelation(deviceId, startDate, endDate);
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch correlation',
        data: null,
      };
    }
  }

  @Get('predict/:deviceId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPrediction(
    @Param('deviceId') deviceId: string,
    @Query('metric') metric: 'temperature' | 'humidity',
    @Query('futureWindow') futureWindow: string,
    @Query('email') email: string,
  ) {
    if (!email) throw new ForbiddenException('User email is required');
    const userDeviceIds = await this.analyticsService.getDeviceIdsForUser(email);
    if (!userDeviceIds.includes(deviceId)) throw new ForbiddenException('Access to this device is forbidden');
    try {
      return await this.analyticsService.getPrediction(deviceId, metric, Number(futureWindow) || 24);
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch prediction',
        data: null,
      };
    }
  }

  @Get('forecast/:deviceId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getForecast(
    @Param('deviceId') deviceId: string,
    @Query('metric') metric: 'temperature' | 'humidity',
    @Query('futureWindow') futureWindow: string,
    @Query('email') email: string,
  ) {
    if (!email) throw new ForbiddenException('User email is required');
    const userDeviceIds = await this.analyticsService.getDeviceIdsForUser(email);
    if (!userDeviceIds.includes(deviceId)) throw new ForbiddenException('Access to this device is forbidden');
    try {
      return await this.analyticsService.getForecast(deviceId, metric, Number(futureWindow) || 24);
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch forecast',
        data: null,
      };
    }
  }
}