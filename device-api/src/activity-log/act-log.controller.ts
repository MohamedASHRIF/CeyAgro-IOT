import { Body, Controller, Delete, Get, Query, Param, BadRequestException } from '@nestjs/common';
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

  @Delete('clear')
  async clearLogs(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    await this.logService.clearLogsByEmail(email);
    return {
      success: true,
      message: 'Activity logs cleared',
    };
  }

  @Delete('bulk-delete')
  async bulkDeleteLogs(@Body() body: {
    email: string;
    logIds?: string[];
    deleteType: 'selected' | 'by_action' | 'by_date';
    actionFilter?: string;
    dateFilter?: string;
  }) {
    const { email, logIds, deleteType, actionFilter, dateFilter } = body;

    if (!email) {
      throw new BadRequestException('Email is required');
    }

    if (!deleteType) {
      throw new BadRequestException('Delete type is required');
    }

    let deletedCount = 0;

    switch (deleteType) {
      case 'selected':
        if (!logIds || logIds.length === 0) {
          throw new BadRequestException('Log IDs are required for selected deletion');
        }
        deletedCount = await this.logService.bulkDeleteByIds(email, logIds);
        break;

      case 'by_action':
        if (!actionFilter) {
          throw new BadRequestException('Action filter is required for action-based deletion');
        }
        deletedCount = await this.logService.bulkDeleteByAction(email, actionFilter);
        break;

      case 'by_date':
        if (!dateFilter) {
          throw new BadRequestException('Date filter is required for date-based deletion');
        }
        deletedCount = await this.logService.bulkDeleteByDate(email, dateFilter);
        break;

      default:
        throw new BadRequestException('Invalid delete type');
    }

    return {
      success: true,
      message: `${deletedCount} activity logs deleted`,
      deletedCount,
    };
  }

  @Delete(':id')
  async deleteSingleLog(@Param('id') id: string, @Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    if (!id) {
      throw new BadRequestException('Log ID is required');
    }

    const deleted = await this.logService.deleteSingleLog(email, id);
    
    if (!deleted) {
      throw new BadRequestException('Log not found or not authorized to delete');
    }

    return {
      success: true,
      message: 'Activity log deleted',
    };
  }
}