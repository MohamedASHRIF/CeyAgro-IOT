// dto/share-device.dto.ts
import { IsEmail, IsOptional, IsIn } from 'class-validator';

export class ShareDeviceDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsIn(['view', 'edit'])
  permission?: 'view' | 'edit';
}

export class UnshareDeviceDto {
  @IsEmail()
  email: string;
}
