/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateDeviceDto {
    @IsOptional()
    @IsString()
    deviceName?: string;

    @IsOptional()
    @IsString()
    deviceType?: string;

    @IsOptional()
    @IsString()
    serialNumber?: string;

    @IsOptional()
    @IsString()
    owner?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
