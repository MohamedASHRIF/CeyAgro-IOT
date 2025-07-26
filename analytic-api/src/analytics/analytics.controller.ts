
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
  Req
} from '@nestjs/common';

import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { MessagePattern, Payload, Ctx } from '@nestjs/microservices';
import { KafkaContext } from '@nestjs/microservices';
// @ts-ignore
import axios from 'axios';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeviceUser, DeviceUserDocument } from './schemas/device-user.schema';

// Helper to get userId from JWT (assume req.user is populated by JWT middleware)
function getUserIdFromRequest(req: Request): string | null {
  // @ts-ignore
  return (req.user as any)?.sub || null;
}
// Helper to get deviceIds for a user from device-api
async function getUserDeviceIds(userId: string): Promise<string[]> {
  const deviceApiUrl = process.env.DEVICE_API_URL || 'http://localhost:3001/device-user/devices';
  const response = await axios.get(deviceApiUrl, { params: { userId } });
  // The response data structure: { success: true, count: N, data: [...] }
  if (response.data && Array.isArray(response.data.data)) {
    return response.data.data.map((item: any) => item.userDevice.deviceId);
  }
  return [];
}

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  //Kafka consumer for the 'iot.device.data' topic, processes incoming IoT data
  @MessagePattern('iot.device.data')
  handleIoTData(@Payload() data: any, @Ctx() context: KafkaContext) {
    return this.analyticsService.processIoTData(data, context);
  }

  //Kafka consumer for the 'iot.device.status' topic, retrieves the latest device data
  // @MessagePattern('iot.device.status')
  // getDeviceStatus(@Payload() deviceId: string) {
  //   return this.analyticsService.getLatestDeviceData(deviceId);
  // }

  //kafka post
  //HTTP POST endpoint to simulate IoT data
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




  @Post('download-history')
  async saveDownloadHistory(
    @Body() body: { userEmail: string; filename: string; downloadUrl: string; recordCount: number; s3Key: string },
  ) {
    try {
      const history = await this.analyticsService.saveDownloadHistory(
        body.userEmail,
        body.filename,
        body.downloadUrl,
        body.recordCount,
        body.s3Key,
      );
      return { success: true, message: 'Download history saved', data: history };
    } catch (error) {
      throw new InternalServerErrorException('Failed to save download history');
    }
  }

  @Get('download-history')
  async getDownloadHistory(@Query('email') email: string) {
    if (!email) {
      return { success: false, message: 'User email is required', data: [] };
    }
    try {
      const history = await this.analyticsService.getDownloadHistory(email);
      return { success: true, data: history };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { success: false, message: error.message, data: [] };
      }
      throw new InternalServerErrorException('Failed to fetch download history');
    }
  }

  @Delete('download-history/:id')
  async deleteDownloadHistory(@Param('id') id: string, @Query('email') email: string) {
    if (!email) {
      return { success: false, message: 'User email is required', data: null };
    }
    try {
      await this.analyticsService.deleteDownloadHistory(id, email);
      return { success: true, message: 'Download history entry deleted' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { success: false, message: error.message };
      }
      throw new InternalServerErrorException('Failed to delete download history');
    }
  }











  
  // Visualization Endpoints
// Retrieves real-time stats for a device by name and metric
@Get('realtime/:deviceId')
@UsePipes(new ValidationPipe({ transform: true }))
async getRealtimeStats(
  @Param('deviceId') deviceId: string,
  @Query('metric') metric: 'temperature' | 'humidity',
  @Query('email') email: string
) {
  if (!email) throw new ForbiddenException('User email is required');
  const userDeviceIds = await this.analyticsService.getDeviceIdsForUser(email);
  console.log('DEBUG:', {
    email,
    requestedDeviceId: deviceId,
    userDeviceIds,
    includes: userDeviceIds.includes(deviceId),
    userDeviceIdsSplit: userDeviceIds.map(id => id.split('')),
    requestedDeviceIdSplit: deviceId.split(''),
  });
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

// Retrieves historical stats for a device within a date range
@Get('history/:deviceId')
@UsePipes(new ValidationPipe({ transform: true }))
async getHistoricalStats(
  @Param('deviceId') deviceId: string,
  @Query('metric') metric: 'temperature' | 'humidity',
  @Query('startDate') startDate: string,
  @Query('endDate') endDate: string,
  @Query('email') email: string
) {
  if (!email) throw new ForbiddenException('User email is required');
  const userDeviceIds = await this.analyticsService.getDeviceIdsForUser(email);
  console.log('DEBUG:', {
    email,
    requestedDeviceId: deviceId,
    userDeviceIds,
    includes: userDeviceIds.includes(deviceId),
    userDeviceIdsSplit: userDeviceIds.map(id => id.split('')),
    requestedDeviceIdSplit: deviceId.split(''),
  });
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

// Retrieves aggregated stats (min, max, avg) for a device over a time range
@Get('stats/:deviceId')
@UsePipes(new ValidationPipe({ transform: true }))
async getStats(
  @Param('deviceId') deviceId: string,
  @Query('metric') metric: 'temperature' | 'humidity',
  @Query('timeRange') timeRange: string,
  @Query('email') email: string
) {
  if (!email) throw new ForbiddenException('User email is required');
  const userDeviceIds = await this.analyticsService.getDeviceIdsForUser(email);
  console.log('DEBUG:', {
    email,
    requestedDeviceId: deviceId,
    userDeviceIds,
    includes: userDeviceIds.includes(deviceId),
    userDeviceIdsSplit: userDeviceIds.map(id => id.split('')),
    requestedDeviceIdSplit: deviceId.split(''),
  });
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

// Retrieves available metrics for a device
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

// Endpoint: Get all deviceIds for a user (for frontend dropdowns)
@Get('user-devices')
async getUserDevices(@Query('email') email: string) {
  if (!email) {
    throw new ForbiddenException('User email is required');
  }
  const deviceIds = await this.analyticsService.getDeviceIdsForUser(email);
  return { success: true, data: deviceIds };
}

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

  @Get('device-types')
  async getDeviceTypesForDevice(
    @Query('deviceId') deviceId: string,
    @Query('email') email: string
  ) {
    if (!deviceId || !email) {
      throw new BadRequestException('deviceId and email are required');
    }
    const deviceUser = await this.analyticsService.getDeviceUserByDeviceIdAndEmail(deviceId, email);
    if (!deviceUser) {
      throw new NotFoundException('Device not found for user');
    }
    return {
      success: true,
      data: deviceUser.deviceTypes || []
    };
  }

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
// Prediction endpoint: returns actual and predicted values for a device/metric
@Get('predict/:deviceId')
@UsePipes(new ValidationPipe({ transform: true }))
async getPrediction(
  @Param('deviceId') deviceId: string,
  @Query('metric') metric: 'temperature' | 'humidity',
  @Query('futureWindow') futureWindow: string, // in hours
  @Query('email') email: string
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
// Forecast endpoint: returns forecasted values for a device/metric
@Get('forecast/:deviceId')
@UsePipes(new ValidationPipe({ transform: true }))
async getForecast(
  @Param('deviceId') deviceId: string,
  @Query('metric') metric: 'temperature' | 'humidity',
  @Query('futureWindow') futureWindow: string, // in hours
  @Query('email') email: string
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

