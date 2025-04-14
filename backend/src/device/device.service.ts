import { Injectable } from '@nestjs/common';
import { KafkaContext } from '@nestjs/microservices';

@Injectable()
export class DeviceService {
  processIoTData(data: any, context: KafkaContext) {
    const topic = context.getTopic();
    console.log(`Received message from topic ${topic}:`, data);
    // Process your IoT data here
    return { status: 'processed', data };
  }

  getDeviceData(deviceId: string) {
    // Implement device data retrieval logic
    return { deviceId, timestamp: new Date(), status: 'active' };
  }
}