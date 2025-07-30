import {
  IsEmail,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class DeviceTypeDto {
  @IsString()
  type: string;

  @IsNumber()
  minValue: number;

  @IsNumber()
  maxValue: number;
}

export class CreateDeviceUserDto {
  @IsEmail()
  email: string;

  @IsString()
  deviceId: string;

  @IsString()
  deviceName: string;

  @IsOptional()
  @IsString()
  description?: string;
/*
  @IsOptional()
  @IsString()
  deviceImage?: string;

  @IsOptional()
  @IsString()
  removedeviceImage?: string;*/

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeviceTypeDto)
  deviceTypes?: DeviceTypeDto[];
}
