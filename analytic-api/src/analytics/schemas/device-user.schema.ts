import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class DeviceType {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true, type: Number })
  minValue: number;

  @Prop({ required: true, type: Number })
  maxValue: number;
}

export const DeviceTypeSchema = SchemaFactory.createForClass(DeviceType);

@Schema({ timestamps: true })
export class DeviceUser {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  deviceName: string;

  @Prop()
  description: string;

  @Prop()
  deviceImage: string;

  @Prop()
  location: string;

  @Prop()
  serialNumber: string;

  @Prop({ type: [DeviceTypeSchema], default: [] })
  deviceTypes: DeviceType[];
}

export type DeviceUserDocument = DeviceUser & Document;
export const DeviceUserSchema = SchemaFactory.createForClass(DeviceUser); 