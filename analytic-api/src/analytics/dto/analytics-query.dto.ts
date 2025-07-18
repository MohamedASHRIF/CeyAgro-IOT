import { IsString, IsOptional, IsDateString, IsArray, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class AnalyticsQueryDto {
<<<<<<< Updated upstream
=======
  @IsOptional()
  @IsString()
  readonly deviceId: string;

>>>>>>> Stashed changes
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
  @IsString()
  readonly location?: string;

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