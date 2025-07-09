// src/users/dto/user.dto.ts
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(10, 12)
  nic?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+94 7\d{8}$/)
  telephone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  picture?: string;

  @IsOptional()
  @IsString()
  removePicture?: string;
}
