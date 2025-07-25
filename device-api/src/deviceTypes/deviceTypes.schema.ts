// src/schemas/device-type.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'deviceTypes', timestamps: true }) //
export class DeviceType extends Document {
  @Prop({ required: true, unique: true })
  name: string;
}

export const DeviceTypeSchema = SchemaFactory.createForClass(DeviceType);
