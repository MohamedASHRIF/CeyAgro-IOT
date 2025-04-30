// src/protected/protected.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt.guard';

@Controller('protected')
export class ProtectedController {
  @UseGuards(JwtGuard)
  @Get()
  getProtectedResource() {
    return { message: 'This is a protected resource vkmfmv' };
  }
}
