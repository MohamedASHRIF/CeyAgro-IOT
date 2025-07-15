// dto/create-device-user.dto.ts
export class CreateDeviceUserDto {
  userId: string;
  deviceId: string;
  deviceName: string;
  description?: string;
  deviceImage?: string;
  location?: string;
  deviceType?: string;
  serialNumber?: string;
  measurementUnit?: string;
  measurementParameter?: string;
}