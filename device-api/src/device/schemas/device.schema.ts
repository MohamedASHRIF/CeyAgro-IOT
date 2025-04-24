import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class DeviceData extends Document {
  @Prop({ required: true })
  deviceId: string;

  @Prop()
  status: string;

  @Prop({ type: Object })
  data: any;

  @Prop()
  topic: string;
}

export const DeviceDataSchema = SchemaFactory.createForClass(DeviceData);