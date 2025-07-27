// src/activity-log/dto/activity-log.dto.ts
{/* import { IsString, IsOptional, IsEmail, IsEnum, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ActivityAction {
  CREATED_DEVICE = 'created_device',
  EDITED_DEVICE = 'edited_device',
  DELETED_DEVICE = 'deleted_device',
  REGISTERED_DEVICE = 'registered_device',
  UNREGISTERED_DEVICE = 'unregistered_device',
}

export class GetActivityLogsDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(ActivityAction)
  action?: ActivityAction;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class GetActivity */}