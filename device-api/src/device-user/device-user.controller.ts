import { Controller, Post, Body, Get, Query, Delete, Patch } from '@nestjs/common';
import { DeviceUserService } from './device-user.service';
import { CreateDeviceUserDto } from './dto/create-device-user.dto';
import { BadRequestException} from '@nestjs/common';

@Controller('device-user')
export class DeviceUserController {
  constructor(private readonly deviceUserService: DeviceUserService) {}

  @Post('register')
  async registerDevice(@Body() createDto: CreateDeviceUserDto) {
    const result = await this.deviceUserService.registerDevice(createDto);
    return {
      success: true,
      message: 'Device registered successfully',
      data: result,
    };
  }

  @Get('devices')
  async getDevicesForUser(@Query('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    
    const result = await this.deviceUserService.getDevicesForUser(userId);
    return {
      success: true,
      count: result.length,
      data: result,
    };
  }

  
  @Get('device')
  async getDevice(
    @Query('userId') userId: string,
    @Query('deviceId') deviceId: string,
  ) {
    if (!userId || !deviceId) {
      throw new BadRequestException('userId and deviceId are required');
    }
    
    const result = await this.deviceUserService.getDeviceForUser(userId, deviceId);
    return {
      success: true,
      data: result,
    };
  }
@Get('statistics')
async getDeviceStatistics(@Query('userId') userId?: string) {
  try {
    // Validate userId if provided
    if (!userId) {
      return {
        success: false,
        message: 'userId parameter is required',
      };
    }

    const statistics = await this.deviceUserService.getDeviceStatistics(userId);
    return {
      success: true,
      message: `Device statistics retrieved successfully for user ${userId}`,
      data: statistics,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to retrieve device statistics',
      error: error.message,
    };
  }
}
  @Delete('unregister')
  async unregisterDevice(
    @Query('userId') userId: string,
    @Query('deviceId') deviceId: string,
  ) {
    if (!userId || !deviceId) {
      throw new BadRequestException('userId and deviceId are required');
    }
    
    await this.deviceUserService.unregisterDevice(userId, deviceId);
    return {
      success: true,
      message: 'Device unregistered successfully',
    };
  }

  @Patch('update')
  async updateDeviceUser(
    @Query('userId') userId: string,
    @Query('deviceId') deviceId: string,
    @Body() updateData: Partial<CreateDeviceUserDto>,
  ) {
    if (!userId || !deviceId) {
      throw new BadRequestException('userId and deviceId are required');
    }
    
    const result = await this.deviceUserService.updateDeviceUser(userId, deviceId, updateData);
    return {
      success: true,
      message: 'Device information updated successfully',
      data: result,
    };
  }

  //test methods
   @Get('test')
  testRoute() {
    return { message: 'Controller is working!' };
  }
  @Get('test-model')
async testModel() {
  console.log('Testing model...');
  const testData = {
    userId: 'test-user-123',
    deviceId: 'test-device-123',
    deviceName: 'Test Device',
    description: 'Test Description'
  };
  
  try {
    const result = await this.deviceUserService.testSave(testData);
    return { success: true, data: result };
  } catch (error) {
    console.error('Test failed:', error);
    return { success: false, error: error.message };
  }
}
@Get('database-info')
async getDatabaseInfo() {
  return await this.deviceUserService.getDatabaseInfo();
}

@Get('test-devices')
async testDevices(@Query('userId') userId?: string) {
  console.log('=== TEST DEVICES ENDPOINT ===');
  console.log('Testing with userId:', userId);
  
  try {
    // Get all devices in the device-user collection
    const allUserDevices = await this.deviceUserService.getAllUserDevices();
    console.log('All user devices:', allUserDevices);
    
    // Get all devices in the device collection
    const allDevices = await this.deviceUserService.getAllDevices();
    console.log('All devices:', allDevices);
    
    // If userId provided, get devices for that specific user
    let userDevices = null;
    if (userId) {
      userDevices = await this.deviceUserService.getDevicesForUser(userId);
      console.log('Devices for specific user:', userDevices);
    }
    
    return {
      success: true,
      message: 'Database test completed',
      data: {
        allUserDevices,
        allDevices,
        userDevices,
        testUserId: userId
      }
    };
  } catch (error) {
    console.error('Test devices error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
}