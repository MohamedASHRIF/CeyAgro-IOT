//device-user.controller.ts

import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  Patch,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpException,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import { DeviceUserService } from './device-user.service';
import { CreateDeviceUserDto } from './dto/create-device-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('device-user')
export class DeviceUserController {
  constructor(private readonly deviceUserService: DeviceUserService) {}

 @Post('register')
@UseInterceptors(
  FileInterceptor('deviceImage', {
    storage: diskStorage({
      destination: './uploads/devices',
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
      },
    }),
  }),
)
async registerDevice(
  @UploadedFile() file: Express.Multer.File,
  @Body() createDto: CreateDeviceUserDto,
) {
  try {
    if (file) {
      createDto.deviceImage = `/uploads/devices/${file.filename}`;
    }
    console.log('Received email:', createDto.email);
    console.log('Full DTO:', createDto);

    const result = await this.deviceUserService.registerDevice(createDto);
    return {
      success: true,
      message: 'Device registered successfully',
      data: result,
    };
  } catch (error) {
    console.error('Controller caught error:', error);
    // Optionally, rethrow or return a custom error response
    throw error;
  }
}
  @Get('devices')
  async getDevicesForUser(@Query('email') email: string) {
    if (!email) {
      throw new BadRequestException('email is required');
    }

    const result = await this.deviceUserService.getDevicesForUser(email);
    return {
      success: true,
      count: result.length,
      data: result,
    };
  }

  @Get('device')
  async getDevice(
    @Query('email') email: string,
    @Query('deviceId') deviceId: string,
  ) {
    if (!email || !deviceId) {
      throw new BadRequestException('email and deviceId are required');
    }

    const result = await this.deviceUserService.getDeviceForUser(
      email,
      deviceId,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get('statistics')
  async getDeviceStatistics(@Query('email') email?: string) {
    if (!email) {
      return {
        success: false,
        message: 'email parameter is required',
      };
    }

    try {
      const statistics =
        await this.deviceUserService.getDeviceStatistics(email);
      return {
        success: true,
        message: `Device statistics retrieved successfully for ${email}`,
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
    @Query('email') email: string,
    @Query('deviceId') deviceId: string,
  ) {
    if (!email || !deviceId) {
      throw new BadRequestException('email and deviceId are required');
    }

    await this.deviceUserService.unregisterDevice(email, deviceId);
    return {
      success: true,
      message: 'Device unregistered successfully',
    };
  }

  @Patch('update')
  @UseInterceptors(FileInterceptor('deviceImage'))
  async updateDeviceUser(
    @Query('email') email: string,
    @Query('deviceId') deviceId: string,
    @Body()
    updateData: Partial<CreateDeviceUserDto> & { removedeviceImage?: string },
    @UploadedFile() deviceImage?: Express.Multer.File,
  ) {
    if (!email || !deviceId) {
      throw new BadRequestException('email and deviceId are required');
    }

    const { removedeviceImage, ...rest } = updateData;

    const updated = await this.deviceUserService.updateDeviceUser(
      email,
      deviceId,
      rest,
      deviceImage,
      removedeviceImage,
    );

    return {
      success: true,
      message: 'Device information updated successfully',
      data: updated,
    };
  }

  // === Test Routes ===

  @Get('test')
  testRoute() {
    return { message: 'Controller is working!' };
  }

  @Get('test-model')
  async testModel() {
    console.log('Testing model...');
    const testData = {
      email: 'test@example.com',
      deviceId: 'test-device-123',
      deviceName: 'Test Device',
      description: 'Test Description',
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
  async testDevices(@Query('email') email?: string) {
    console.log('=== TEST DEVICES ENDPOINT ===');
    console.log('Testing with email:', email);

    try {
      const allUserDevices = await this.deviceUserService.getAllUserDevices();
      const allDevices = await this.deviceUserService.getAllDevices();

      let userDevices = null;
      if (email) {
        userDevices = await this.deviceUserService.getDevicesForUser(email);
      }

      return {
        success: true,
        message: 'Database test completed',
        data: {
          allUserDevices,
          allDevices,
          userDevices,
          testEmail: email,
        },
      };
    } catch (error) {
      console.error('Test devices error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  // ==Location==

  // Get locations for  user
  @Get('locations')
  async findDeviceLocationsForUser(@Query('email') email: string) {
    try {
      if (!email) {
        throw new BadRequestException('userId is required');
      }

      const locations =
        await this.deviceUserService.findDeviceLocationsForUser(email);
      return locations;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch device locations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //  Update device location
  @Put(':id/location')
  async updateDeviceLocation(
    @Param('id') deviceId: string,
    @Body() updateData: { location: string },
    @Query('email') email: string,
  ) {
    try {
      if (!email) {
        throw new BadRequestException('email is required');
      }

      const updatedDevice = await this.deviceUserService.updateDeviceLocation(
        deviceId,
        updateData,
        email,
      );

      return {
        success: true,
        message: 'Device location updated successfully',
        data: updatedDevice,
      };
    } catch (error) {
      if (
        error instanceof HttpException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new HttpException(
        'Failed to update device location',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}




/*
// src/device-user/device-user.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  Patch,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { DeviceUserService } from './device-user.service';
import { CreateDeviceUserDto } from './dto/create-device-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { diskStorage } from 'multer';
import { LogMetadata } from 'src/activity-log/act-log.service';
import * as path from 'path';

@Controller('device-user')
export class DeviceUserController {
  constructor(private readonly deviceUserService: DeviceUserService) {}

  private extractMetadata(req: Request): LogMetadata {
    return {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      // You can add location if you have geolocation service
    };
  }

  @Post('register')
  @UseInterceptors(
    FileInterceptor('deviceImage', {
      storage: diskStorage({
        destination: './uploads/devices',
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          const fileName = `${Date.now()}-${file.originalname}`;
          cb(null, fileName);
        },
      }),
    }),
  )
  async registerDevice(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDto: CreateDeviceUserDto,
    @Req() req: Request,
  ) {
    try {
      if (file) {
        createDto.deviceImage = `/uploads/devices/${file.filename}`;
      }
      console.log('Received email:', createDto.email);
      console.log('Full DTO:', createDto);

      const metadata = this.extractMetadata(req);
      const result = await this.deviceUserService.registerDevice(createDto, metadata);
      
      return {
        success: true,
        message: 'Device registered successfully',
        data: result,
      };
    } catch (error) {
      console.error('Controller caught error:', error);
      throw error;
    }
  }

  @Get('devices')
  async getDevicesForUser(@Query('email') email: string) {
    if (!email) {
      throw new BadRequestException('email is required');
    }

    const result = await this.deviceUserService.getDevicesForUser(email);
    return {
      success: true,
      count: result.length,
      data: result,
    };
  }

  @Get('device')
  async getDevice(
    @Query('email') email: string,
    @Query('deviceId') deviceId: string,
  ) {
    if (!email || !deviceId) {
      throw new BadRequestException('email and deviceId are required');
    }

    const result = await this.deviceUserService.getDeviceForUser(
      email,
      deviceId,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get('statistics')
  async getDeviceStatistics(@Query('email') email?: string) {
    if (!email) {
      return {
        success: false,
        message: 'email parameter is required',
      };
    }

    try {
      const statistics =
        await this.deviceUserService.getDeviceStatistics(email);
      return {
        success: true,
        message: `Device statistics retrieved successfully for ${email}`,
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
    @Query('email') email: string,
    @Query('deviceId') deviceId: string,
    @Req() req: Request,
  ) {
    if (!email || !deviceId) {
      throw new BadRequestException('email and deviceId are required');
    }

    const metadata = this.extractMetadata(req);
    await this.deviceUserService.unregisterDevice(email, deviceId, metadata);
    
    return {
      success: true,
      message: 'Device unregistered successfully',
    };
  }

  @Patch('update')
  @UseInterceptors(FileInterceptor('deviceImage'))
  async updateDeviceUser(
    @Query('email') email: string,
    @Query('deviceId') deviceId: string,
    @Body()
    updateData: Partial<CreateDeviceUserDto> & { removedeviceImage?: string },
    @UploadedFile() deviceImage?: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!email || !deviceId) {
      throw new BadRequestException('email and deviceId are required');
    }

    const { removedeviceImage, ...rest } = updateData;
    const metadata = this.extractMetadata(req);

    const updated = await this.deviceUserService.updateDeviceUser(
      email,
      deviceId,
      rest,
      deviceImage,
      removedeviceImage,
      metadata,
    );

    return {
      success: true,
      message: 'Device information updated successfully',
      data: updated,
    };
  }

  // Update device location with activity logging
  @Put(':id/location')
  async updateDeviceLocation(
    @Param('id') deviceId: string,
    @Body() updateData: { location: string },
    @Query('email') email: string,
    @Req() req: Request,
  ) {
    try {
      if (!email) {
        throw new BadRequestException('email is required');
      }

      const metadata = this.extractMetadata(req);
      const updatedDevice = await this.deviceUserService.updateDeviceLocation(
        deviceId,
        updateData,
        email,
        metadata,
      );

      return {
        success: true,
        message: 'Device location updated successfully',
        data: updatedDevice,
      };
    } catch (error) {
      if (
        error instanceof HttpException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new HttpException(
        'Failed to update device location',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get locations for user
  @Get('locations')
  async findDeviceLocationsForUser(@Query('email') email: string) {
    try {
      if (!email) {
        throw new BadRequestException('userId is required');
      }

      const locations =
        await this.deviceUserService.findDeviceLocationsForUser(email);
      return locations;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch device locations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // === Test Routes ===
  @Get('test')
  testRoute() {
    return { message: 'Controller is working!' };
  }

  @Get('test-model')
  async testModel() {
    console.log('Testing model...');
    const testData = {
      email: 'test@example.com',
      deviceId: 'test-device-123',
      deviceName: 'Test Device',
      description: 'Test Description',
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
  async testDevices(@Query('email') email?: string) {
    console.log('=== TEST DEVICES ENDPOINT ===');
    console.log('Testing with email:', email);

    try {
      const allUserDevices = await this.deviceUserService.getAllUserDevices();
      const allDevices = await this.deviceUserService.getAllDevices();

      let userDevices = null;
      if (email) {
        userDevices = await this.deviceUserService.getDevicesForUser(email);
      }

      return {
        success: true,
        message: 'Database test completed',
        data: {
          allUserDevices,
          allDevices,
          userDevices,
          testEmail: email,
        },
      };
    } catch (error) {
      console.error('Test devices error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}*/