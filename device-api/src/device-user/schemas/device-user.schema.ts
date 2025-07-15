// // schemas/device-user.schema.ts
// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';

// @Schema({ timestamps: true })
// export class DeviceUser {
//   @Prop({ required: true })
//   userId: string;

//   @Prop({ required: true })
//   deviceId: string;

//   @Prop({ required: true })
//   deviceName: string;

//   @Prop()
//   description: string;

//   @Prop()
//   deviceImage: string;

  
//   @Prop()
//   location: string;

//   @Prop()
//   deviceType: string;

//   @Prop()
//   serialNumber: string;

//   @Prop()
//   measurementUnit: string;

//   @Prop()
//   measurementParameter: string;
// }

// export type DeviceUserDocument = DeviceUser & Document;
// export const DeviceUserSchema = SchemaFactory.createForClass(DeviceUser);


// schemas/device-user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
  deviceType: string;

  @Prop()
  serialNumber: string;

  @Prop()
  measurementUnit: string;

  @Prop()
  measurementParameter: string;
}

export type DeviceUserDocument = DeviceUser & Document;
export const DeviceUserSchema = SchemaFactory.createForClass(DeviceUser);
