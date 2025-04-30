// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// import { AuthController } from './auth.controller';
// import { UserService } from '../../user.service';
// import { User, UserSchema } from '../../user.schema';
// import { AwsModule } from '../../aws/aws.module';
// import { JwtGuard } from './jwt.guard';

// @Module({
//   imports: [
//     MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
//     AwsModule, // For SnsService
//   ],
//   controllers: [AuthController],
//   providers: [UserService, JwtGuard],
//   exports: [JwtGuard], // Keep exporting JwtGuard if needed elsewhere
// })
// export class AuthModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { User, UserSchema } from '../user/schema/user.schema';
import { AwsModule } from '../../aws/aws.module';
import { JwtGuard } from './jwt.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AwsModule,
  ],
  controllers: [AuthController],
  providers: [UserService, JwtGuard],
  exports: [JwtGuard],
})
export class AuthModule {}
