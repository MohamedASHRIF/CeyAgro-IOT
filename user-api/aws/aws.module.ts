import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SNSClient } from '@aws-sdk/client-sns';
import { SnsService } from './../src/sns/sns.service';

@Module({
  imports: [ConfigModule],
  providers: [
    SnsService,
    {
      provide: 'SNS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const region = configService.get<string>('AWS_REGION');
        const accessKeyId = configService.get<string>('AWS_ACCESS_KEY_ID');
        const secretAccessKey = configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        );

        if (!region || !accessKeyId || !secretAccessKey) {
          throw new Error('AWS credentials or region not defined');
        }

        return new SNSClient({
          region,
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [SnsService],
})
export class AwsModule {}
