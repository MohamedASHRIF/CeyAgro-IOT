/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    readonly name?: string;

    @IsOptional()
    @IsEmail()
    readonly email?: string;

    @IsOptional()
    @IsString()
    readonly password?: string;

    @IsOptional()
    @IsString()
    readonly role?: string;
}
