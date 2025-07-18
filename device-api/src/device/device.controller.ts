// import { Controller, Post, Body, Get, Param } from '@nestjs/common';
// import { DeviceService } from './device.service';
// import { MessagePattern, Payload, Ctx } from '@nestjs/microservices';
// import { KafkaContext } from '@nestjs/microservices';

// @Controller('devices')
// export class DeviceController {
//   constructor(private readonly deviceService: DeviceService) {}

//   // Handle IoT data from Kafka
//   @MessagePattern('iot.device.data')
//   handleIoTData(@Payload() data: any, @Ctx() context: KafkaContext) {
//     return this.deviceService.processIoTData(data, context);
//   }

//   // Handle device status requests from Kafka
//   @MessagePattern('iot.device.status')
//   getDeviceStatus(@Payload() deviceId: string) {
//     return this.deviceService.getLatestDeviceData(deviceId);
//   }

//   @Post('data')
//   async simulateIoTData(@Body() data: any) {
//     const fakeKafkaContext = {
//       getTopic: () => 'iot.device.data',
//     } as KafkaContext;
//     return this.deviceService.processIoTData(data, fakeKafkaContext);
//   }

//   @Get(':deviceId/status')
//   async getDeviceStatusHttp(@Param('deviceId') deviceId: string) {
//     return this.deviceService.getLatestDeviceData(deviceId);
//   }

//   @Get(':deviceId/history')
//   async getDeviceHistory(@Param('deviceId') deviceId: string) {
//     return this.deviceService.getDeviceData(deviceId);
//   }
// }


// device/devices.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { DeviceService } from './device.service';

@Controller('devices')
export class DevicesController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post('data')
  async processDeviceData(@Body() data: any) {
    return this.deviceService.processIoTData(data, {
      getTopic: () => 'iot/devices',
    } as any); // Simplified KafkaContext for HTTP
  }
}