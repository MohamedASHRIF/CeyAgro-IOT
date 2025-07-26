import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ActivityLog,ActivityLogDocument } from './schemas/act-log.schema';
import { Model } from 'mongoose';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectModel(ActivityLog.name)
    private activityLogModel: Model<ActivityLogDocument>,
  ) {}

  // ... existing code ...
  async log(email: string, action: ActivityLog['action'], deviceId?: string, message?: string, changes?: { [key: string]: { oldValue: any; newValue: any } }) {
    console.log('Logging changes:', changes);
    return this.activityLogModel.create({ email, action, deviceId, message, changes });
  }
// ... existing code ...

  async getLogsByEmail(email: string) {
    return this.activityLogModel.find({ email }).sort({ createdAt: -1 }).lean();
  }
}
