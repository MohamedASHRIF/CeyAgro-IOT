import { IsString, IsOptional, IsDateString, IsArray, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class AnalyticsQueryDto {

  @IsOptional()
  @IsString()
  readonly deviceId: string;

  @IsOptional()
  @IsString()
  readonly name?: string;


  @IsOptional()
  @IsString()
  readonly temperatureValue?: string;

  @IsOptional()
  @IsString()
  readonly humidityValue?: string;

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