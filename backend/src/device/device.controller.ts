import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { DeviceService } from './device.service';
import { MessagePattern, Payload, Ctx } from '@nestjs/microservices';
import { KafkaContext } from '@nestjs/microservices';

@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  // Kafka endpoint for IoT data
  @MessagePattern('iot.device.data')
  handleIoTData(@Payload() data: any, @Ctx() context: KafkaContext) {
    return this.deviceService.processIoTData(data, context);
  }

  // Kafka endpoint for device status
  @MessagePattern('iot.device.status')
  getDeviceStatus(@Payload() deviceId: string) {
    return this.deviceService.getDeviceData(deviceId);
  }

  // HTTP endpoint to simulate sending IoT data
  @Post('data')
  simulateIoTData(@Body() data: any) {
    const fakeKafkaContext = { getTopic: () => 'iot.device.data' } as KafkaContext;
    return this.deviceService.processIoTData(data, fakeKafkaContext);
  }

  // HTTP endpoint to get device status
  @Get(':deviceId/status')
  getDeviceStatusHttp(@Param('deviceId') deviceId: string) {
    return this.deviceService.getDeviceData(deviceId);
  }
}