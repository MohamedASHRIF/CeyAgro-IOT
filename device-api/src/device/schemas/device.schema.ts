// // import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// // import { Document } from 'mongoose';

// // export type DeviceDataDocument = DeviceData & Document;

// // @Schema({ timestamps: true })
// // export class DeviceData {
// //   @Prop({ type: Number })
// //   temperatureValue: number;

// //   @Prop({ type: Number })
// //   humidityValue: number;

// //   @Prop({ default: true })
// //   isActive: boolean;

// //   @Prop()
// //   date: Date;

// //   @Prop({ required: true })
// //   deviceId: string;

// //   @Prop()
// //   topic: string;
// // }

// // export const DeviceDataSchema = SchemaFactory.createForClass(DeviceData);

// // device/schemas/device.schema.ts
// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';

// export type DeviceDataDocument = DeviceData & Document;

// @Schema({ timestamps: true })
// export class DeviceData {
//   @Prop({ required: true })
//   deviceId: string;

//   @Prop({ type: Number , required: true })
//   temperatureValue: number;

//   @Prop({ type: Number , required: true })
//   humidityValue: number;

//   @Prop({ default: true })
//   isActive: boolean;

//   @Prop()
//   date: Date;

//   @Prop()
//   topic: string;
 
// }

// export const DeviceDataSchema = SchemaFactory.createForClass(DeviceData);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DeviceDataDocument = DeviceData & Document;

@Schema({ timestamps: true })
export class DeviceData {
  @Prop({ required: true })
  deviceId: string;

  @Prop({ type: Object, required: false, default: {} })
  readings: Record<string, number>;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  date: Date;

  @Prop()
  topic: string;
}

export const DeviceDataSchema = SchemaFactory.createForClass(DeviceData);
