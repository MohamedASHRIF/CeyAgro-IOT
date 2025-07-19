// 
import { IsOptional, IsString, IsNumber, IsDateString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class AnalyticsQueryDto {
  @IsOptional()
  @IsString({ message: 'deviceId must be a string' })
  readonly deviceId?: string;

  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsNumber()
  readonly temperatureValue?: number;

  @IsOptional()
  @IsNumber()
  readonly humidityValue?: number;

  @IsOptional()
  @IsDateString()
  readonly date?: string;

  @IsOptional()
  @IsDateString()
  readonly startDate?: string;

  @IsOptional()
  @IsDateString()
  readonly endDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  readonly fields?: string[];
}
