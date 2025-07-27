import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ActivityLog, ActivityLogDocument } from './schemas/act-log.schema';
import { Model } from 'mongoose';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectModel(ActivityLog.name)
    private activityLogModel: Model<ActivityLogDocument>,
  ) {}

  async log(
    email: string,
    action: ActivityLog['action'],
    deviceId?: string,
    message?: string,
    changes?: { [key: string]: { oldValue: any; newValue: any } }
  ) {
    console.log('Logging changes:', changes);
    return this.activityLogModel.create({ email, action, deviceId, message, changes });
  }

  async getLogsByEmail(email: string) {
    return this.activityLogModel.find({ email }).sort({ createdAt: -1 }).lean();
  }

  async clearLogsByEmail(email: string) {
    return this.activityLogModel.deleteMany({ email });
  }

  async deleteSingleLog(email: string, logId: string) {
    const result = await this.activityLogModel.deleteOne({ 
      _id: logId, 
      email: email 
    });
    return result.deletedCount > 0;
  }

  async bulkDeleteByIds(email: string, logIds: string[]) {
    const result = await this.activityLogModel.deleteMany({
      _id: { $in: logIds },
      email: email
    });
    return result.deletedCount;
  }

  async bulkDeleteByAction(email: string, action: string) {
    const result = await this.activityLogModel.deleteMany({
      email: email,
      action: action
    });
    return result.deletedCount;
  }

  async bulkDeleteByDate(email: string, dateFilter: string) {
    const now = new Date();
    let startDate: Date;

    switch (dateFilter) {
      case 'TODAY':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'YESTERDAY':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const result = await this.activityLogModel.deleteMany({
          email: email,
          createdAt: {
            $gte: startDate,
            $lt: endDate
          }
        });
        return result.deletedCount;
      case 'LAST_7_DAYS':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'LAST_30_DAYS':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        throw new Error('Invalid date filter');
    }

    const result = await this.activityLogModel.deleteMany({
      email: email,
      createdAt: { $gte: startDate }
    });
    return result.deletedCount;
  }
}