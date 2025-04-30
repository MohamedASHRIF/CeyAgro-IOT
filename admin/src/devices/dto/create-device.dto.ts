/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';


export class CreateDeviceDto {
    @IsString()
    @IsNotEmpty()
    deviceName: string;

    @IsString()
    @IsNotEmpty()
    deviceType: string;

    @IsString()
    @IsNotEmpty()
    serialNumber: string;

    @IsString()
    @IsNotEmpty()
    owner: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
