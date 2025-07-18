/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsEmail()
    @IsNotEmpty()
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    readonly password: string;

    @IsOptional()
    @IsString()
    readonly role?: string;
}

