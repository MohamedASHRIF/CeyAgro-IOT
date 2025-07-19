// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';

// @Schema()
// export class User extends Document {
//   @Prop({ required: true, unique: true })
//   userId: string;

//   @Prop()
//   fcmToken?: string;
// }

// export const UserSchema = SchemaFactory.createForClass(User);



// // users/schemas/user.schema.ts
// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';

// @Schema({ timestamps: true })
// export class User {
//   @Prop({ required: true })
//   userId: string; // Email address (e.g., anjana@gmail.com)

//   @Prop()
//   fcmToken: string | null;
// }

// export type UserDocument = User & Document;
// export const UserSchema = SchemaFactory.createForClass(User);






import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  userId: string; // Email address (e.g., anjana@gmail.com)

  @Prop()
  fcmToken: string | null;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);