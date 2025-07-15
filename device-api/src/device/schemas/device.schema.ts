import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DeviceDataDocument = DeviceData & Document;

@Schema({ timestamps: true })
export class DeviceData {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Number })
  temperatureValue: number;

  @Prop({ type: Number })
  humidityValue: number;
  
  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  date: Date;


  @Prop()
  topic: string;
}

export const DeviceDataSchema = SchemaFactory.createForClass(DeviceData);
