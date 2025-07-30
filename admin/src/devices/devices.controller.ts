/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { DeviceService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Controller('devices')
export class DeviceController {
    constructor(private readonly deviceService: DeviceService) { }


    @Post()
    async create(@Body() createDeviceDto: CreateDeviceDto) {
        return this.deviceService.create(createDeviceDto);
    }


    @Get()
    async findAll() {
        return this.deviceService.findAll();
    }


    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.deviceService.findOne(id);
    }


    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
        return this.deviceService.update(id, updateDeviceDto);
    }


    async remove(@Param('id') id: string) {
        return this.deviceService.remove(id);
    }

    @Get('user/:userId')
    async findByUser(@Param('userId') userId: string) {
        return this.deviceService.findByUserId(userId);
    }
}
