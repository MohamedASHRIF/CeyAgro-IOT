import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { DeviceService } from './device.service';
import { MessagePattern, Payload, Ctx } from '@nestjs/microservices';
import { KafkaContext } from '@nestjs/microservices';

@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  // Handle IoT data from Kafka
  @MessagePattern('iot.device.data')
  handleIoTData(@Payload() data: any, @Ctx() context: KafkaContext) {
    return this.deviceService.processIoTData(data, context);
  }

  // Handle device status requests from Kafka
  @MessagePattern('iot.device.status')
  getDeviceStatus(@Payload() name: string) {
    return this.deviceService.getLatestDeviceData(name);
  }

  @Post('data')
  async simulateIoTData(@Body() data: any) {
    const fakeKafkaContext = {
      getTopic: () => 'iot.device.data',
    } as KafkaContext;
    return this.deviceService.processIoTData(data, fakeKafkaContext);
  }

  @Get(':name/status')
  async getDeviceStatusHttp(@Param('name') name: string) {
    return this.deviceService.getLatestDeviceData(name);
  }

  @Get(':name/history')
  async getDeviceHistory(@Param('name') name: string) {
    return this.deviceService.getDeviceData(name);
  }
}
