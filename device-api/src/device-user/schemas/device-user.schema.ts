// In your device-user.schema.ts file, make sure you have unique indexes

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DeviceUserDocument = DeviceUser & Document;

@Schema({ timestamps: true })
export class DeviceUser {
  @Prop({ required: true, unique: true }) // Make deviceId unique at schema level
  deviceId: string;

  @Prop({ required: true })
  deviceName: string;

  @Prop({ 
    required: false, 
    sparse: true, // This allows multiple documents with null/undefined serialNumber
    unique: true  // But ensures uniqueness when serialNumber is provided
  })
  serialNumber: string;

  @Prop({ required: true })
  location: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  deviceImage: string;

  @Prop([{
    type: {
      type: String,
      required: true
    },
    minValue: {
      type: Number,
      required: true
    },
    maxValue: {
      type: Number,
      required: true
    }
  }])
  deviceTypes: Array<{
    type: string;
    minValue: number;
    maxValue: number;
  }>;
  
/*  @Prop([{ 
    email: { type: String, required: true }, 
    permission: { type: String, enum: ['view', 'edit'], default: 'view' } 
  }])
  sharedWith: Array<{ email: string; permission: 'view' | 'edit' }>;*/
}




export const DeviceUserSchema = SchemaFactory.createForClass(DeviceUser);

// Add compound indexes for better query performance
DeviceUserSchema.index({ deviceId: 1 }, { unique: true });
DeviceUserSchema.index({ serialNumber: 1 }, { unique: true, sparse: true });
DeviceUserSchema.index({ email: 1 });