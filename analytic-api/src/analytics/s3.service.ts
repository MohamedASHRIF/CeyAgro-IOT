import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3Service {
  private s3: AWS.S3;


  // Constructor injects ConfigService to access environment variables
  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      region: this.configService.get<string>('AWS_REGION'),
    });
  }
//Uploads a file to an AWS S3 bucket and returns the file's location URL
  async uploadFile(
    buffer: Buffer,
    filename: string,
    contentType: string,
  ): Promise<string> {
    const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    if (!bucketName) {
      throw new InternalServerErrorException('AWS S3 bucket name is not defined');
    }
    // Define S3 upload parameters
    const params = {
      Bucket: bucketName,
      Key: `${filename}`,
      Body: buffer,
      ContentType: contentType,
      ACL: 'private',
    };
    // Upload the file to S3 and await the result
    const { Location } = await this.s3.upload(params).promise();
    return Location;
  }
//Generates a pre-signed URL for accessing a file in the S3 bucket
  getSignedUrl(key: string, expiresIn = 1800): string {
    const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    if (!bucketName) {
      throw new InternalServerErrorException('AWS S3 bucket name is not defined');
    }
    // Generate and return a pre-signed URL for the specified file
    return this.s3.getSignedUrl('getObject', {
      Bucket: bucketName,
      Key: key,
      Expires: expiresIn,
    });
  }


   //Deletes a file from the AWS S3 bucket

  async deleteFile(key: string): Promise<void> {

    // Retrieve the S3 bucket name from environment variables
    const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    
    // Check if bucket name is defined; throw error if not
    if (!bucketName) {
      throw new InternalServerErrorException('AWS S3 bucket name is not defined');
    }
    
    // Define S3 delete parameters
    const params = {
      Bucket: bucketName,
      Key: key,
    };

    try {
      // Delete the file from S3
      await this.s3.deleteObject(params).promise();
      console.log(`Deleted file from S3: ${key}`);
    } catch (error) {
      console.error('Failed to delete file from S3:', error);
      throw new InternalServerErrorException('Failed to delete file from S3');
    }
  }
}