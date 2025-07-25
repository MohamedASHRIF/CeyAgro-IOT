import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: User.name, schema: UserSchema }],
      'users_db',
    ),
  ],
  exports: [MongooseModule], // Export the MongooseModule to make User model available
})
export class UsersModule {}
