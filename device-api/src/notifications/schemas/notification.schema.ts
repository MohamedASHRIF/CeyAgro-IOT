// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';

// export type NotificationDocument = Notification & Document;

// @Schema()
// export class Notification {
//   @Prop({ required: true })
//   title: string;

//   @Prop({ required: true })
//   message: string;

//   // @Prop({ required: true })
//   // userId: string;

//   @Prop({ default: 'user123' })
//   userId: string;

//   @Prop({ required: true })
//   timestamp: string;
// }

// export const NotificationSchema = SchemaFactory.createForClass(Notification);

//notification.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema()
export class Notification {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  userId: string; // Email of the user (e.g., anjana@gmail.com)

  @Prop({ required: true })
  timestamp: string;

  @Prop({ default: false })
  read: boolean; // New field to track read status
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
