// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProtectedModule } from './protected/protected.module';
import { AwsModule } from 'aws/aws.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    AuthModule,
    ProtectedModule,
    AwsModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available globally
      envFilePath: '.env', // Explicitly specify .env file
      ignoreEnvFile: false, // Ensure .env is loaded
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI ||
        'mongodb+srv://wecode49:medXoomxMqjMz4ow@cluster0.4cf5g7r.mongodb.net/users_db?retryWrites=true&w=majority&appName=Cluster0',
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
