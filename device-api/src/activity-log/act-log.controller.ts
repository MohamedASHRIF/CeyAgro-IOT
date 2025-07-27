import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ActivityLogService } from './act-log.service';

@Controller('activity-log')
export class ActivityLogController {
  constructor(private readonly logService: ActivityLogService) {}

  @Get()
  async getLogs(@Query('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const logs = await this.logService.getLogsByEmail(email);
    return {
      success: true,
      count: logs.length,
      data: logs,
    };
  }
}
