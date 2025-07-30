import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Get()
    async findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.userService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(id, updateUserDto);
    }

    @Patch(':id/make-admin')
    async makeAdmin(@Param('id') id: string) {
        return this.userService.makeAdmin(id);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.userService.remove(id);
    }
}
