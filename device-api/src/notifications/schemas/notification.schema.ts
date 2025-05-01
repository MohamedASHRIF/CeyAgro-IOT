import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema()
export class Notification {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  // @Prop({ required: true })
  // userId: string;

  @Prop({ default: 'user123' })
  userId: string;

  @Prop({ required: true })
  timestamp: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
