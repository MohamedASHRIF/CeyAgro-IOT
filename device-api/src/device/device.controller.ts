//device.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { DeviceService } from './device.service';
import { MessagePattern, Payload, Ctx } from '@nestjs/microservices';
import { KafkaContext } from '@nestjs/microservices';

@Controller('devices')
export class DevicesController {
  constructor(private readonly deviceService: DeviceService) {}

  // Health check endpoint
  @Get('health')
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'device-api',
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  // Handle IoT data from Kafka
  @MessagePattern('iot.device.data')
  handleIoTData(@Payload() data: any, @Ctx() context: KafkaContext) {
    return this.deviceService.processIoTData(data, context);
  }

  // Handle device status requests from Kafka
  @MessagePattern('iot.device.status')
  getDeviceStatus(@Payload() deviceId: string) {
    return this.deviceService.getLatestDeviceData(deviceId);
  }

  @Post('data')
  async processDeviceData(@Body() data: any) {
    return this.deviceService.processIoTData(data, {
      getTopic: () => 'iot.device.data',
    } as KafkaContext);
  }

  @Get(':deviceId/status')
  async getDeviceStatusHttp(@Param('deviceId') deviceId: string) {
    return this.deviceService.getLatestDeviceData(deviceId);
  }

  @Get(':deviceId/history')
  async getDeviceHistory(@Param('deviceId') deviceId: string) {
    return this.deviceService.getDeviceData(deviceId);
  }
}
