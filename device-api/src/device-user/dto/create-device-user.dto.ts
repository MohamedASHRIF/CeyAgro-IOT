/*
import {
  IsEmail,
  IsString,
  IsOptional
} from 'class-validator';

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

  @IsOptional()
  @IsString()
  deviceImage?: string;

  @IsOptional()
  @IsString()
  removedeviceImage?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  deviceType?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  measurementUnit?: string;

  @IsOptional()
  @IsString()
  measurementParameter?: string;
}*/


import {
  IsEmail,
  IsString,
  IsOptional
} from 'class-validator';

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

  @IsOptional()
  @IsString()
  deviceImage?: string;

  @IsOptional()
  @IsString()
  removedeviceImage?: string;

  @IsOptional()
  @IsString()
  location?: string;

  

  @IsOptional()
  @IsString()
  serialNumber?: string;

/*  @IsOptional()
  @IsString()
  deviceType?: string;

  @IsOptional()
  @IsString()
  measurementUnit?: string;

  @IsOptional()
  @IsString()
  measurementParameter?: string;*/
}

