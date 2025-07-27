// 1. Update your Activity Log Schema to include changes
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActivityLogDocument = ActivityLog & Document;

@Schema({ timestamps: true })
export class ActivityLog {
  @Prop({ required: true })
  email: string;

  @Prop({ 
    required: true, 
    enum: ['REGISTER_DEVICE', 'EDIT_DEVICE', 'DELETE_DEVICE'] 
  })
  action: 'REGISTER_DEVICE' | 'EDIT_DEVICE' | 'DELETE_DEVICE';

  @Prop()
  deviceId?: string;

  @Prop()
  message?: string;

  // New field to store changes
  @Prop({ type: Object })
  changes?: {
    [key: string]: {
      oldValue: any;
      newValue: any;
    };
  };
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);