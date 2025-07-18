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
  async getReadings(@Query() queryDto: AnalyticsQueryDto, @Query('email') email: string) {
    try {
      let deviceIds: string[] = [];
      if (email) {
        deviceIds = await this.analyticsService.getDeviceIdsForUser(email);
      }
      // If deviceId is provided in query, use it; otherwise, use all user's deviceIds
      const filterDeviceIds = queryDto.deviceId ? [queryDto.deviceId] : deviceIds;
      if (filterDeviceIds.length === 0) {
        return { success: false, message: 'No devices found for user', data: null };
      }
      // Update service to accept array of deviceIds
      const readings = await this.analyticsService.getReadingsForDevices(filterDeviceIds, queryDto);
      return {
        success: true,
        message: 'Readings fetched successfully',
        data: { deviceIds: filterDeviceIds, readings },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { success: false, message: error.message, data: null };
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
