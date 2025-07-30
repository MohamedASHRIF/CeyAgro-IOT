// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { AuthModule } from './auth/auth.module';
// import { AwsModule } from 'aws/aws.module';
// import { ConfigModule } from '@nestjs/config';
// import { MongooseModule } from '@nestjs/mongoose';

// @Module({
//   imports: [
//     AuthModule,
//     AwsModule,
//     ConfigModule.forRoot({
//       isGlobal: true,
//       envFilePath: '.env',
//       ignoreEnvFile: false,
//     }),
//     MongooseModule.forRoot(process.env.MONGO_URI as string),
//   ],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
// import { AuthModule } from './auth/auth.module';
// import { AwsModule } from 'aws/aws.module';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: false,
    }),

    MongooseModule.forRoot(
      'mongodb+srv://mohamedashrif325:KxAkUSRhtKBED31z@cluster0.kvyf0cf.mongodb.net/users_db?retryWrites=true&w=majority&appName=Cluster0',
    ),

    // AuthModule,
    // AwsModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
