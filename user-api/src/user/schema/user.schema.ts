// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';

// @Schema()
// export class User extends Document {
//   @Prop({ required: true })
//   user_id: string;

//   @Prop({ required: true })
//   email: string;

//   @Prop()
//   name: string;

//   @Prop({ default: 0 })
//   login_count: number;

//   @Prop({ default: Date.now })
//   created_at: Date;

//   @Prop()
//   updated_at: Date;

//   @Prop()
//   last_login: Date;

//   @Prop({ type: Array, default: [] })
//   identities: any[];

//   @Prop({ type: Object, default: {} })
//   user_metadata: any;

//   @Prop()
//   nickname: string;

//   @Prop()
//   picture: string;

//   @Prop({
//     default: 'unsubscribed',
//     enum: ['unsubscribed', 'pending', 'subscribed'],
//   })
//   sns_subscription_status: string;

//   @Prop()
//   last_sns_subscription_attempt: Date;
// }

// export const UserSchema = SchemaFactory.createForClass(User);

// //hari eka

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  // Auth0 related fields
  @Prop({ required: true })
  user_id: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  name: string;

  @Prop({ default: 0 })
  login_count: number;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop()
  updated_at: Date;

  @Prop()
  last_login: Date;

  @Prop({ type: Array, default: [] })
  identities: any[];

  @Prop({ type: Object, default: {} })
  user_metadata: any;

  @Prop()
  nickname: string;

  // Profile fields
  @Prop()
  nic: string;

  @Prop()
  gender: string;

  @Prop()
  telephone: string;

  @Prop()
  address: string;

  @Prop({ type: String, default: null })
  picture: string | null;

  // SNS subscription fields
  @Prop({
    default: 'unsubscribed',
    enum: ['unsubscribed', 'pending', 'subscribed'],
  })
  sns_subscription_status: string;

  @Prop()
  last_sns_subscription_attempt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
